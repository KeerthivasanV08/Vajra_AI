# Mule Ring Hop-by-Hop Investigator

The Mule Ring Investigator is an investigative console for tracing observed transaction hops. It distinguishes observed transaction evidence, Model 8 syndicate similarity, and Model 1-4 physical cash-out predictions. None of these investigative results changes SOP tiers, live risk scores, or automated account actions.

## Entry and context

The page is available at `/mule-ring-investigator` and accepts `accountId`/`account_id`, `caseId`/`case_id`, and `alertId`/`alert_id` query context. With no account it loads accounts from the existing `/api/accounts` service and provides a real selector. Case and alert identifiers are preserved as context; they are not fabricated when absent.

## Investigation data

`GET /api/v1/mule-trace/{case_id_or_account_id}` is the page-facing trace endpoint. It resolves an existing case or alert to its stored account when possible, then uses the bounded recent transaction store to return observed transactions, chronological hops, and deterministic metrics. The current prototype does not have a connected Neo4j traversal for this service. An account with no traceable recent transactions is shown as an honest empty state.

The page supports hop cards, transaction evidence rows, detail inspection, and links to existing account surfaces. Fan-out, flow amount, layering time, and terminal count are values returned by the backend service, not frontend constants.

## Model 8 and physical prediction

Model 8 uses the existing cosine-similarity syndicate centroid matcher through `GET /api/v1/mule-trace/{id}/syndicate-fingerprint`. Its terminal graph-risk feature is sourced from the observed terminal transaction; without that observed feature the endpoint returns no match rather than using a fixed synthetic value. Artifact or service failure returns an unavailable error rather than a fabricated pattern/confidence. Model 8 is investigative-only.

Physical terminals use the existing `POST /api/v1/prediction/cashout` Model 1-4 pipeline when the observed origin transaction has coordinates. Candidate generation and node ranking remain backend-owned. No candidate is displayed when the required observed coordinates or prediction result are unavailable.

## Audit and limitations

Trace, fingerprint, and physical prediction requests append their respective request events to the existing SHA-256 audit ledger with authenticated officer and available context identifiers. Neo4j traversal, complete account/case/alert joins, multiple terminal graph paths, Operations Map handoff, and realtime investigation updates are not currently provided by the prototype data/service path.
