# VAJRA AI — Frontend Component Matrix

**Project**: VAJRA AI — Predictive Cybercrime Cash-Out Interception Platform  
**Target Root**: `D:\Vajra_AI\frontend`  
**Date**: September 27, 2026  

---

| Component Name | File Path | Purpose / Description | Used By Pages / Modules | Data Source | Reusable | Responsive Design | Status |
| :--- | :--- | :--- | :--- | :--- | :---: | :---: | :---: |
| **RiskBadge** | `src/components/vajra/RiskBadge.tsx` | Semantic risk level badge (`IMMINENT`, `CRITICAL`, `WATCHLIST`, `NORMAL`) | Dashboard, Alerts, Operations Map, Nodes | Risk score / Risk tier | Yes | Yes | `READY` |
| **SOPTierBadge** | `src/components/vajra/SOPTierBadge.tsx` | Action tier badge (`MONITOR`, `SOFT-ALERT`, `RECOMMEND-HOLD`, `ESCALATE-FREEZE`, `OVERRIDE`) | Alert Center, SOP Triage, Officer Review | `SOPEvaluationResponse` | Yes | Yes | `READY` |
| **ConfidenceGauge**| `src/components/vajra/ConfidenceGauge.tsx` | Percentage progress ring/bar with semantic color coding | Prediction Cards, Tactical Brief | Trajectory / Model confidence | Yes | Yes | `READY` |
| **LeadTimeBadge** | `src/components/vajra/LeadTimeBadge.tsx` | Proactive interception countdown badge (e.g. 30 mins) | Dashboard, Alert Center, Field Mode | `predicted_time_window_mins` | Yes | Yes | `READY` |
| **TacticalBrief** | `src/components/vajra/TacticalBrief.tsx` | Persistent right detail drawer for cash-out withdrawal node | Operations Map, Node Management, Graph Explorer | `WithdrawalNode` | Yes | Yes (Drawer on mobile) | `READY` |
| **EvidenceHashBox**| `src/components/vajra/EvidenceHashBox.tsx` | SHA-256 evidence hash display with copy button & integrity status | Legal Dossier Vault, Audit Ledger | `evidence_sha256` / `payload_hash` | Yes | Yes | `READY` |
| **AuditChainStatus**| `src/components/vajra/AuditChainStatus.tsx` | Global cryptographic chain integrity status banner | Audit Ledger, Legal Dossier, Dashboard | `reverifyAuditChain()` | Yes | Yes | `READY` |
| **ReasonCodeList** | `src/components/vajra/ReasonCodeList.tsx` | List of explainability reason code badges | Alert Center, Officer Review, Case Detail | `reason_codes` | Yes | Yes | `READY` |
| **PredictionCandidateList** | `src/components/vajra/PredictionCandidateList.tsx` | Top-3 ranked candidate nodes card list with probabilities | Operations Map, Alert Center, Officer Review | `top_candidates` | Yes | Yes | `READY` |
| **ConfirmActionDialog** | `src/components/vajra/ConfirmActionDialog.tsx` | Confirmation modal for dispatch & bank step-up actions | Operations Map, Alert Center, Tactical Brief | Action handler callback | Yes | Yes | `READY` |
| **DispatchStatusBadge** | `src/components/vajra/DispatchStatusBadge.tsx` | Status badge (`REQUESTED`, `SENT`, `ACKNOWLEDGED`) | Officer Review, Field Mode | `DispatchResponse` | Yes | Yes | `READY` |
| **OperationsMapCanvas** | `src/components/vajra/OperationsMapCanvas.tsx` | Leaflet GIS interactive map with node markers & trajectory vectors | Operations Map (`/heatmap`), Field Mode | `fetchWithdrawalNodes()`, `fetchCorridors()` | Yes | Yes | `READY` |
| **MuleRingStepper** | `src/components/vajra/MuleRingStepper.tsx` | Visual hop-by-hop flow from Victim to Terminal Mule | Mule Ring Investigator | `matchSyndicate()` | Yes | Yes | `READY` |
| **SOPFusionStepper**| `src/components/vajra/SOPFusionStepper.tsx` | Visual weights breakdown (Digital 45%, Physical 35%, Context 20%) | SOP Triage, Officer Review | `evaluateSOP()` | Yes | Yes | `READY` |
| **NetworkGraph** | `src/components/NetworkGraph.tsx` | Cytoscape.js network graph canvas with node & edge inspection | Graph Explorer (`/graph`), Account 360 | `fetchGraphData()` | Yes | Yes | `PRESERVED` |
| **Sidebar** | `src/components/aml/Sidebar.tsx` | Structured navigation sidebar with section headers & route highlighting | Root Layout (`__root.tsx`) | TanStack Router state | Yes | Collapsible | `UPGRADED` |
| **Header** | `src/components/aml/Header.tsx` | Application header with VAJRA branding, SSE status, search, & profile | Root Layout (`__root.tsx`) | `store.get().connected` | Yes | Compact | `UPGRADED` |
| **SLATimer** | `src/components/aml/SLATimer.tsx` | P1/P2/P3 SLA countdown timer | Alert Center, SOP Triage | Alert SLA timestamp | Yes | Yes | `PRESERVED` |
| **Badges** | `src/components/aml/Badges.tsx` | Standard status & priority badges | Tables, Lists | Category/Priority strings | Yes | Yes | `PRESERVED` |
