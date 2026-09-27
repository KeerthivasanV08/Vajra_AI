from fastapi import APIRouter
from app.realtime.transaction_memory_store import DASHBOARD_METRICS, LIVE_TRANSACTIONS, LIVE_ALERTS
from app.services.cases.case_repository import case_repository

router = APIRouter(tags=["Dashboard"])


@router.get("/metrics")
async def metrics():
    res = dict(DASHBOARD_METRICS)
    # If realtime SSE has not published yet, populate from live buffers
    if res.get("total_transactions", 0) == 0 and len(LIVE_TRANSACTIONS) > 0:
        res["total_transactions"] = len(LIVE_TRANSACTIONS)
        res["high_risk_count"] = sum(
            1 for t in LIVE_TRANSACTIONS
            if float(t.get("riskScore") or t.get("risk_score") or 0) >= 0.70
        )
        res["blocked_transactions"] = sum(
            1 for t in LIVE_TRANSACTIONS
            if str(t.get("decision") or "").upper() in ("BLOCK", "DECLINE")
        )
        res["review_queue"] = sum(
            1 for t in LIVE_TRANSACTIONS
            if str(t.get("decision") or "").upper() in ("ESCALATE", "REVIEW")
        )

    try:
        cases = case_repository.list_cases()
        res["cases"] = len(cases)
    except Exception:
        res["cases"] = res.get("cases", 0)

    try:
        res["active_alerts"] = len(LIVE_ALERTS)
    except Exception:
        pass

    return res
