# VAJRA AI Backend on Render

## Render Service

- **Service type:** Web Service
- **Root directory:** `backend`
- **Build command:** `pip install -r requirements.txt`
- **Start command:** `python -m uvicorn main:app --host 0.0.0.0 --port $PORT`
- **Python version:** 3.11.8, pinned by `backend/.python-version` and verified with the repository virtual environment
- **Health check path:** `/api/v1/health/ready`

The start command uses Render's assigned `PORT`; Uvicorn binds to `0.0.0.0`. For local development from `backend/`, run `python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload` and open `http://localhost:8000/docs`.

## Environment Variables

| Variable | Requirement | Purpose |
| --- | --- | --- |
| `ENVIRONMENT` | Required: `production` | Enables production configuration checks. |
| `JWT_SECRET` | Required; set in Render's secret environment variables | Secret used to sign JWTs. Generate a unique high-entropy value; never commit it. Production startup fails if it is unset. |
| `FRONTEND_ORIGINS` | Required for deployed frontend | Comma-separated exact frontend origins, for example `https://console.example.com`. `CORS_ORIGINS` is accepted as an alias. |
| `DEBUG` | Recommended: `false` | Debug mode is off by default. |
| `LOG_LEVEL` | Optional; default `INFO` | Application log level. |
| `PORT` | Supplied by Render | Port consumed by the start command; do not hardcode a production port. |
| `DATABASE_MODE` | Optional; default `csv` | Current backend runtime uses CSV/file-backed storage. |
| `NEO4J_URI`, `NEO4J_USER`, `NEO4J_PASSWORD` | Optional unless Neo4j is provisioned | Configure all three to enable the graph database. Without them, graph capabilities report degraded/unavailable rather than blocking startup. |

When `FRONTEND_ORIGINS`/`CORS_ORIGINS` is unset, the local development origins (`localhost` and `127.0.0.1` on ports 3000, 5173, and 8080) remain allowed. Set the deployed frontend's exact origin in Render; origins are not wildcarded.

## Runtime Files

- **Datasets and file-backed runtime state:** `backend/data/`. Paths are anchored from the backend source files, not the process working directory. Bundled raw, processed, and reference CSV/JSON inputs are part of the backend checkout.
- **VAJRA predictive artifacts:** `backend/models/*.joblib`.
- **Digital Risk artifacts:** `backend/app/models/onboarding/` and `backend/app/models/transaction/`, including the LSTM model and its scaler/metadata.
- **Evaluation metadata:** `backend/evaluation/`.

Required model artifacts are checked during startup. Missing Digital Risk models or required VAJRA artifacts prevent the service from becoming ready; the application does not substitute mocks.

Cash-out prediction, master analysis, and live-attack simulation require observed trajectory context in `session_data`: prior coordinates (`previous_geo_lat`/`previous_geo_lon` or `prev_lat`/`prev_lon`), `time_since_previous_session_sec` (or `time_since_previous_sec`), and `geo_accuracy_km`. The checked-in geo-session CSV can provide this data for local demonstrations.

The current trajectory artifact predicts synthetic `CELL_###` district tokens, not H3 indexes. Runtime resolves those tokens to coordinate centroids from `backend/data/processed/spatial/ip_geo_sessions_clean.csv`; these prototype locations and model metrics are not a substitute for validation on operational geographic data.

## Health and Deployment Notes

`GET /api/v1/health/ready` returns a meaningful readiness payload and HTTP 503 when a required VAJRA model artifact is missing. The lifespan also validates the Digital Risk model bundles before serving traffic. `GET /api/v1/health` is the basic liveness endpoint.

The backend currently uses CSV files for its audit ledger and other mutable runtime state under `backend/data`. Render's default filesystem is ephemeral, so generated audit/case/runtime records may not survive restarts or redeploys. Treat the deployed CSV ledger as non-durable unless a persistent storage strategy is separately configured; do not mount an empty disk over `backend/data`, because that would hide the bundled datasets.

Neo4j is optional. Configure it through Render secrets only when a Neo4j service is available. The model and dataset files referenced above must be present in the deployed repository. TensorFlow and the checked-in ML artifacts make builds and memory use materially larger than a lightweight FastAPI service; allow sufficient build/runtime resources.

Authentication is still a prototype: the login route does not verify passwords, and unauthenticated requests can receive a development officer identity. Do not expose this service to real users or sensitive data until a real identity provider and authorization policy are integrated; restrict access to the Render service in the meantime.
