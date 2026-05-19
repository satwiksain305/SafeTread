import logging
from typing import Any, Dict, Optional

from PIL import Image

from services.prediction_service import predict_tire


logger = logging.getLogger("safetread")


def predict_wear(
    cropped_image: Image.Image,
    model: Optional[Any] = None,
    use_real_model: bool = False,
    use_mobilenetv2: bool = False,
) -> Dict[str, Any]:
    """
    Wrapper around the existing ResNet wear classifier.

    This function MUST NOT break the current model behavior; it simply delegates
    to services.prediction_service.predict_tire and logs the prediction summary.
    """
    prediction_output = predict_tire(
        cropped_image,
        model=model,
        use_real_model=use_real_model,
        use_mobilenetv2=use_mobilenetv2,
    )

    logger.info(
        "Wear Analysis Result: wear_level=%.2f%%, confidence=%.4f, model=%s",
        prediction_output.get("wear_level", 0.0),
        prediction_output.get("confidence", 0.0),
        prediction_output.get("model_type", "Unknown")
    )

    return prediction_output

