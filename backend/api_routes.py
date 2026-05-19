"""
API route helpers for SafeTread backend.

Currently, the main Flask blueprint for predictions lives in
`routes/prediction_routes.py`. This module exists to satisfy the logical
project structure and can be extended in the future if we want to move
route definitions here.
"""

from typing import Any

from flask import Blueprint

from backend.inference_pipeline import NoTyreDetectedError, run_inference_pipeline


def attach_inference_helpers(blueprint: Blueprint, model: Any, use_real_model: bool, use_mobilenetv2: bool) -> None:
    """
    Attach convenience attributes to a prediction blueprint so that routes
    can access the new YOLO + ResNet inference pipeline in a consistent way.
    """

    # These attributes are used by routes/prediction_routes.py to call the
    # unified pipeline without having to know where it is implemented.
    blueprint.inference_model = model  # type: ignore[attr-defined]
    blueprint.inference_use_real_model = use_real_model  # type: ignore[attr-defined]
    blueprint.inference_use_mobilenetv2 = use_mobilenetv2  # type: ignore[attr-defined]
    blueprint.run_inference_pipeline = run_inference_pipeline  # type: ignore[attr-defined]
    blueprint.NoTyreDetectedError = NoTyreDetectedError  # type: ignore[attr-defined]

