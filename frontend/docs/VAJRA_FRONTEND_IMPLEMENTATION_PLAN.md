# VAJRA AI — Frontend Implementation Plan

**Project**: VAJRA AI — Predictive Cybercrime Cash-Out Interception Platform  
**Target Root**: `D:\Vajra_AI\frontend`  
**Date**: September 27, 2026  

---

## Executive Summary & Architecture Strategy
This document outlines the phased implementation plan for the **VAJRA AI Operational Intelligence Console**. The implementation preserves 100% of working Digital AML functionality while adding physical predictive intelligence, GIS operations maps, SOP triage workflows, cryptographic audit ledgers, legal dossier generation, and beat officer mobile interfaces.

---

## Phased Execution Roadmap

### Phase 1: Preserve Digital AML Core & Extend API Layer
- Preserve existing routes (`/`, `/transaction-flow`, `/alerts`, `/graph`, `/investigation`, `/officer-review`, `/cases`, `/reports`, `/accounts`, `/settings`).
- Create comprehensive TypeScript interfaces for VAJRA endpoints in `src/types/vajra.ts` (Predictions, Nodes, Corridors, SOP Evaluations, Dispatches, Legal Dossiers, Audit Events, Fairness Summaries).
- Extend `src/services/api.ts` with dedicated client functions targeting `/api/v1/*` backend endpoints.
- Update `src/store/realtime.ts` to manage VAJRA prediction events, dispatches, audit chain status, and simulation feeds.

### Phase 2: Design System & Design Tokens
- Extend `src/styles.css` with semantic color tokens (`--vajra-bg`, `--vajra-surface`, `--vajra-border`, `--vajra-text`, `--vajra-success`, `--vajra-warning`, `--vajra-danger`, `--vajra-info`, `--vajra-accent`).
- Enforce strict semantic color rules:
  - **GREEN**: Normal / Verified / Resolved
  - **AMBER**: Watchlist / Pending / Review
  - **RED**: Imminent / Critical / Escalation
  - **BLUE**: Information / Prediction / Analysis
  - **PURPLE**: AI / Model Intelligence

### Phase 3: Core Application Shell & Navigation
- Update `Sidebar.tsx` with structured navigation sections:
  - **COMMAND**: Dashboard (`/`), Operations Map (`/heatmap`)
  - **MONITORING**: Transaction Monitor (`/transaction-flow`), Alert Center (`/alerts`)
  - **INVESTIGATION**: Mule Ring Investigator (`/mule-ring-investigator`), Graph Explorer (`/graph`), Cases (`/cases`), Account 360 (`/accounts`)
  - **PHYSICAL INTELLIGENCE**: Node Management (`/node-management`), Corridors (`/corridors`)
  - **RESPONSE**: SOP Triage (`/sop-triage`), Officer Review (`/officer-review`), Dispatch (`/dispatch`)
  - **COMPLIANCE**: Legal Dossier Vault (`/legal-dossier-vault`), Audit & Compliance (`/audit-compliance-ledger`), Fairness Audit (`/fairness-audit`)
  - **ANALYTICS**: Reports (`/reports`), Model Performance (`/model-performance`)
  - **SYSTEM**: Settings (`/settings`)
- Update `Header.tsx` with VAJRA AI branding, SSE connection indicator, global search, officer profile context, and mobile field mode link.

### Phase 4: Shared Reusable VAJRA Components (`src/components/vajra/`)
- `RiskBadge.tsx`: Semantic risk level indicator.
- `SOPTierBadge.tsx`: Badges for `MONITOR`, `SOFT-ALERT`, `RECOMMEND-HOLD`, `ESCALATE-FREEZE`, `INTERNATIONAL_ALERT_OVERRIDE`.
- `ConfidenceGauge.tsx`: Visual percentage gauge with semantic color threshold.
- `LeadTimeBadge.tsx`: Proactive interception window countdown badge.
- `EvidenceHashBox.tsx`: Copyable SHA-256 evidence hash container with integrity state.
- `AuditChainStatus.tsx`: Real-time cryptographic chain integrity indicator.
- `ReasonCodeList.tsx`: Explainability reason code badges.
- `ConfirmActionDialog.tsx`: Confirmation dialog for PCR dispatch & bank step-up actions.
- `PredictionCandidateList.tsx`: Top-3 ranked candidate nodes card list.
- `TacticalBrief.tsx`: Persistent right-side detail drawer for withdrawal nodes.

### Phase 5: Primary VAJRA Showcase Pages
1. **Operations Map (`/heatmap`)**:
   - Leaflet + OpenStreetMap interactive canvas.
   - ATM, Micro-ATM, AePS CSP markers with imminent/watchlist/normal risk styling.
   - Animated origin-to-prediction vectors.
   - Persistent right-side ATM Tactical Brief with PCR patrol dispatch trigger.
2. **Alert Center Upgrade (`/alerts`)**:
   - Split-pane layout: Left summary list (Priority, Case ID, Confidence, Target, SLA, Status), Right complete detail panel.
   - Risk signals, physical prediction window, candidate node rankings, cross-border status, PCR beat unit, Bank SOC action.
3. **Mule Ring Investigator (`/mule-ring-investigator`)**:
   - Multi-hop visual flow from Victim → Mule 1 → Mule 2 → Mule 3 → Terminal Mule → Predicted Cash-Out.
   - Per-hop layering velocity and transfer details.
   - Syndicate Fingerprint tag (`investigative_only=true`).
4. **SOP Triage (`/sop-triage`)**:
   - Action-oriented tier cards (`MONITOR`, `SOFT-ALERT`, `RECOMMEND-HOLD`, `ESCALATE-FREEZE`).
   - Visual stepper showing Digital (45%), Physical (35%), Context (20%) weights and separate Cross-Border Override.
5. **Node Management (`/node-management`)**:
   - Node registry search/filter list + persistent right Tactical Brief.
6. **Legal Dossier Vault (`/legal-dossier-vault`)**:
   - Sections for Complaint, Transaction Trail, Physical Prediction, Preservation Directives.
   - Direct download trigger calling backend PDF generation (`GET /api/v1/legal-dossier/{id}/pdf`).
7. **Audit & Compliance Ledger (`/audit-compliance-ledger`)**:
   - Cryptographic event chain list with live re-verification calling `POST /api/v1/audit/reverify`.
8. **Fairness Audit (`/fairness-audit`)**:
   - Model 7 governance dashboard showing Disparate Impact Ratios (DIR) across regional groups.
9. **Model Performance (`/model-performance`)**:
   - Model cards for Models 1–8 with backend metrics, artifact versions, and synthetic dataset disclaimers.
10. **Beat Officer Mobile View (`/field`)**:
    - High-contrast, large touch-target mobile view with navigation shortcuts and tactical brief.
11. **Live Simulation Mode (`/simulation`)**:
    - Multi-hop fraud attack simulator calling `POST /api/v1/simulation/live-attack`.

---

## Technical Dependencies & Libraries
- **React 19 & TypeScript**: Core UI runtime.
- **TanStack React Router**: File-based client routing.
- **TanStack React Query**: Server state caching & query invalidation.
- **Leaflet & React-Leaflet**: Interactive GIS mapping & vector animation.
- **Cytoscape.js**: Network graph visualization.
- **Recharts**: Metric analytics charts.
- **Lucide React**: Iconography.
- **Sonner**: Toast notifications.

---

## Validation & Verification Criteria
1. **Zero Regression**: Existing Digital AML dashboards, alert lists, officer review, reports, and settings remain fully functional.
2. **Split-Pane Rule**: All data-heavy pages use Summary List + Persistent Right Detail Panel pattern.
3. **Type Safety**: Full `npm run typecheck` pass with zero TypeScript errors.
4. **Production Build**: Successful `npm run build` bundle creation.
