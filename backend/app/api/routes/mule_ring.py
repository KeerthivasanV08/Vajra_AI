from fastapi import APIRouter, Depends, HTTPException, Query

from app.core.sanitizer import sanitize_for_json
from app.services.vajra.mule_ring_investigation_service import mule_ring_investigation_service
from app.services.vajra.investigation_context_service import (
    get_account_graph_features,
    get_account_prediction_context,
    get_latest_geo_session,
)
from app.services.vajra.physical_prediction_service import physical_prediction_service
from app.services.vajra.syndicate_service import syndicate_service
from app.services.account_service import AccountService
from app.services.cases.case_repository import case_repository
from app.services.audit.audit_chain_service import audit_chain_service
from app.core.security import get_current_user

router = APIRouter()


def _resolve_investigation(identifier: str) -> tuple[str, str | None, str | None]:
    case = case_repository.get_case(identifier)
    if case is None:
        case = next(
            (item for item in case_repository.list_cases()
             if str(item.get("source_alert_id") or "") == identifier),
            None,
        )
    if not case:
        if identifier.upper().startswith("CASE"):
            return "", identifier, None
        if identifier.upper().startswith("ALERT"):
            return "", None, identifier
        return identifier, None, None
    account_id = str(case.get("user_id") or case.get("account_id") or "")
    return account_id, str(case.get("case_id") or "") or None, str(case.get("source_alert_id") or "") or None


def _trace_payload(identifier: str) -> dict:
    account_id, case_id, alert_id = _resolve_investigation(identifier)
    if not account_id:
        status_reason = "Case is not linked to an account" if case_id else "Alert is not linked to a case/account" if alert_id else "Account identifier was not resolved"
        return {
            "case_id": case_id,
            "alert_id": alert_id,
            "account_id": "",
            "origin": None,
            "status": "EMPTY",
            "trace_source": "NONE",
            "graph_status": "NOT_RUN",
            "status_reason": status_reason,
            "kpis": {
                "hops_traced": 0,
                "fan_out_factor": None,
                "total_flow_value": None,
                "layering_time_min": None,
                "terminal_mule_count": 0,
            },
            "hops": [],
            "transactions": [],
            "predicted_terminal": None,
        }

    trace = mule_ring_investigation_service.investigate(account_id)
    source_kpis = trace.get("kpis", {})
    return {
        "case_id": case_id,
        "alert_id": alert_id,
        "account_id": account_id,
        "origin": trace.get("origin") or {"account_id": account_id, "role": "victim"},
        "status": trace.get("status", "EMPTY"),
        "trace_source": trace.get("trace_source"),
        "graph_status": trace.get("graph_status"),
        "status_reason": None,
        "kpis": {
            "hops_traced": source_kpis.get("hops_traced", 0),
            "fan_out_factor": source_kpis.get("fan_out_factor"),
            "total_flow_value": source_kpis.get("total_flow_value"),
            "layering_time_min": source_kpis.get("layering_time_mins"),
            "terminal_mule_count": source_kpis.get("terminal_mules", 0),
        },
        "hops": trace.get("hops", []),
        "transactions": trace.get("transactions", []),
        "predicted_terminal": None,
    }


@router.get("/mule-trace/{case_id_or_account_id}", summary="Trace account hops for a case or account")
def get_mule_trace(case_id_or_account_id: str, user: dict = Depends(get_current_user)):
    result = _trace_payload(case_id_or_account_id)
    audit_chain_service.append_event(
        "MULE_RING_TRACE_REQUESTED", result.get("account_id") or case_id_or_account_id,
        {"account_id": result.get("account_id"), "case_id": result.get("case_id"), "alert_id": result.get("alert_id"), "status": result.get("status")},
        str(user.get("user_id", "OFFICER_001_DEFAULT")),
    )
    return sanitize_for_json(result)


@router.get("/mule-trace/{case_id}/syndicate-fingerprint", summary="Match traced activity against Model 8 patterns")
def get_syndicate_fingerprint(case_id: str, user: dict = Depends(get_current_user)):
    trace = _trace_payload(case_id)
    if not trace["hops"]:
        return {"patterns": [], "status": "EMPTY", "reason": trace.get("status_reason") or "No observed multi-hop transactions for this account"}

    transactions = trace["transactions"]
    velocities = [item["velocity_mins"] for item in transactions if item.get("velocity_mins") is not None]
    kpis = trace["kpis"]
    average_velocity = sum(velocities) / len(velocities) if velocities else 0.0
    # The terminal reference is sourced from observed graph risk when present.
    # When no graph-risk evidence exists for the terminal account, we fall back
    # to a neutral 0.5 reference score and append an investigative disclaimer
    # so the officer is aware that confidence values are estimates only.
    terminal_account = transactions[-1].get("to_account") if transactions else None
    terminal_features = get_account_graph_features(terminal_account or "") or {}
    terminal_risk = terminal_features.get("graph_score")
    if terminal_risk in (None, ""):
        terminal_risk = transactions[-1].get("graph_score") if transactions else None
    estimated_terminal_risk = terminal_risk is None
    if terminal_risk is None:
        terminal_risk = 0.5  # neutral fallback — no observed graph risk for terminal
    try:
        result = syndicate_service.match_syndicate_fingerprint({
            "account_id": trace["account_id"],
            "hop_count": kpis["hops_traced"],
            "fan_out_factor": kpis["fan_out_factor"] or 1.0,
            "layering_time_mins": kpis["layering_time_min"] or 0.0,
            "average_interhop_velocity_mins": average_velocity,
            "terminal_node_risk_reference": float(terminal_risk),
        })
    except RuntimeError as exc:
        audit_chain_service.append_event("MULE_RING_FINGERPRINT_FAILED", trace["account_id"], {"account_id": trace["account_id"], "case_id": trace["case_id"], "status": "UNAVAILABLE"}, str(user.get("user_id", "OFFICER_001_DEFAULT")))
        raise HTTPException(status_code=503, detail="Model 8 fingerprint analysis is unavailable") from exc
    features = [
        f"{kpis['hops_traced']} observed hops",
        f"{kpis['fan_out_factor'] or 1.0:g}x fan-out factor",
        f"{kpis['layering_time_min'] or 0.0:g} minutes layering time",
        f"{average_velocity:g} minutes average transfer velocity",
    ]
    if estimated_terminal_risk:
        features.append(
            "Terminal node risk reference is estimated (0.5 neutral) — "
            "no observed graph-risk evidence for this terminal account"
        )
    matches = result.get("top_matches") or [{
        "pattern_type": result.get("pattern_name", "Unknown pattern"),
        "similarity_score": result.get("match_confidence"),
    }]
    response = {
        "patterns": [{
            "pattern_name": match.get("pattern_type", "Unknown pattern"),
            "match_confidence": match.get("similarity_score"),
            "matching_features": features,
        } for match in matches],
        "status": "SUCCESS",
    }
    audit_chain_service.append_event("MULE_RING_FINGERPRINT_REQUESTED", trace["account_id"], {"account_id": trace["account_id"], "case_id": trace["case_id"], "patterns": len(response["patterns"])}, str(user.get("user_id", "OFFICER_001_DEFAULT")))
    return sanitize_for_json(response)


@router.get("/mule-trace/{case_id}/predicted-terminals", summary="Rank predicted physical cash-out terminals")
def get_predicted_terminals(case_id: str, user: dict = Depends(get_current_user)):
    trace = _trace_payload(case_id)
    if not trace["account_id"]:
        return {"candidates": [], "status": "UNAVAILABLE", "reason": trace.get("status_reason")}
    context = get_account_prediction_context(trace["account_id"])
    if not context:
        # Distinguish: account exists but geo session is missing vs. full profile missing
        geo_session = get_latest_geo_session(trace["account_id"])
        if not geo_session:
            reason = (
                "No geographic session data is linked to this account. "
                "Physical cash-out prediction requires an observed device session with GPS coordinates."
            )
        else:
            reason = (
                "Incomplete behavioral feature context for this account. "
                "Velocity, onboarding profile, or spatial features are missing."
            )
        return {"candidates": [], "status": "UNAVAILABLE", "reason": reason}

    graph_features = context.get("graph_features") or {}
    risk_transaction = next(
        (item for item in reversed(trace["transactions"]) if item.get("network_risk_score") is not None or item.get("final_score") is not None),
        {},
    )
    digital_risk_score = risk_transaction.get("final_score")
    if digital_risk_score is None:
        digital_risk_score = risk_transaction.get("network_risk_score")
    if digital_risk_score is None:
        digital_risk_score = graph_features.get("graph_score")
    cluster_flag = graph_features.get("mule_cluster_flag")
    if digital_risk_score in (None, "") or cluster_flag in (None, ""):
        return {
            "candidates": [], "status": "UNAVAILABLE",
            "reason": (
                "Graph-risk score or mule-cluster flag is absent for this account. "
                "Physical prediction requires observed network-risk evidence."
            ),
        }

    try:
        prediction = physical_prediction_service.execute_physical_prediction(
            account_id=trace["account_id"], geo_lat=context["geo_lat"], geo_lon=context["geo_lon"],
            session_data=context,
            digital_risk_score=float(digital_risk_score),
            mule_probability=float(cluster_flag),
        )
    except Exception as exc:
        raise HTTPException(status_code=503, detail="Physical cash-out prediction is unavailable") from exc
    candidates = prediction.get("top_candidates") or prediction.get("candidates") or []
    ranked = []
    for index, node in enumerate(candidates[:3], start=1):
        confidence = node.get("ranker_score")
        if confidence is None:
            continue
        confidence_pct = float(confidence) * 100 if confidence is not None and float(confidence) <= 1 else confidence
        ranked.append({
            "rank": node.get("final_rank") or index,
            "node_id": node.get("node_id"),
            "distance_from_corridor_km": node.get("distance_to_known_corridor_km") or node.get("candidate_distance_km"),
            "confidence_pct": confidence_pct,
        })
    audit_chain_service.append_event("MULE_RING_PHYSICAL_PREDICTION_REQUESTED", trace["account_id"], {"account_id": trace["account_id"], "case_id": trace["case_id"], "candidates": len(ranked)}, str(user.get("user_id", "OFFICER_001_DEFAULT")))
    return sanitize_for_json({"candidates": ranked, "status": "SUCCESS" if ranked else "EMPTY", "reason": None if ranked else "No physical cash-out candidates were generated"})


@router.get("/mule-ring/investigate", summary="Trace an account through available transaction hops")
def investigate_mule_ring(
    account_id: str = Query(..., min_length=1),
    max_hops: int = Query(20, ge=1, le=20),
    case_id: str | None = Query(None),
    alert_id: str | None = Query(None),
    user: dict = Depends(get_current_user),
):
    result = mule_ring_investigation_service.investigate(account_id, max_hops=max_hops)
    result["account"] = AccountService().get_account(account_id)
    result["case_context"] = {"case_id": case_id, "alert_id": alert_id}
    audit_chain_service.append_event(
        "MULE_RING_INVESTIGATION_OPENED",
        account_id,
        {"account_id": account_id, "case_id": case_id, "alert_id": alert_id, "status": result.get("status")},
        str(user.get("user_id", "OFFICER_001_DEFAULT")),
    )
    return sanitize_for_json(result)
