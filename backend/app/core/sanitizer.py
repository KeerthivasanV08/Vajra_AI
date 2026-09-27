"""
JSON Sanitizer Utility Module for VAJRA Platform.
Ensures numpy floats, integers, ndarrays, NaNs, and Infs are converted to standard JSON-serializable types.
"""

import math
import numpy as np
from typing import Any

def sanitize_for_json(obj: Any) -> Any:
    """Recursively replace NaN / Inf floats and convert numpy types to standard Python primitives."""
    if obj is None:
        return None
    if isinstance(obj, (float, np.floating)):
        val = float(obj)
        if math.isnan(val) or math.isinf(val):
            return None
        return val
    if isinstance(obj, (int, np.integer)):
        return int(obj)
    if isinstance(obj, np.ndarray):
        return sanitize_for_json(obj.tolist())
    if isinstance(obj, dict):
        return {str(k): sanitize_for_json(v) for k, v in obj.items()}
    if isinstance(obj, (list, tuple, set)):
        return [sanitize_for_json(v) for v in obj]
    return obj
