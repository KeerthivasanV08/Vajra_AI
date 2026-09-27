# VAJRA AI — Page to Backend Data Matrix

**Project**: VAJRA AI — Predictive Cybercrime Cash-Out Interception Platform  
**Target Root**: `D:\Vajra_AI\frontend`  
**Date**: September 27, 2026  

---

| Page Name | Client Route | Backend API Endpoint | HTTP Method | Query / Payload Parameters | Response Interface | Realtime Events | Permitted Roles | Primary Actions |
| :--- | :--- | :--- | :---: | :--- | :--- | :--- | :--- | :--- |
| **Command Center** | `/` | `/api/v1/vajra/analyze`<br>`/api/v1/metrics/models` | `POST`<br>`GET` | `account_id`, `geo_lat`, `geo_lon` | `VajraCaseAnalysis`<br>`ModelMetricsResponse` | `new_transaction`<br>`new_prediction` | `ADMIN`, `AML_ANALYST`, `LEA_OFFICER`, `SUPERVISOR` | View Interception KPIs, Trigger Live Simulation, Triage Alerts |
| **Operations Map** | `/heatmap` | `/api/v1/nodes`<br>`/api/v1/corridors`<br>`/api/v1/prediction/cashout` | `GET`<br>`GET`<br>`POST` | `node_type`, `district`, `risk_min` | `WithdrawalNode[]`<br>`HighRiskCorridor[]`<br>`PhysicalPredictionResponse` | `node_risk_update`<br>`new_prediction` | `ADMIN`, `LEA_OFFICER`, `SUPERVISOR` | Interactive Map Filtering, ATM Tactical Brief, Dispatch PCR Patrol |
| **Transaction Monitor**| `/transaction-flow`| `/api/transactions/recent`<br>`/api/transactions/realtime` | `GET`<br>`GET` | `limit`, `page` | `Transaction[]` | `new_transaction` | `AML_ANALYST`, `SUPERVISOR` | Telemetry stream filter, Instant risk scoring inspect |
| **Alert Center** | `/alerts` | `/api/alerts`<br>`/api/v1/prediction/cashout`<br>`/api/v1/sop/evaluate` | `GET`<br>`POST`<br>`POST` | `priority`, `status` | `Alert[]`<br>`PhysicalPredictionResponse`<br>`SOPEvaluationResponse` | `alert_escalation`<br>`sla_breach` | `AML_ANALYST`, `LEA_OFFICER`, `BANK_OFFICER` | Split-Pane Triage, PCR Patrol Dispatch, Bank Step-Up Auth |
| **Mule Ring Investigator**| `/mule-ring-investigator`| `/api/v1/syndicate/match`<br>`/api/graph/account/{id}` | `POST`<br>`GET` | `account_id` | `SyndicateMatchResponse`<br>`GraphData` | `case_update` | `AML_ANALYST`, `SUPERVISOR` | Trace Mule Chain, Analyze Fan-Out Factor, Inspect Fingerprints |
| **Graph Explorer** | `/graph` | `/api/graph/network`<br>`/api/v1/nodes/{id}` | `GET`<br>`GET` | `node_id` | `GraphData`<br>`WithdrawalNode` | `graph_event` | `AML_ANALYST` | Cytoscape Layout Controls, Cash-Out Node Inspection |
| **SOP Triage** | `/sop-triage` | `/api/v1/sop/evaluate`<br>`/api/v1/sop/{case_id}` | `POST`<br>`GET` | `digital_score`, `physical_score` | `SOPEvaluationResponse` | `sop_tier_update` | `AML_ANALYST`, `SUPERVISOR`, `LEA_OFFICER` | Action Tier Triage (`RECOMMEND-HOLD`, `ESCALATE-FREEZE`), Weight Stepper |
| **Officer Review** | `/officer-review` | `/api/officer/case/all`<br>`/api/v1/dispatch/pcr`<br>`/api/v1/dispatch/bank-stepup` | `GET`<br>`POST`<br>`POST` | `case_id` | `AmlCase[]`<br>`DispatchResponse` | `officer_assignment` | `LEA_OFFICER`, `BANK_OFFICER`, `SUPERVISOR` | SOP Action Decisioning, Dispatch Execution, Legal Dossier Trigger |
| **Node Management** | `/node-management` | `/api/v1/nodes`<br>`/api/v1/nodes/{id}/risk` | `GET`<br>`GET` | `node_type`, `bank`, `district` | `WithdrawalNode[]` | `node_risk_update` | `ADMIN`, `LEA_OFFICER` | Query Node Registry, View ATM Tactical Brief, Filter Vulnerability |
| **Corridors** | `/corridors` | `/api/v1/corridors` | `GET` | None | `HighRiskCorridor[]` | None | `ADMIN`, `SUPERVISOR` | View High-Risk Corridor Density, Historical Volume Analysis |
| **Cases** | `/cases` | `/api/officer/case/all` | `GET` | `status`, `page` | `AmlCase[]` | `case_update` | `AML_ANALYST`, `SUPERVISOR` | Case Timeline Verification, Cross-Border Audit Tracking |
| **Account 360** | `/accounts` | `/api/accounts`<br>`/api/graph/account/{id}` | `GET`<br>`GET` | `account_id` | `Account[]`<br>`GraphData` | None | `AML_ANALYST`, `AUDITOR` | View Session / IP-Geo Trajectory, Cross-Border Risk Assessment |
| **Legal Dossier Vault**| `/legal-dossier-vault`| `/api/v1/legal-dossier/generate`<br>`/api/v1/legal-dossier/{id}/pdf` | `POST`<br>`GET` | `case_id`, `prediction_data` | `LegalDossierResponse`<br>`PDF Binary` | `dossier_generated` | `LEA_OFFICER`, `AUDITOR`, `SUPERVISOR` | Generate Court-Ready PDF, Verify SHA-256 Evidence Hash |
| **Audit Ledger** | `/audit-compliance-ledger`| `/api/v1/audit/chain`<br>`/api/v1/audit/reverify` | `GET`<br>`POST` | None | `CryptographicAuditEvent[]`<br>`AuditReverifyResponse` | `audit_event` | `AUDITOR`, `ADMIN` | Re-verify Hash Chain Integrity, Copy Event Signatures |
| **Fairness Audit** | `/fairness-audit` | `/api/v1/fairness-audit` | `GET` | None | `FairnessSummary` | None | `AUDITOR`, `ADMIN` | Inspect Disparate Impact Ratios (DIR), Governance Disclaimers |
| **Reports Center** | `/reports` | `/api/reports`<br>`/api/reports/export` | `GET`<br>`GET` | `format` | `ReportsData` | None | `AUDITOR`, `SUPERVISOR` | Regulatory SAR/STR Generation, Export Evidence Audit Logs |
| **Model Performance**| `/model-performance`| `/api/v1/metrics/models` | `GET` | None | `ModelMetricsResponse` | None | `ADMIN`, `AUDITOR` | Audit Models 1–8 Metrics, Review Synthetic Target Disclaimers |
| **Beat Officer View** | `/field` | `/api/v1/dispatch/{id}` | `GET` | `dispatch_id` | `DispatchResponse` | `dispatch_update` | `LEA_OFFICER` | Mobile Patrol Mode, Tactical Brief, Google Maps Navigation |
| **Live Simulation Mode**| `/simulation` | `/api/v1/simulation/live-attack` | `POST` | `victim_account_id` | `SimulationResult` | `simulation_event` | `ADMIN`, `SUPERVISOR` | Multi-Hop Live Fraud Attack Animation & Latency Metrics |
| **Settings** | `/settings` | `/api/ready`<br>`/api/system/model-health` | `GET`<br>`GET` | None | `SystemHealth` | None | `ADMIN` | SOP Weight Configuration, Realtime SSE Status, Theme & i18n |
