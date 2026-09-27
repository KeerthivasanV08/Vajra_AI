from __future__ import annotations

from collections import defaultdict
from datetime import datetime, timezone
from hashlib import md5
from typing import Any

from fastapi import APIRouter, Depends, HTTPException, Query

from app.services.account_service import AccountService
from app.services.cases.case_repository import case_repository
from app.realtime.transaction_memory_store import get_recent_transactions
from app.core.security import get_current_user


router = APIRouter(tags=["Accounts"])


def _mask_account_id(account_id: str) -> str:
    return f"{'*' * max(1, len(account_id) - 4)}{account_id[-4:]}"


def _mask_holder_name(name: str) -> str:
    return " ".join(f"{part[0]}{'*' * max(2, len(part) - 1)}" for part in name.split())


@router.get("/search")
async def search_accounts(q: str = Query(..., min_length=2), limit: int = Query(10, ge=1, le=50), user: dict = Depends(get_current_user)):
    query = q.strip()
    if len(query) < 2:
        raise HTTPException(status_code=422, detail="Search query must contain at least 2 characters")
    accounts = AccountService().search_accounts(search=query, limit=limit)
    open_cases: dict[str, str] = {}
    for case in case_repository.list_cases():
        account_id = str(case.get("user_id") or "").strip()
        status = str(case.get("status") or "").upper()
        if account_id and status not in {"CLOSED", "RESOLVED", "REJECTED"}:
            open_cases[account_id] = str(case.get("case_id") or "")

    results = []
    seen_account_ids: set[str] = set()
    for account in accounts["results"]:
        account_id = str(account.get("user_id") or "")
        if not account_id:
            continue
        seen_account_ids.add(account_id)
        holder_name = str(account.get("name") or "")
        risk_tier = account.get("risk_level")
        if not risk_tier and account.get("onboarding_risk_score") is not None:
            score = float(account["onboarding_risk_score"])
            risk_tier = "LOW" if score < 33 else "MEDIUM" if score < 66 else "HIGH"
        results.append({
            "account_id": account_id,
            "account_id_masked": _mask_account_id(account_id),
            "holder_name_masked": _mask_holder_name(holder_name),
            "bank": account.get("bank_name") or account.get("bank") or "Bank unavailable",
            "risk_tier": risk_tier,
            "linked_case_id": open_cases.get(account_id) or None,
        })
    # Transaction telemetry is also seeded data and commonly contains the
    # mule accounts before an onboarding/account-profile record exists.
    # Include its real sender/receiver IDs so the investigator search never
    # depends on a separate, potentially stale account index.
    for transaction in get_recent_transactions(limit=500):
        for account_id in (str(transaction.get("sender_id") or "").strip(), str(transaction.get("receiver_id") or "").strip()):
            if not account_id or account_id in seen_account_ids or query.lower() not in account_id.lower():
                continue
            seen_account_ids.add(account_id)
            results.append({
                "account_id": account_id,
                "account_id_masked": _mask_account_id(account_id),
                "holder_name_masked": "Profile unavailable",
                "bank": "Bank unavailable",
                "risk_tier": None,
                "linked_case_id": open_cases.get(account_id) or None,
            })
            if len(results) >= limit:
                return {"results": results}
    return {"results": results[:limit]}


@router.get("")
async def list_accounts(limit: int = 50, search: str | None = None, risk: str | None = None, offset: int = 0):
    """Return merged accounts from CSVs. Defaults to latest `limit` accounts sorted by created_at desc."""
    svc = AccountService()
    results = svc.search_accounts(search=search, risk=risk, limit=limit, offset=offset)
    return results


@router.get("/{account_id}")
async def get_account(account_id: str):
    svc = AccountService()
    account = svc.get_account(account_id)
    if not account:
        raise HTTPException(status_code=404, detail="Account not found")
    return account
