"""
Repository Factory Module for VAJRA Platform.
Returns CSV or Database repository implementation based on DATABASE_MODE config.
"""

from app.core.config import settings
from app.repositories.node_repository import node_repository
from app.repositories.prediction_repository import prediction_repository
from app.repositories.case_repository import case_repository
from app.repositories.audit_repository import audit_repository

class RepositoryFactory:
    @staticmethod
    def get_node_repository():
        return node_repository

    @staticmethod
    def get_prediction_repository():
        return prediction_repository

    @staticmethod
    def get_case_repository():
        return case_repository

    @staticmethod
    def get_audit_repository():
        return audit_repository

repository_factory = RepositoryFactory()
