import logging
from dataclasses import dataclass
from typing import List, Optional, Tuple

import numpy as np
from PIL import Image

try:
    from ultralytics import YOLO

    _YOLO_AVAILABLE = True
except Exception as exc:  # pragma: no cover - defensive import
    logging.getLogger("safetread").warning("Ultralytics YOLO not available: %s", exc)
    YOLO = None  # type: ignore[assignment]
    _YOLO_AVAILABLE = False


logger = logging.getLogger("safetread")


_yolo_model: Optional["YOLO"] = None  # type: ignore[name-defined]
_yolo_model_source: str = "uninitialized"


@dataclass
class TyreDetectionResult:
    has_tyre: bool
    bbox: Optional[Tuple[int, int, int, int]] = None  # (x1, y1, x2, y2)
    confidence: float = 0.0


def _load_yolo_model() -> Optional["YOLO"]:  # type: ignore[name-defined]
    """
    Lazily load YOLOv8 model for tyre detection.

    Priority:
    1. Local custom tyre model at ml/models/tyre_detector_yolov8.pt (or tyre_detector.pt)
    2. Fallback to general-purpose 'yolov8n.pt' (COCO) if available.
    """
    global _yolo_model, _yolo_model_source

    if not _YOLO_AVAILABLE:
        _yolo_model_source = "unavailable: ultralytics import failed"
        return None

    if _yolo_model is not None:
        return _yolo_model

    import os

    backend_dir = os.path.dirname(os.path.abspath(__file__))
    project_root = os.path.dirname(backend_dir)
    models_dir = os.path.join(project_root, "ml", "models")

    candidate_paths: List[str] = [
        os.path.join(models_dir, "tire_detector.pt"),
        os.path.join(models_dir, "tyre_detector_yolov8.pt"),
        os.path.join(models_dir, "tyre_detector.pt"),
        os.path.join(models_dir, "yolov8_tyre.pt"),
    ]

    model_path = next((p for p in candidate_paths if os.path.exists(p)), None)

    try:
        if model_path:
            logger.info("Loading custom YOLOv8 tyre detector from %s", model_path)
            _yolo_model = YOLO(model_path)
            _yolo_model_source = model_path
        else:
            logger.info(
                "No custom tyre detector weights found in ml/models; "
                "falling back to generic 'yolov8n.pt' (COCO classes)."
            )
            _yolo_model = YOLO("yolov8n.pt")
            _yolo_model_source = "yolov8n.pt (generic fallback)"
    except Exception as exc:  # pragma: no cover - runtime dependent
        logger.error("Failed to load YOLOv8 model: %s", exc)
        _yolo_model = None
        _yolo_model_source = f"load_failed: {exc}"

    return _yolo_model


def get_yolo_model_source() -> str:
    """Return a short diagnostic string describing which YOLO model is active."""
    return _yolo_model_source


def _select_largest_box(
    boxes_xyxy: np.ndarray, scores: np.ndarray
) -> Tuple[Tuple[int, int, int, int], float]:
    """Return the largest bounding box (by area) and its confidence."""
    areas = (boxes_xyxy[:, 2] - boxes_xyxy[:, 0]) * (boxes_xyxy[:, 3] - boxes_xyxy[:, 1])
    best_idx = int(np.argmax(areas))
    x1, y1, x2, y2 = boxes_xyxy[best_idx]
    return (int(x1), int(y1), int(x2), int(y2)), float(scores[best_idx])


def is_tread_texture(image: Image.Image) -> bool:
    """
    Heuristic to detect if an image is a close-up of a tyre tread.
    Works based on low saturation and presence of texture/edges.
    """
    if image is None:
        return False
        
    rgb = image.convert("RGB")
    arr = np.array(rgb)
    if arr.size == 0:
        return False
        
    # 1. Saturation Check (Tyres are mostly gray/black/brown)
    sampled = arr[::8, ::8].reshape(-1, 3).astype(np.float32) / 255.0
    max_c = sampled.max(axis=1)
    min_c = sampled.min(axis=1)
    # saturation = (max-min)/max
    sat = np.divide((max_c - min_c), max_c, out=np.zeros_like(max_c), where=max_c != 0.0)
    mean_sat = float(np.mean(sat))
    
    # 2. Texture/Edge Check
    gray = rgb.convert("L")
    from PIL import ImageFilter
    edges = gray.filter(ImageFilter.FIND_EDGES)
    edge_arr = np.array(edges, dtype=np.float32)
    edge_density = float(np.mean(edge_arr > 10)) # Simple threshold for edges
    
    # 3. Brightness Check (Don't accept pure black/white)
    mean_brightness = float(np.mean(np.array(gray)))
    
    logger.info("Tread Check: sat=%.3f, edges=%.3f, brightness=%.1f", mean_sat, edge_density, mean_brightness)
    
    # Heuristic thresholds: Low saturation, minimum edge density, reasonable brightness
    is_tread = (mean_sat < 0.20) and (edge_density > 0.05) and (30 < mean_brightness < 220)
    return is_tread


def detect_tyre(image: Image.Image, min_confidence: float = 0.50) -> TyreDetectionResult:
    """
    Run YOLOv8 on the uploaded image and detect tyre / tire / wheel regions.
    Falls back to a tread texture heuristic for close-up shots.
    """
    if image is None:
        return TyreDetectionResult(has_tyre=False)

    model = _load_yolo_model()
    yolo_success = False
    
    if model is not None:
        try:
            results = model(image, verbose=False)
            if results and results[0].boxes and results[0].boxes.shape[0] > 0:
                result = results[0]
                names = result.names or {}
                boxes_xyxy = result.boxes.xyxy.cpu().numpy()
                cls_ids = result.boxes.cls.cpu().numpy().astype(int)
                scores = result.boxes.conf.cpu().numpy()

                tyre_indices = []
                for idx, cls_id in enumerate(cls_ids):
                    name = str(names.get(int(cls_id), "")).lower()
                    if any(k in name for k in ("tyre", "tire", "wheel", "rim")):
                        if scores[idx] >= min_confidence:
                            tyre_indices.append(idx)
                
                if tyre_indices:
                    tyre_boxes = boxes_xyxy[tyre_indices]
                    tyre_scores = scores[tyre_indices]
                    bbox, best_conf = _select_largest_box(tyre_boxes, tyre_scores)
                    logger.info("Tyre Detection: YOLOv8 SUCCESS with bbox=%s conf=%.3f", bbox, best_conf)
                    return TyreDetectionResult(has_tyre=True, bbox=bbox, confidence=best_conf)
        except Exception as exc:
            logger.error("YOLOv8 inference failed: %s", exc)

    # Fallback for close-ups: check for tread texture
    if is_tread_texture(image):
        width, height = image.size
        # For a close-up, the whole image is likely the tyre region
        bbox = (0, 0, width, height)
        logger.info("Tyre Detection: SUCCESS via Tread Texture Fallback")
        return TyreDetectionResult(has_tyre=True, bbox=bbox, confidence=0.80)

    logger.info("Tyre Detection: FAILED - No tyre or tread found")
    return TyreDetectionResult(has_tyre=False)


def crop_tyre(image: Image.Image, bbox: Tuple[int, int, int, int]) -> Image.Image:
    """Crop a tyre region from the image using the YOLO bounding box."""
    if image is None or not bbox:
        raise ValueError("Valid image and bounding box are required to crop tyre")

    x1, y1, x2, y2 = bbox
    width, height = image.size
    x1 = max(0, min(width, x1))
    y1 = max(0, min(height, y1))
    x2 = max(0, min(width, x2))
    y2 = max(0, min(height, y2))

    if x2 <= x1 or y2 <= y1:
        raise ValueError("Invalid bounding box for cropping tyre")

    cropped = image.crop((x1, y1, x2, y2)).convert("RGB")
    logger.info("Cropped tyre region with size=%s from bbox=%s", cropped.size, bbox)
    return cropped

