"""
Compatibility module alias.
Forwards to app.services.aml to maintain clean backward compatibility.
"""
from app.services.aml.aml_fusion_service import AMLFusionService, aml_fusion_service
from app.services.aml.explainability_service import ExplainabilityService, explainability_service

__all__ = ["AMLFusionService", "aml_fusion_service", "ExplainabilityService", "explainability_service"]
