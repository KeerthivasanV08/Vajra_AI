# VAJRA AI — Operational Intelligence Console

> Real-time Predictive Cybercrime Interception Console for Fraud Analysts, Investigators, Beat Officers, Compliance Officers, and Banking SOC Teams.

A dark-themed, investigation-driven, operationally actionable war-room console and mobile beat officer PWA — built with React 19, TanStack Router, TanStack Query, Leaflet GIS, and TailwindCSS.

---

## ✨ Highlights

- **19 Operational Surfaces** — GIS Operations Map, Mule Ring Investigator, SOP Triage Console, Node Management, Legal Dossier Vault, Cryptographic Audit Ledger, Fairness Audit, Beat Officer PWA Mode, Model Performance, Attack Simulation, High-Risk Corridors, Command Center, Transaction Monitor, Alert Center, Graph Explorer, Officer Review, Cases, Reports, Account 360.
- **Predictive GIS Heatmap** — Real-time Leaflet GIS canvas plotting predicted withdrawal corridors and terminal node vulnerability scores.
- **Mule Ring Hop-by-Hop Tracing** — Visual multi-hop layering flow with Model 8 syndicate fingerprint matching (`RAPID_MULE_FANOUT`, etc.).
- **SOP Action Stepper** — Interactive 3-part fusion sliders (Digital 45%, Physical 35%, Context 20%), Isotonic Calibration display, and isolated Cross-Border override condition toggle.
- **Beat Officer PWA Mode** — Mobile touch-optimized dispatch interface for field patrol officers with real-time SSE alerts.
- **Court Legal Dossier Vault** — One-click generation of court-admissible PDF evidence packages with embedded SHA-256 evidence hashing.
- **Cryptographic Audit Ledger** — Tamper-evident block-linked SHA-256 audit chain reverification.
- **Non-Scoring Fairness Audit** — Demographic equity dashboard monitoring Disparate Impact Ratios (DIR) across 11 regional groups.

---

## 🧱 Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 19 |
| Routing | TanStack Router (File-based) |
| Styling | TailwindCSS v4 + Custom VAJRA Design Tokens |
| Maps / GIS | Leaflet 1.9 + React-Leaflet |
| Charts | Recharts |
| State | Zustand-like Pub/Sub Store (`src/store/realtime.ts`) + SSE Merge Cache |
| Data Fetching | TanStack Query v5 + Normalized VAJRA API Client |
| Notifications | Sonner |
| Icons | Lucide React |

---

## 📁 Key Routes & Structure

```
src/routes/
├── index.tsx                        # Command Center Dashboard
├── heatmap.tsx                      # GIS Operations Heatmap Canvas
├── mule-ring-investigator.tsx       # Multi-Hop Layering & Syndicate Matcher
├── sop-triage.tsx                   # Model 6 SOP Fusion & Isotonic Calibration
├── node-management.tsx              # ATM / AePS Node Registry & Tactical Brief
├── legal-dossier-vault.tsx          # Court Evidence Vault & PDF Download
├── audit-compliance-ledger.tsx      # SHA-256 Cryptographic Audit Ledger
├── fairness-audit.tsx               # Model 7 Non-Scoring Regional Fairness Audit
├── field.tsx                        # Beat Officer Touch-Optimized PWA View
├── model-performance.tsx            # Live Model Performance & Calibration Metrics
├── simulation.tsx                   # Adversarial Fraud Attack Simulator
├── corridors.tsx                    # High-Risk Cash-Out Corridor Matrix
├── transaction-flow.tsx             # Live Transaction Monitor
├── alerts.tsx                       # SLA Alert Center
├── graph.tsx                        # Network Topology Graph Explorer
├── officer-review.tsx               # Officer Decision Workbench
├── cases.tsx                        # Case Management
├── reports.tsx                      # Reports & Export Center
├── accounts.tsx                     # Account 360 & Trajectory Profile
└── settings.tsx                     # Platform Configuration
```

---

## ▶️ Development & Build Commands

```bash
# Install dependencies
npm install

# Launch Vite development server
npm run dev

# Execute production build
npm run build
```

## Deployment

Build with `npm run build` and deploy using a host/runtime compatible with the Nitro integration configured in `vite.config.ts` (the config targets Vercel Functions). Set `VITE_API_URL` to the deployed backend origin in the frontend build environment; this value is compiled into API and SSE requests, so rebuild after changing it. Do not include a trailing API path such as `/api/v1` in the value.

Add the frontend's exact public origin to the backend's `FRONTEND_ORIGINS` setting so browser requests pass CORS checks. Verify the deployed UI can reach `/api/v1/health/ready` on the backend. See the [backend Render deployment guide](../docs/deployment/backend-render.md) for API configuration and runtime limitations.
