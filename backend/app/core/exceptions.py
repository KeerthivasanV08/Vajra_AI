"""
Domain Exceptions Module for VAJRA Platform.
Defines explicit custom exception classes for domain failures.
"""

class VajraBaseException(Exception):
    def __init__(self, message: str, code: str = "INTERNAL_ERROR"):
        super().__init__(message)
        self.message = message
        self.code = code

class ModelNotAvailableError(VajraBaseException):
    def __init__(self, message: str):
        super().__init__(message, code="MODEL_NOT_AVAILABLE")

class DatasetNotAvailableError(VajraBaseException):
    def __init__(self, message: str):
        super().__init__(message, code="DATASET_NOT_AVAILABLE")

class PredictionNotFoundError(VajraBaseException):
    def __init__(self, message: str):
        super().__init__(message, code="PREDICTION_NOT_FOUND")

class NodeNotFoundError(VajraBaseException):
    def __init__(self, message: str):
        super().__init__(message, code="NODE_NOT_FOUND")

class UnauthorizedActionError(VajraBaseException):
    def __init__(self, message: str):
        super().__init__(message, code="UNAUTHORIZED_ACTION")

class AuditIntegrityError(VajraBaseException):
    def __init__(self, message: str):
        super().__init__(message, code="AUDIT_INTEGRITY_VIOLATION")

class InvalidPredictionInputError(VajraBaseException):
    def __init__(self, message: str):
        super().__init__(message, code="INVALID_PREDICTION_INPUT")

class ExternalServiceError(VajraBaseException):
    def __init__(self, message: str):
        super().__init__(message, code="EXTERNAL_SERVICE_ERROR")

class DossierGenerationError(VajraBaseException):
    def __init__(self, message: str):
        super().__init__(message, code="DOSSIER_GENERATION_ERROR")
