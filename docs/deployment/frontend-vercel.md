# VAJRA AI Frontend on Vercel

## Deployment Configuration

VAJRA AI's frontend is a Vite/TanStack application deployed through the Nitro/Vercel integration. The browser talks directly to the FastAPI service on Render.

| Environment | `VITE_API_URL` |
| --- | --- |
| Development | `http://127.0.0.1:8000` |
| Production | `https://vajra-ai-0q3q.onrender.com` |
| Preview | `https://vajra-ai-0q3q.onrender.com` |

The value must contain only the backend origin. Do not append `/api` or `/api/v1`; the frontend services append their route paths themselves. Trailing slashes are normalized by the shared API configuration.

## Vercel Environment Variable

Create this client-visible Vercel variable for both **Production** and **Preview**:

```text
VITE_API_URL=https://vajra-ai-0q3q.onrender.com
```

`VITE_*` variables are intentionally public. They are embedded into browser JavaScript at build time and must not contain backend secrets.

## Build-Time Behavior

Vite evaluates `VITE_API_URL` while building the frontend. Changing the Vercel variable does not modify an existing deployment or an already-generated JavaScript bundle.

After changing the variable:

1. Save the variable for Production and Preview.
2. Trigger a new Vercel deployment from the intended branch.
3. Confirm the build completes with the Render origin available.
4. Open the new deployment, not an older deployment URL.
5. Inspect browser Network requests for the Render origin.

The production Vite configuration fails the build when `VITE_API_URL` is missing. It does not silently fall back to a local backend. Local development remains supported through `frontend/.env.development`.

## Central API Configuration

All normal HTTP services use the shared configuration in `frontend/src/lib/apiConfig.ts`. The request wrapper is `frontend/src/services/api/client.ts`; the legacy VAJRA service module also consumes the same base URL.

The following route families preserve the backend contract:

```text
/api/dashboard/metrics
/api/transactions/recent
/api/alerts
/api/alerts/p1
/api/alerts/queue
/api/alerts/escalations
/api/cases
/api/graph/network
```

The resulting production URL format is:

```text
https://vajra-ai-0q3q.onrender.com/api/alerts
```

It must not become `.../api/api/alerts` or use a localhost host.

## Realtime and SSE

The transaction and alert `EventSource` clients use the same shared API base configuration as REST requests:

```text
https://vajra-ai-0q3q.onrender.com/api/transactions/realtime
https://vajra-ai-0q3q.onrender.com/api/alerts/realtime
```

The UI preserves connected, disconnected, loading, error, and reconnecting states. It does not substitute mock events when Render is unavailable.

## Verification

From `frontend/`, build with the production origin supplied in the environment:

```powershell
$env:VITE_API_URL = "https://vajra-ai-0q3q.onrender.com"
npm run build
```

This project emits Nitro/Vercel output under `frontend/.output/`. Scan generated files for accidental API hosts:

```powershell
Get-ChildItem -Recurse .output -File |
  Select-String -Pattern "127\.0\.0\.1:8000|localhost:8000|http://127\.0\.0\.1|http://localhost"
```

The current build may contain framework-internal `localhost` placeholders used by SSR URL normalization. Those are not API client URLs. The production API client and both SSE clients must contain the Render origin and zero `127.0.0.1:8000` or `localhost:8000` API references.

Verify the deployed backend separately before diagnosing browser failures as frontend issues:

```text
https://vajra-ai-0q3q.onrender.com/docs
https://vajra-ai-0q3q.onrender.com/api/v1/health
```

If direct API requests succeed but browser requests fail with CORS errors, configure the exact Vercel origin in the Render backend's explicit `FRONTEND_ORIGINS` setting. CORS failures are distinct from `ERR_CONNECTION_REFUSED` caused by a stale localhost bundle.