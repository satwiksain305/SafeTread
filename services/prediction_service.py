import random
import numpy as np
import tensorflow as tf
from tensorflow.keras.applications.resnet import preprocess_input as resnet_preprocess_input
from tensorflow.keras.applications.mobilenet_v2 import preprocess_input as mobilenet_preprocess_input


def _prepare_input(cropped_image, use_mobilenetv2=False):
    image = cropped_image.resize((224, 224))
    img_array = np.array(image, dtype=np.float32)
    preprocess_fn = mobilenet_preprocess_input if use_mobilenetv2 else resnet_preprocess_input
    img_array = preprocess_fn(img_array.copy())
    return np.expand_dims(img_array, axis=0)


def _health_recommendation(health_score):
    if health_score >= 80:
        return "Excellent"
    if health_score >= 60:
        return "Good"
    if health_score >= 40:
        return "Moderate Wear"
    if health_score >= 20:
        return "High Wear"
    return "Replace Immediately"


def predict_tire(cropped_image, model=None, use_real_model=False, use_mobilenetv2=False):
    """Predict tire wear level (0-100) from cropped tire image."""
    if cropped_image is None:
        raise ValueError("Cropped tire image is required for prediction")

    if use_real_model and model is not None:
        input_tensor = _prepare_input(cropped_image, use_mobilenetv2=use_mobilenetv2)
        prediction = model.predict(input_tensor, verbose=0)

        pred_arr = np.array(prediction)
        if pred_arr.ndim == 2 and pred_arr.shape[1] == 1:
            # Binary classification: output is probability of "Worn"
            worn_prob = float(pred_arr[0][0])
        elif pred_arr.ndim == 2 and pred_arr.shape[1] >= 2:
            # Multi-class: index 0 is Healthy, index 1 is Worn
            worn_prob = float(pred_arr[0][1])
        else:
            scalar = float(pred_arr.squeeze())
            worn_prob = max(0.0, min(1.0, scalar))
        
        confidence = worn_prob if worn_prob >= 0.5 else (1.0 - worn_prob)
    else:
        # Generate a realistic mock wear level
        worn_prob = random.uniform(0.1, 0.95)
        confidence = 0.90  # Constant high confidence for mock

    # Global mapping: wear_level is directly proportional to worn_probability
    wear_level = worn_prob * 100.0

    return {
        "wear_level": round(wear_level, 2),
        "confidence": round(float(confidence), 4),
        "model_type": "Real ML Model" if use_real_model and model is not None else "Mock Predictions",
        "is_mock_prediction": not (use_real_model and model is not None)
    }
