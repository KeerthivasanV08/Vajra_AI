"""
Constants Module for VAJRA Platform.
Centralized operational action types, SOP tiers, and model identifiers.
"""

# SOP Action Tiers
SOP_TIER_MONITOR = "MONITOR"
SOP_TIER_SOFT_ALERT = "SOFT_ALERT"
SOP_TIER_RECOMMEND_HOLD = "RECOMMEND_HOLD"
SOP_TIER_ESCALATE_FREEZE = "ESCALATE_FREEZE"
SOP_TIER_INTERNATIONAL_OVERRIDE = "INTERNATIONAL_ALERT_OVERRIDE"

# Operational Dispatch Types
DISPATCH_ACTION_PCR_PATROL = "PCR_PATROL"
DISPATCH_ACTION_BANK_STEP_UP = "BANK_STEP_UP"

# Dispatch Statuses
DISPATCH_STATUS_REQUESTED = "REQUESTED"
DISPATCH_STATUS_QUEUED = "QUEUED"
DISPATCH_STATUS_SENT = "SENT"
DISPATCH_STATUS_ACKNOWLEDGED = "ACKNOWLEDGED"
DISPATCH_STATUS_FAILED = "FAILED"
DISPATCH_STATUS_CANCELLED = "CANCELLED"

# Model Identifiers
MODEL_ID_TRAJECTORY = "model1_trajectory"
MODEL_ID_NODE_VULNERABILITY = "model2_node_vulnerability"
MODEL_ID_SPATIAL_REGION = "model3_spatial_region"
MODEL_ID_NODE_RANKER = "model4_node_ranker"
MODEL_ID_CROSS_BORDER = "model5_cross_border"
MODEL_ID_SOP_FUSION = "model6_sop_fusion"
MODEL_ID_FAIRNESS_AUDIT = "model7_fairness_audit"
MODEL_ID_SYNDICATE_MATCHER = "model8_syndicate_matcher"

# Data Provenance Label
DATA_PROVENANCE_SYNTHETIC = {
    "type": "synthetic",
    "is_synthetic": True,
    "source": "VAJRA prototype dataset",
    "disclaimer": "All predictions and targets are generated on synthetic prototype datasets for defensive research & operational workflow evaluation."
}