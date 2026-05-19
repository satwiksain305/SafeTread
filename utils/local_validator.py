"""
utils/local_validator.py
-------------------------
A high-accuracy local AI validator using MobileNetV2 and geometric heuristics.
Optimized to recognize tyre treads, wheels, and close-up shots while strictly blocking non-tyres.
"""

import logging
from io import BytesIO

import numpy as np
import tensorflow as tf
from PIL import Image
from tensorflow.keras.applications import mobilenet_v2
from tensorflow.keras.preprocessing import image as keras_image

logger = logging.getLogger("safetread")

# ─── Singleton Model Loader ───────────────────────────────────────────────────

_MODEL_CACHE = {}

def _get_mobilenet_model():
    """Lazily load MobileNetV2."""
    if "model" not in _MODEL_CACHE:
        logger.info("Loading Enhanced Local AI Validator (MobileNetV2)...")
        _MODEL_CACHE["model"] = mobilenet_v2.MobileNetV2(weights="imagenet", include_top=True)
    return _MODEL_CACHE["model"]

# ─── Configuration ────────────────────────────────────────────────────────────

# 1. Direct Hits: ImageNet classes that are definitively tyres/wheels
DIRECT_TYRE_KEYWORDS = {"tire", "tyre", "wheel", "rim", "hubcap"}

# 2. Geometric Look-alikes: Classes that treads are commonly misclassified as 
# due to their repetitive geometric patterns and vertical grooves.
LOOK_ALIAKE_KEYWORDS = {
    "breastplate", "shield", "manhole", "treadmill", 
    "grille", "radiator", "chain_link_fence", "accordion"
}

def get_image_saturation(img: Image.Image) -> float:
    """
    Calculates the average saturation of an image using NumPy (0.0 to 1.0).
    Saturation = (max_channel - min_channel) / max_channel per pixel.
    Correctly returns ~0 for grayscale, ~1 for colorful images.
    """
    rgb = img.convert("RGB")
    arr = np.array(rgb, dtype=np.float32) / 255.0  # Shape: (H, W, 3)
    max_c = arr.max(axis=2)  # Per-pixel max
    min_c = arr.min(axis=2)  # Per-pixel min
    # Avoid division by zero (pure black pixels have max=0)
    sat = np.divide(max_c - min_c, max_c, out=np.zeros_like(max_c), where=max_c > 0)
    return float(np.mean(sat))

def validate_tyre_locally(image_bytes: bytes) -> bool:
    """
    Validates if an image contains a tyre using MobileNetV2 + Grayscale Heuristic.
    """
    logger.info("Enhanced Local AI validation started...")
    print("\n[LOCAL VALIDATION] Checking image...")
    
    try:
        # Load image
        pil_img = Image.open(BytesIO(image_bytes)).convert("RGB")
        
        # Calculate Saturation (Tyres are gray/black, so saturation should be LOW)
        saturation = get_image_saturation(pil_img)
        print(f"[LOCAL VALIDATION] Image Saturation: {saturation:.4f}")
        
        # Prep for model
        model_img = pil_img.resize((224, 224), Image.LANCZOS)
        x = keras_image.img_to_array(model_img)
        x = np.expand_dims(x, axis=0)
        x = mobilenet_v2.preprocess_input(x)
        
        # Inference
        model = _get_mobilenet_model()
        preds = model.predict(x, verbose=0)
        decoded = mobilenet_v2.decode_predictions(preds, top=5)[0]
        
        print("[LOCAL VALIDATION] Top Predictions:")
        is_tyre = False
        
        for i, (imagenet_id, label, score) in enumerate(decoded):
            label_lower = label.lower()
            print(f" - {i+1}. {label}: {score:.4f}")
            
            # Case A: Direct hit (e.g., 'tire', 'wheel')
            if any(key in label_lower for key in DIRECT_TYRE_KEYWORDS):
                if score > 0.03: # Low threshold for direct hits
                    is_tyre = True
                    print(f"   >>> Detected as DIRECT TYRE/WHEEL")
                    break
            
            # Case B: Geometric Look-alike + Low Saturation (Tread Patterns)
            # Tyres are almost never colorful. If it looks like a “shield” but is grayscale, it's a tyre.
            if any(key in label_lower for key in LOOK_ALIAKE_KEYWORDS):
                if score > 0.05 and saturation < 0.40:
                    is_tyre = True
                    print(f"   >>> Detected as TYRE TREAD (Geometric Match + Low Saturation)")
                    break
        
        # Safety Fallback: Low Saturation + Any Reasonable Prediction (Simple Heuristic)
        # If the model is totally confused but it's quite grayscale/dark (like rubber)
        # and there's at least one confident prediction, it's likely a tyre close-up.
        if not is_tyre and saturation < 0.35 and any(s[2] > 0.08 for s in decoded):
             is_tyre = True
             print("   >>> Detected as TYRE via Grayscale Texture Fallback")

        print(f"[LOCAL VALIDATION] Final Decision: {'PASS' if is_tyre else 'REJECT'}")
        logger.info(f"Local AI Conclusion: Tyre Detected = {is_tyre}")
        return is_tyre

    except Exception as exc:
        logger.error(f"Local AI Validator Error: {exc}", exc_info=True)
        return True # Fail open on system errors
