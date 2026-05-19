import logging
from dataclasses import dataclass
from typing import Any, Dict, Optional, Tuple

from PIL import Image

from backend.tyre_detector import TyreDetectionResult, crop_tyre, detect_tyre
from backend.wear_classifier import predict_wear

logger = logging.getLogger("safetread")


class NoTyreDetectedError(Exception):
    """Raised when no tyre is detected in the uploaded image."""


@dataclass
class InferenceResult:
    bbox: Tuple[int, int, int, int]
    prediction: Dict[str, Any]


def run_inference_pipeline(
    image: Image.Image,
    model: Optional[Any] = None,
    use_real_model: bool = False,
    use_mobilenetv2: bool = False,
) -> InferenceResult:
    """
    Full SafeTread pipeline:
    Image Upload -> Tyre Detection -> Crop -> Wear Analysis -> Return Result
    """
    if image is None:
        raise NoTyreDetectedError("No image provided for analysis.")

    # 1. Tyre detection via YOLOv8
    detection: TyreDetectionResult = detect_tyre(image)
    bbox: Optional[Tuple[int, int, int, int]] = None
    cropped_tyre: Optional[Image.Image] = None

    if detection.has_tyre and detection.bbox:
        bbox = detection.bbox
        logger.info("Tyre Detection: SUCCESS with confidence=%.3f", detection.confidence)
        cropped_tyre = crop_tyre(image, detection.bbox)
    else:
        logger.warning("Tyre Detection: FAILED - No tyre found by YOLOv8")
        raise NoTyreDetectedError("No tyre detected in image. Please ensure the tyre is clearly visible.")

    # 2. Wear prediction
    logger.info("Wear Analysis: Starting...")
    prediction_output = predict_wear(
        cropped_tyre,
        model=model,
        use_real_model=use_real_model,
        use_mobilenetv2=use_mobilenetv2,
    )

    return InferenceResult(bbox=bbox, prediction=prediction_output)

