# Beat Officer Mode

Beat Officer Mode is a field execution surface for an authenticated law-enforcement officer. It does not fabricate assignments: when no persisted dispatch event belongs to the officer, it shows an honest empty state.

## Workflow

The backend-owned lifecycle is `DISPATCHED -> EN_ROUTE -> ON_SITE -> ACTION_TAKEN`. The current officer is resolved from authentication through `GET /api/v1/field/active-dispatch`; the legacy officer-path endpoint remains identity-checked for compatibility.

Status updates use `PATCH /api/v1/field/dispatch/{dispatch_id}/status`. The backend validates ownership, transition order, GPS bounds, timestamp, and an idempotency key before appending to `backend/data/operations/dispatch_events.csv` and the SHA-256 audit ledger.

Outcome reporting uses `POST /api/v1/field/dispatch/{dispatch_id}/outcome`. The authenticated officer, actual outcome, ground-truth flag, notes, and submission timestamp are persisted and audited.

Dispatch deadlines are created by the backend from `DISPATCH_SLA_MINUTES`, persisted with target coordinates in the dispatch event CSV, and recalculated by the UI from the returned deadline after reload. Active assignments are enriched from the same withdrawal-node registry used by Node Management. GPS and the existing Leaflet map are used when browser permissions and connectivity allow; navigation is disabled when target coordinates are unavailable. Offline status actions are queued locally with idempotency keys and display `Saved offline - will sync` until synchronization succeeds.

Existing legacy dispatch rows may have no case, deadline, or target coordinates; the UI reports those values as `CASE NOT LINKED`, `NO DEADLINE ASSIGNED`, or `DESTINATION LOCATION UNAVAILABLE`. New PCR dispatches persist the available target coordinates and deadline. Bank nodal contact remains unavailable unless a real contact field is supplied by backend data.