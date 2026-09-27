# Feature — Cryptographic SHA-256 Audit Chain Ledger

> **Implementation**: `backend/app/services/audit/audit_chain_service.py`

---

## 1. Overview & Tamper-Evident Hashing

The Cryptographic Audit Chain maintains an append-only, block-linked audit ledger for all major platform actions (case analysis, dispatch triggers, dossier generation, account freeze requests).

---

## 2. Block Structure & Linkage

Each audit event block contains:

- `event_id`: Unique string ID (`EVENT_XXXXXXXXXX`).
- `timestamp`: ISO-8601 UTC timestamp.
- `officer_id`: Issuing officer or system identifier.
- `action_type`: Operational action category.
- `target_entity`: Case, node, or account reference.
- `payload_hash`: SHA-256 hash of event payload dictionary:
  $$\text{payload\_hash} = \text{SHA256}(\text{json\_canonical}(payload))$$
- `previous_hash`: SHA-256 hash of preceding block event (`GENESIS_PREVIOUS_HASH` for block #0).
- `event_hash`: SHA-256 hash of current block body:
  $$\text{event\_hash} = \text{SHA256}(\text{action\_type} \parallel \text{officer\_id} \parallel \text{payload\_hash} \parallel \text{previous\_hash} \parallel \text{target\_entity} \parallel \text{timestamp})$$

---

## 3. Re-Verification Algorithm

The `reverify_chain()` method iterates through all block events in sequence:
1. Validates that `block[i].previous_hash == block[i-1].event_hash`.
2. Re-computes `recomputed_hash` for `block[i]` body and asserts equality with `block[i].event_hash`.
3. If any discrepancy is detected, re-verification fails immediately, identifying the tampered event ID and index.
