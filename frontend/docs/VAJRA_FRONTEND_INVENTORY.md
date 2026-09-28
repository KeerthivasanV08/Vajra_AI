# VAJRA AI — Frontend Inventory & Architecture Audit Document

**Project**: VAJRA AI — Predictive Cybercrime Cash-Out Interception Platform  
**Target Root**: `D:\Vajra_AI\frontend`  
**Date**: September 27, 2026  
**Audit Purpose**: Complete structural inspection of existing frontend before extending with VAJRA physical predictive interception capabilities.

---

## 1. Existing Pages & Route Structure
The frontend uses **TanStack React Router** (`@tanstack/react-router`) with file-based routing defined under `src/routes/`:

| Path | Route File | Purpose / Description |
| :--- | :--- | :--- |
| `/` | `src/routes/index.tsx` | Main Command Center Dashboard (Digital AML metrics, threat ticker, live risk stream) |
| `/transaction-flow` | `src/routes/transaction-flow.tsx` | Transaction Monitor & real-time telemetry stream |
| `/alerts` | `src/routes/alerts.tsx` | Alert Center for AML alerts and SLA breach tracking |
| `/graph` | `src/routes/graph.tsx` | Graph Explorer powered by Cytoscape.js |
| `/investigation` | `src/routes/investigation.tsx` | Account & Mule investigation workspace |
| `/officer-review` | `src/routes/officer-review.tsx` | Officer decision review queue (freeze/unfreeze actions) |
| `/cases` | `src/routes/cases.tsx` | Case Management workspace |
| `/reports` | `src/routes/reports.tsx` | Regulatory Reports Center (SAR, STR, EDD) |
| `/accounts` | `src/routes/accounts.tsx` | Account 360 view |
| `/settings` | `src/routes/settings.tsx` & `src/pages/Settings.tsx` | System preferences & engine configuration |

---

## 2. Layouts & Application Shell
- **Root Layout (`src/routes/__root.tsx`)**: Renders `Sidebar`, `Header`, main `Outlet`, and manages global SSE connection lifecycle and notification toasts via `sonner`.
- **Navigation (`src/components/aml/Sidebar.tsx`)**: Vertical collapsible sidebar with route active indicators, P1 alert badge count, and branding.
- **Header (`src/components/aml/Header.tsx`)**: Global header displaying live feed connection status, search bar, active officer profile, and notification triggers.

---

## 3. State Management & Real-Time Architecture
- **Zustand / Subscriber Store (`src/store/realtime.ts`)**: Custom lightweight subscriber store managing real-time state:
  - SSE connection status (`connected`, `connectionStatus`)
  - Live transactions, alerts, cases, graph events
  - Dashboard metrics & queue snapshots
  - Live threat ticker stream (up to 200 items)
- **Server State / Data Fetching**: TanStack React Query (`@tanstack/react-query`) with query hooks in `src/hooks/`.
- **SSE Integration (`src/services/api.ts` & `src/services/sse/`)**: Connects to backend `/api/sse/stream` or `/api/transactions/stream` with automatic reconnect logic.

---

## 4. UI Components & Visual Design System
- **Styling Framework**: Tailwind CSS v4 (`@tailwindcss/vite`) with custom theme tokens defined in `src/styles.css`.
- **Design Tokens**: Dark mode aesthetic with high-contrast surfaces (`bg-sidebar`, `text-primary`, `bg-critical`, `bg-warning`, `bg-success`).
- **Icons**: Lucide React (`lucide-react`).
- **Graphing & Visualization**: Cytoscape.js (`NetworkGraph.tsx`), Recharts (`recharts` for area charts, bar charts, and metric breakdown).
- **Reusable Primitives**: Radix UI components (`@radix-ui/react-*`) mapped to `src/components/ui/` (Dialog, Accordion, Select, Tabs, Popover, Tooltip, ScrollArea, Separator, etc.).

---

## 5. API Services & Client Mapping
- **Base URL**: Configured via `VITE_API_URL`; local development uses `frontend/.env.development`, and production builds require the variable.
- **Endpoints Defined (`src/services/api.ts`)**:
  - `/api/transactions/recent`, `/api/transactions/realtime`, `/api/transactions/analyze`
  - `/api/accounts`, `/api/alerts`
  - `/api/graph/network`, `/api/graph/account/{id}`
  - `/api/onboarding/evaluate`, `/api/onboarding/explain`
  - `/api/officer/review`, `/api/officer/freeze`, `/api/officer/sar`
  - `/api/reports`, `/api/reports/export`
  - `/api/ready`, `/api/system/model-health`

---

## 6. Frontend / Backend API Mismatches & Gaps

| Feature Area | Digital AML Endpoint | VAJRA Platform Endpoint | Action Required |
| :--- | :--- | :--- | :--- |
| **Physical Interception** | None | `POST /api/v1/vajra/analyze` | Integrate Master Orchestrator |
| **Cash-Out Prediction** | None | `POST /api/v1/prediction/cashout` | Create Prediction hooks & components |
| **Withdrawal Nodes** | None | `GET /api/v1/nodes`, `GET /api/v1/nodes/{id}` | Build Node Management page & Tactical Brief |
| **Corridors** | None | `GET /api/v1/corridors` | Map high-risk corridors on Operations Map |
| **SOP Triage** | `/api/officer/review` | `POST /api/v1/sop/evaluate`, `/api/v1/sop/{case_id}` | Build SOP Triage page & stepper |
| **Patrol / Bank Dispatch**| `/api/officer/freeze` | `POST /api/v1/dispatch/pcr`, `POST /api/v1/dispatch/bank-stepup` | Implement explicit dispatch workflow |
| **Legal Dossier PDF** | `/api/reports/export` | `POST /api/v1/legal-dossier/generate`, `GET /api/v1/legal-dossier/{id}/pdf` | Build Legal Dossier Vault & evidence viewer |
| **Cryptographic Audit** | None | `GET /api/v1/audit/chain`, `POST /api/v1/audit/reverify` | Build Audit & Compliance Ledger |
| **Fairness Audit** | None | `GET /api/v1/fairness-audit` | Build Fairness Audit governance page |
| **Syndicate Matcher** | None | `POST /api/v1/syndicate/match` | Add Syndicate Fingerprint to Mule Ring Investigator |
| **Live Attack Sim** | None | `POST /api/v1/simulation/live-attack` | Add Simulation Mode & live attack trigger |

---

## 7. Reusability & Modification Assessment

### Reusable As-Is / Minor Tweak
- `src/components/NetworkGraph.tsx` (Cytoscape.js wrapper)
- `src/components/aml/Badges.tsx` & `SLATimer.tsx`
- All `@radix-ui/react-*` primitive wrappers in `src/components/ui/`
- TanStack React Query client setup & global CSS design tokens

### Components Needing Modification
- `src/components/aml/Sidebar.tsx`: Update navigation with VAJRA sections (Command, Monitoring, Investigation, Physical Intelligence, Response, Compliance, Analytics, System).
- `src/components/aml/Header.tsx`: Update branding to VAJRA AI, add SSE connection indicator badge, and field mode trigger.
- `src/routes/index.tsx`: Add VAJRA KPI strip, Live Attack Simulation button, Recent Predictive Alerts, Active Corridors, and Prediction Performance.
- `src/routes/alerts.tsx`: Transform into Split-Pane Alert Center with physical prediction details, candidate ranking, SOP tier, and dispatch actions.
- `src/routes/officer-review.tsx`: Add SOP-aware actions (Monitor, Soft-Alert, Recommend-Hold, Escalate-Freeze) and top-3 candidate prediction panel.
- `src/routes/graph.tsx`: Integrate withdrawal node types (`ATM`, `Micro-ATM`, `AePS CSP`) and `PROJECTED_CASH_OUT` edges.
- `src/routes/accounts.tsx`: Add Session / IP-Geo Trajectory mapping and cross-border risk indicators.

### Components / Pages to Create
- `/heatmap`: Operations Map (Leaflet GIS map with origin-to-prediction arcs, candidate nodes, and right Tactical Brief).
- `/mule-ring-investigator`: Mule Ring Hop-by-Hop Investigator with syndicate fingerprinting and terminal cash-out nodes.
- `/sop-triage`: SOP Fusion & Calibration Triage workspace with visual weight breakdown stepper.
- `/node-management`: Cash-Out Node Management registry and ATM Tactical Brief.
- `/corridors`: Monitored Cash-Out Corridors analytics.
- `/legal-dossier-vault`: Legal Dossier PDF Vault with SHA-256 evidence hash verification.
- `/audit-compliance-ledger`: Cryptographic Audit Ledger with re-verification.
- `/fairness-audit`: Model 7 Fairness & Regional Disparate Impact audit console.
- `/model-performance`: ML Model Registry Performance & Synthetic Data Governance view.
- `/field` & `/beat-officer`: Lightweight mobile beat officer dispatch console.
- `/simulation`: Live Multi-Hop Fraud Attack Simulator.

---

## 8. Missing VAJRA Functionality Identified
1. **GIS Operations Map**: Real-time map displaying cash-out nodes, corridor polygons, and animated transaction trajectory vectors.
2. **SOP Fusion Stepper**: Visual explanation of Model 6 weighted fusion (Digital 45%, Physical 35%, Context 20%) + Cross-Border Override.
3. **Evidence Hash Box**: Cryptographic SHA-256 hash generator and proof verification for court-ready legal dossiers.
4. **Audit Chain Re-Verification**: Real-time validation of hash chain links against zero tampering.
5. **Beat Officer Mobile View**: Optimized PWA view for on-field patrol units with large touch targets and offline cached shell.
6. **Live Simulation Engine**: Dashboard trigger calling `POST /api/v1/simulation/live-attack` with step-by-step victim-to-mule-to-cashout animation.
