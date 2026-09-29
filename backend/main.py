"""
VAJRA AI — Defensive Intelligence & Cybercrime Interception Platform.

Architecture:
  - Digital Risk Core: routes under /api/* (onboarding, transactions, alerts, cases, graph, dashboard, reports)
  - VAJRA Predictive Core: routes under /api/v1/* (prediction, SOP, nodes, corridors, dispatch, legal, audit, fairness, syndicate, simulation, metrics)

Preserves original digital AML routes and services while orchestrating VAJRA v1 predictive interception.
"""

from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

# ─── CORE ──────────────────────────────────────────────────────────────────
from app.core.config import settings
from app.core.logging import logger
from app.core.exceptions import VajraBaseException

# ─── DIGITAL RISK CORE INITIALIZERS ─────────────────────────────────────────
from app.core.storage_paths import initialize_storage_directories

initialize_storage_directories()

from app.core.runtime_context import initialize_runtime_session
from app.core.policy_engine import get_policy_engine

runtime_session = initialize_runtime_session()
policy_engine = get_policy_engine()

from app.realtime.transaction_memory_store import initialize_runtime_store

initialize_runtime_store()

from app.services.transaction.audit_service import initialize_transaction_audit_storage

initialize_transaction_audit_storage()

# ─── DIGITAL AML ML RUNTIME ───────────────────────────────────────────────────
from app.core.model_loader import initialize_model_runtime, get_model_loader

# ─── REALTIME ENGINE (optional — degrades gracefully if TF/NumPy are incompatible) ──
_realtime_router = None
_alerts_realtime_router = None
_start_realtime_engine_once = None

# Keep the realtime loop completely deferred until an explicit request or operation
# requires it. Loading the realtime ML stack during app startup is exactly what
# triggers the Render Free startup OOM.
try:
    from app.realtime.transaction_streamer import router as realtime_router
    from app.realtime.alerts_streamer import router as alerts_realtime_router
    _realtime_router = realtime_router
    _alerts_realtime_router = alerts_realtime_router
except Exception as _rt_exc:
    import logging
    logging.getLogger("vajra.startup").warning(
        f"⚠️  Realtime transaction streaming engine not available (TF/model incompatibility): {_rt_exc}"
    )

# ─── SLA MONITOR (optional) ────────────────────────────────────────────────
_sla_monitor = None
try:
    from app.services.officer.sla_breach_monitor import sla_breach_monitor as _sla_monitor
except Exception as _sla_exc:
    import logging
    logging.getLogger("vajra.startup").warning(f"⚠️  SLA breach monitor unavailable: {_sla_exc}")

# ─── DIGITAL RISK CORE ROUTERS (each guarded — degrade gracefully if models missing) ──
_digital_routers: dict = {}

def _try_import_router(name: str, import_path: str, router_alias: str) -> None:
    """Attempt to import a Digital Risk Core router; log and skip on failure."""
    import importlib
    try:
        mod = importlib.import_module(import_path)
        _digital_routers[name] = getattr(mod, router_alias)
    except Exception as exc:
        import logging
        logging.getLogger("vajra.startup").warning(
            f"⚠️  Digital Risk router '{name}' unavailable (running in degraded fallback mode): {type(exc).__name__}: {exc}"
        )
        _digital_routers[name] = None

_try_import_router("onboarding",  "app.api.onboarding_routes",  "router")
_try_import_router("health",      "app.api.health_routes",      "router")
_try_import_router("officer",     "app.api.officer_routes",     "router")
_try_import_router("transaction", "app.api.transaction_routes", "router")
_try_import_router("accounts",    "app.api.accounts_routes",    "router")
_try_import_router("graph",       "app.api.graph_routes",       "router")
_try_import_router("dashboard",   "app.api.dashboard_routes",   "router")
_try_import_router("alerts",      "app.api.alerts_routes",      "router")
_try_import_router("cases",       "app.api.case_routes",        "router")
_try_import_router("tv_reports",  "app.api.v1.reports",         "router")

# ─── VAJRA v1 ROUTER ───────────────────────────────────────────────────────
from app.api.router import api_router as vajra_v1_router


# ───────────────────────────────────────────────────────────────────────────
# LIFESPAN
# ───────────────────────────────────────────────────────────────────────────

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Unified startup/shutdown handler for VAJRA AI platform."""

    logger.info("=" * 65)
    logger.info("🚀  VAJRA AI Platform — Starting")
    logger.info(f"    Version   : {settings.APPLICATION_VERSION}")
    logger.info(f"    Env       : {settings.ENVIRONMENT}")
    logger.info(f"    DB Mode   : {settings.DATABASE_MODE}")
    logger.info(f"    Synthetic : {settings.SYNTHETIC_DATA_MODE}")
    logger.info("=" * 65)

    # ── 1. Digital AML risk runtime (lazy startup for Render free memory budget) ──
    try:
        startup_health = initialize_model_runtime(strict=False)
        app.state.digital_model_health = startup_health
        app.state.runtime_mode = startup_health.get("runtime_mode", "LAZY")
        app.state.runtime_session_id = runtime_session.runtime_session_id
        app.state.started_at = runtime_session.started_at
        app.state.policy_version = policy_engine.get_policy_version()

        _report_digital_health(startup_health)
    except Exception as exc:
        logger.error(f"❌ Digital ML startup snapshot failed: {exc}")
        app.state.runtime_mode = "LAZY"

    # ── 2. VAJRA ML artifact health check (non-blocking during lazy startup) ─────
    try:
        from app.ml.model_loader import model_loader as vajra_model_loader
        vajra_health = vajra_model_loader.check_health()
        app.state.vajra_model_health = vajra_health
        all_ok = vajra_health.get("all_healthy", False)
        for model_name, is_ok in vajra_health.get("models_status", {}).items():
            icon = "✅" if is_ok else "❌"
            logger.info(f"    {icon} VAJRA Model [{model_name}]: {'present' if is_ok else 'MISSING'}")
        if not all_ok:
            logger.warning("⚠️  Some VAJRA core ML artifacts are missing; they will load on demand when a model-backed route is used.")
    except Exception as exc:
        logger.warning(f"⚠️  VAJRA model health check unavailable during lazy startup: {exc}")

    # ── 3. Realtime engine is intentionally deferred to keep startup under the
    # Render Free memory ceiling. The engine may still be started explicitly by a
    # route or operational workflow when the model stack is needed.
    logger.info("ℹ️  Realtime engine startup deferred until runtime demand")

    # ── 4. SLA monitoring ──────────────────────────────────────────────────
    if _sla_monitor is not None:
        try:
            _sla_monitor.start_monitoring()
            logger.info("✅  SLA breach monitoring started")
        except Exception as exc:
            logger.warning(f"⚠️  SLA monitoring not started: {exc}")
    else:
        logger.warning("⚠️  SLA monitor skipped (unavailable)")

    logger.info("✅  All services initialized — API ready")
    logger.info(f"    Docs: http://{settings.HOST}:{settings.PORT}/docs")
    logger.info("=" * 65)

    yield

    # ── Shutdown ───────────────────────────────────────────────────────────
    logger.info("🛑  VAJRA AI — Shutdown initiated")
    if _sla_monitor is not None:
        try:
            _sla_monitor.stop_monitoring()
        except Exception:
            pass
    logger.info("🛑  Shutdown complete")


def _report_digital_health(health: dict) -> None:
    """Log Digital Risk Core model health."""
    artifacts = health.get("artifacts", {})
    for key in ("behavioral_model", "sequence_model", "graph_engine"):
        if health.get(key) == "healthy":
            logger.info(f"    ✅  Digital Risk [{key}]: healthy")
        else:
            artifact = artifacts.get(key, "unknown") if isinstance(artifacts, dict) else "unknown"
            reason = artifact.get("reason", "unknown") if isinstance(artifact, dict) else artifact
            logger.warning(f"    ⚠️  Digital Risk [{key}]: {reason}")
    logger.info(f"    🔧  Runtime mode: {health.get('runtime_mode', 'UNKNOWN')}")


# ───────────────────────────────────────────────────────────────────────────
# FASTAPI APPLICATION
# ───────────────────────────────────────────────────────────────────────────

app = FastAPI(
    title="VAJRA — Predictive Cybercrime Cash-Out Interception Platform",
    version=settings.APPLICATION_VERSION,
    description=(
        "VAJRA AI is an enterprise-grade predictive cybercrime analytics and cash-out interception platform. "
        "It intercepts cash-out fraud through physical + digital risk fusion, "
        "SOP-driven operational dispatch, legal dossier generation, and a cryptographic audit chain. "
        "All VAJRA predictions run on synthetic prototype datasets."
    ),
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
)


# ───────────────────────────────────────────────────────────────────────────
# MIDDLEWARE
# ───────────────────────────────────────────────────────────────────────────

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_origin_regex=settings.CORS_ORIGIN_REGEX,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ───────────────────────────────────────────────────────────────────────────
# DOMAIN EXCEPTION HANDLERS
# ───────────────────────────────────────────────────────────────────────────

@app.exception_handler(VajraBaseException)
async def vajra_exception_handler(request: Request, exc: VajraBaseException):
    logger.error(
        "Request failed code=%s method=%s path=%s",
        exc.code,
        request.method,
        request.url.path,
        exc_info=(type(exc), exc, exc.__traceback__),
    )
    return JSONResponse(
        status_code=400,
        content={
            "error": exc.code,
            "message": "The request could not be completed."
        }
    )


@app.exception_handler(Exception)
async def unexpected_exception_handler(request: Request, exc: Exception):
    logger.error(
        "Unhandled request failure method=%s path=%s",
        request.method,
        request.url.path,
        exc_info=(type(exc), exc, exc.__traceback__),
    )
    return JSONResponse(
        status_code=500,
        content={
            "error": "INTERNAL_ERROR",
            "message": "An unexpected server error occurred."
        }
    )


# ───────────────────────────────────────────────────────────────────────────
# DIGITAL RISK CORE ROUTES  (/api/*)
# ───────────────────────────────────────────────────────────────────────────

def _mount(router, prefix: str, tags: list) -> None:
    """Mount a router only if it was loaded successfully."""
    if router is not None:
        app.include_router(router, prefix=prefix, tags=tags)

_mount(_digital_routers.get("onboarding"),   "/api/onboarding",   ["Onboarding AML"])
_mount(_digital_routers.get("transaction"),  "/api/transactions", ["Transaction AML"])
_mount(_digital_routers.get("accounts"),     "/api/accounts",     ["Accounts"])

# Realtime SSE (optional — requires TF-compatible NumPy)
_mount(_realtime_router,         "/api/transactions", ["Realtime Stream"])
_mount(_alerts_realtime_router,  "/api/alerts",       ["Alerts Realtime"])

_mount(_digital_routers.get("graph"),        "/api/graph",      ["Graph Analysis"])
_mount(_digital_routers.get("dashboard"),    "/api/dashboard",  ["Dashboard"])
_mount(_digital_routers.get("alerts"),       "/api/alerts",     ["Alerts"])
_mount(_digital_routers.get("cases"),        "/api/cases",      ["Cases"])
_mount(_digital_routers.get("tv_reports"),   "/api",            ["Digital AML Reports"])
_mount(_digital_routers.get("health"),       "/api",            ["Platform Health"])
_mount(_digital_routers.get("officer"),      "/api/officer",    ["Officer Review"])

# Render probes the conventional root health path. Reuse the existing lightweight
# Digital Risk health handler without exposing model readiness work at this path.
if _digital_routers.get("health") is not None:
    from app.api.health_routes import health_check

    app.add_api_route("/health", health_check, methods=["GET"], tags=["Platform Health"])


# ───────────────────────────────────────────────────────────────────────────
# VAJRA v1 ROUTES  (/api/v1/*)
# ───────────────────────────────────────────────────────────────────────────

app.include_router(vajra_v1_router, prefix=settings.API_PREFIX)


# ───────────────────────────────────────────────────────────────────────────
# ROOT
# ───────────────────────────────────────────────────────────────────────────

@app.get("/", tags=["Root"])
def root():
    return {
        "platform": "VAJRA AI Cybercrime Interception Platform",
        "version": settings.APPLICATION_VERSION,
        "environment": settings.ENVIRONMENT,
        "docs": "/docs",
        "digital_risk_api": "/api",
        "predictive_api": settings.API_PREFIX,
        "status": "running"
    }