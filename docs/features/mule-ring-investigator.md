# Mule Ring Hop-by-Hop Investigator

The Mule Ring Investigator is an investigative console for tracing observed transaction hops. It distinguishes observed transaction evidence, Model 8 syndicate similarity, and Model 1-4 physical cash-out predictions. None of these investigative results changes SOP tiers, live risk scores, or automated account actions.

## Entry and context

The page is available at `/mule-ring-investigator` and accepts `accountId`/`account_id`, `caseId`/`case_id`, and `alertId`/`alert_id` query context. With no account it loads accounts from the existing `/api/accounts` service and provides a real selector. Case and alert identifiers are preserved as context; they are not fabricated when absent.

## Investigation data

`GET /api/v1/mule-trace/{case_id_or_account_id}` is the page-facing trace endpoint. It resolves an existing case or alert to its stored account when possible, then attempts Neo4j traversal before falling back to the checked-in transaction ledger and bounded recent transaction store. It returns observed transactions, chronological hops, and backend-calculated metrics. An account with no traceable recent transactions is shown as an honest empty state.

The page supports hop cards, transaction evidence rows, detail inspection, and links to existing account surfaces. Fan-out, flow amount, layering time, and terminal count are values returned by the backend service, not frontend constants.

## Model 8 and physical prediction

Model 8 uses the existing cosine-similarity syndicate centroid matcher through `GET /api/v1/mule-trace/{id}/syndicate-fingerprint`. The UI displays the raw similarity value and does not present it as a probability. The endpoint may use a documented neutral terminal-risk reference when observed graph-risk evidence is absent. Artifact or service failure returns an unavailable error rather than a fabricated pattern/confidence. Model 8 is investigative-only.

Physical terminals use the existing Model 1-4 pipeline through `GET /api/v1/mule-trace/{id}/predicted-terminals` when the account has the required observed geographic, behavioral, and network context. Candidate generation and node ranking remain backend-owned. The UI labels these nodes as predicted and not yet observed, and shows no candidate when required context or prediction output is unavailable. Each candidate can be opened in the existing Operations Map and node detail API.

## Audit and limitations

Trace, fingerprint, and physical prediction requests append their respective request events to the existing SHA-256 audit ledger with authenticated officer and available context identifiers. The page supports Operations Map handoff and predicted-node detail loading. Direct alert-to-account joins, multiple terminal graph paths, an investigator-specific audit timeline, and realtime investigation updates remain prototype limitations.
