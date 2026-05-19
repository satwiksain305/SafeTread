# SafeTread Preprocessing Techniques Analysis

## Overview

SafeTread applies preprocessing at **multiple stages** of the pipeline:
1. **Upload Validation** - Format, size, corruption checks
2. **Training Data Loading** - Batch creation & augmentation
3. **Inference Preprocessing** - Normalization for model input
4. **Tire Detection** - Feature extraction for localization
5. **Model-Specific Preprocessing** - Architecture-dependent normalization

---

## 1. Upload Validation & Initial Preprocessing

### 1.1 File Format Validation

**File**: [services/validation_service.py](services/validation_service.py#L1-L50)

**Allowed Formats**:
```python
ALLOWED_EXTENSIONS = {"jpg", "jpeg", "png", "webp", "heic", "heif"}
MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024  # 10 MB max
```

**Implementation**:
```python
def validate_uploaded_image(file):
    # 1. Check filename and extension
    extension = filename.rsplit(".", 1)[-1].lower()
    if extension not in ALLOWED_EXTENSIONS:
        return error
    
    # 2. Check file size
    size = file_stream_size()
    if size <= 0 or size > MAX_FILE_SIZE_BYTES:
        return error
    
    # 3. Verify image integrity
    image = Image.open(stream)
    image.verify()  # Check for corruption
    
    # 4. Convert to RGB
    image = Image.open(stream).convert("RGB")
    
    return {"valid": True, "image": image, "extension": extension}
```

**Why**: 
- Prevents malicious file uploads
- Ensures image is readable (not corrupted)
- Standardizes to RGB format regardless of source (PNG, JPEG, etc.)

### 1.2 Base64 Image Decoding

**File**: [services/validation_service.py](services/validation_service.py#L54-L90)

**Supports Data URI Format**:
```python
# Accepts: "data:image/jpeg;base64,/9j/4AAQSkZJRg..."
# Or raw base64: "/9j/4AAQSkZJRg..."

def decode_base64_image(image_string):
    # 1. Parse data URI (extract mime type if present)
    data_uri_match = re.match(r"^data:image\/([a-zA-Z0-9+\-]+);base64,(.+)$", content)
    
    # 2. Decode base64 with validation
    decoded = base64.b64decode(content, validate=True)
    
    # 3. Check size constraints
    if len(decoded) == 0 or len(decoded) > MAX_FILE_SIZE_BYTES:
        return error
    
    # 4. Verify as valid image
    buffer = io.BytesIO(decoded)
    image = Image.open(buffer)
    image.verify()
    image = Image.open(buffer).convert("RGB")
    
    return {"valid": True, "image": image, "extension": mime_ext}
```

**Why**: Mobile/React frontends upload images as base64; needs validation and conversion.

---

## 2. Training Data Loading & Preprocessing

### 2.1 Dataset Loading with TensorFlow

**Files**: 
- [ml/scripts/train_mobilenetv2.py](ml/scripts/train_mobilenetv2.py#L1-L60)
- [COLAB_NOTEBOOK_CODE.py](COLAB_NOTEBOOK_CODE.py#L55-L85)

**Implementation**:
```python
IMG_SIZE = (224, 224)
BATCH_SIZE = 32
ALLOWED_EXTS = {".jpg", ".jpeg", ".png", ".bmp"}

# Load training dataset with automatic preprocessing
train_ds = tf.keras.utils.image_dataset_from_directory(
    train_dir,
    labels="inferred",           # Read labels from folder names
    label_mode="categorical",    # One-hot encoding: [Good, Defective]
    image_size=IMG_SIZE,         # Auto-resize to 224×224
    batch_size=BATCH_SIZE,       # Group 32 images per batch
    shuffle=True,                # Random order each epoch
    seed=42                       # Reproducible randomization
)

# Validation dataset (no shuffling needed)
val_ds = tf.keras.utils.image_dataset_from_directory(
    val_dir,
    labels="inferred",
    label_mode="categorical",
    image_size=IMG_SIZE,
    batch_size=BATCH_SIZE,
    shuffle=False               # Keep order for evaluation
)
```

**Key Preprocessing Steps Inside `image_dataset_from_directory`**:

| Step | Details |
|------|---------|
| **Image Loading** | Opens each JPEG/PNG file from disk |
| **Resizing** | Resizes to 224×224 (standard ImageNet size) |
| **Format Conversion** | Converts to uint8 (0-255) RGB if needed |
| **Batching** | Groups 32 images into single tensor |
| **Normalization** | Scales to [0, 1] range internally (uint8 → float32 / 255) |
| **Shuffling** | Randomizes order (training only) |

**Dataset Structure Expected**:
```
ml/datasets/
├── train/
│   ├── healthy/      (images of good tires)
│   └── critical/     (images of worn tires)
├── validation/
│   ├── healthy/
│   └── critical/
└── test/
    ├── healthy/
    └── critical/
```

### 2.2 Data Augmentation Pipeline

**File**: [COLAB_NOTEBOOK_CODE.py](COLAB_NOTEBOOK_CODE.py#L140-L160)

**Augmentation Strategy**:
```python
def augment_fn(images, labels):
    """Apply transformations ONLY to training data"""
    
    # 1. Random horizontal flip (left-right)
    images = tf.image.random_flip_left_right(images)
    
    # 2. Random rotation (±0.08 radians ≈ ±4.6 degrees)
    images = tf.image.random_rotation(images, 0.08)
    
    # 3. Random zoom (90%-110% of original)
    images = tf.image.random_zoom(images, [0.9, 1.1])
    
    # 4. Random contrast (90%-110% brightness)
    images = tf.image.random_contrast(images, 0.9, 1.1)
    
    return images, labels

# Apply augmentation to training set ONLY
train_ds = train_ds.map(augment_fn, num_parallel_calls=tf.data.AUTOTUNE)

# Cache and prefetch for performance
train_ds = train_ds.cache().prefetch(tf.data.AUTOTUNE)
val_ds = val_ds.cache().prefetch(tf.data.AUTOTUNE)
test_ds = test_ds.cache().prefetch(tf.data.AUTOTUNE)
```

**Augmentation Rationale**:

| Technique | Purpose | Effect |
|-----------|---------|--------|
| **Horizontal Flip** | Handles different tire orientations | Rotation invariance |
| **Rotation (±4.6°)** | Accommodates tilted tire images | Robustness to angles |
| **Zoom (90%-110%)** | Adapts to variable tire sizes/distances | Scale invariance |
| **Contrast (90%-110%)** | Simulates lighting variations | Lighting robustness |

**Why Not Applied to Validation/Test**:
- Validation/test data should represent real-world conditions exactly
- Augmentation on eval data would give inflated accuracy metrics
- Only training benefits from synthetic variations

### 2.3 Class Balancing

**File**: [ml/scripts/train_mobilenetv2.py](ml/scripts/train_mobilenetv2.py#L48-L65)

**Implementation**:
```python
class_counts = count_images_per_class(train_dir, class_names)
# Example: {'healthy': 1000, 'critical': 698}

total = sum(class_counts.values())
class_weight = {
    idx: total / (num_classes * max(class_counts[name], 1))
    for idx, name in enumerate(class_names)
}
# Result: {'healthy': 0.85, 'critical': 1.22}

# Apply during training
model.fit(
    train_ds,
    epochs=20,
    class_weight=class_weight  # Weight loss by class frequency
)
```

**Why Class Weights**:
- Tire images: Healthy tires more common than critical
- Without weighting: Model biases toward predicting "Healthy"
- Class weights penalize errors on minority class (Critical)
- Balances precision/recall across both classes

---

## 3. Model-Specific Input Preprocessing

### 3.1 ResNet50 Preprocessing

**File**: [services/prediction_service.py](services/prediction_service.py#L1-L25)

**ResNet50 Expects ImageNet Normalization**:
```python
from tensorflow.keras.applications.resnet import preprocess_input as resnet_preprocess_input

def _prepare_input(cropped_image, use_mobilenetv2=False):
    # Step 1: Resize to 224×224
    image = cropped_image.resize((224, 224))
    
    # Step 2: Convert to numpy array (0-255 uint8 → float32)
    img_array = np.array(image, dtype=np.float32)
    
    # Step 3: Apply ResNet50-specific preprocessing
    preprocess_fn = resnet_preprocess_input
    img_array = preprocess_fn(img_array.copy())
    
    # Step 4: Add batch dimension
    # Input shape: (224, 224, 3) → (1, 224, 224, 3)
    return np.expand_dims(img_array, axis=0)
```

**What `resnet_preprocess_input` Does**:
```python
# Inside TensorFlow's preprocess_input:
# Subtracts ImageNet channel means:
# R -= 103.939
# G -= 116.779
# B -= 123.68

# These values are empirical means from ImageNet training data
# Shifts image from [0, 255] to approximately [-128, 127] range
```

**Why ResNet50 Preprocessing**:
- ResNet50 trained on ImageNet with these specific normalizations
- Preprocessing standardizes input distribution
- Allows pre-trained weights to function correctly
- Mismatch in preprocessing causes prediction failures

### 3.2 MobileNetV2 Preprocessing

**File**: [services/prediction_service.py](services/prediction_service.py#L6)

**MobileNetV2 Expects Different Normalization**:
```python
from tensorflow.keras.applications.mobilenet_v2 import preprocess_input as mobilenet_preprocess_input

# MobileNetV2 expects input in [-1, 1] range
# Preprocessing: (image / 127.5) - 1.0
# Shifts from [0, 255] → [-1, 1]
```

**Code**:
```python
def _prepare_input(cropped_image, use_mobilenetv2=False):
    image = cropped_image.resize((224, 224))
    img_array = np.array(image, dtype=np.float32)
    
    if use_mobilenetv2:
        img_array = mobilenet_preprocess_input(img_array)  # → [-1, 1]
    else:
        img_array = resnet_preprocess_input(img_array)      # → ~[-128, 127]
    
    return np.expand_dims(img_array, axis=0)
```

### 3.3 Preprocessing in Model Definition (Colab Training)

**File**: [COLAB_NOTEBOOK_CODE.py](COLAB_NOTEBOOK_CODE.py#L157-L170)

**Built into Model Architecture**:
```python
model = tf.keras.Sequential([
    layers.Input(shape=(224, 224, 3)),
    layers.Lambda(lambda x: preprocess_input(x)),  # ← Preprocessing layer
    base_model,                                     # ResNet50 backbone
    layers.GlobalAveragePooling2D(),
    layers.BatchNormalization(),
    layers.Dropout(0.3),
    layers.Dense(256, activation='relu'),
    layers.Dense(1, activation='sigmoid')
])
```

**Advantage of Lambda Layer**:
- Preprocessing happens inside model graph
- Ensures consistent preprocessing at train & inference time
- Preprocessing applied to data before ResNet50

---

## 4. Tire Detection Preprocessing

### 4.1 Heuristic Feature Extraction (Fallback Detection)

**File**: [backend/tyre_detector.py](backend/tyre_detector.py#L100-L135)

**Tread Texture Detection Algorithm**:
```python
def is_tread_texture(image: Image.Image) -> bool:
    """Heuristic to detect tire tread using color & edge analysis"""
    
    if image is None:
        return False
    
    # Step 1: Convert to RGB (normalize color space)
    rgb = image.convert("RGB")
    arr = np.array(rgb)  # Shape: (H, W, 3)
    
    # Step 2: Saturation Analysis (Tyres are gray/black, low saturation)
    # Sample every 8th pixel for speed
    sampled = arr[::8, ::8].reshape(-1, 3).astype(np.float32) / 255.0
    
    # Calculate per-pixel saturation: (max - min) / max
    max_c = sampled.max(axis=1)    # Max RGB value per pixel
    min_c = sampled.min(axis=1)    # Min RGB value per pixel
    sat = np.divide((max_c - min_c), max_c, out=np.zeros_like(max_c), 
                    where=max_c != 0.0)
    mean_sat = float(np.mean(sat))
    
    # Step 3: Edge Detection (Tread patterns have strong edges)
    gray = rgb.convert("L")          # Convert to grayscale
    edges = gray.filter(ImageFilter.FIND_EDGES)  # Canny-like edges
    edge_arr = np.array(edges, dtype=np.float32)
    edge_density = float(np.mean(edge_arr > 10))  # % of pixels edge > threshold 10
    
    # Step 4: Brightness Check (Reject pure black/white images)
    mean_brightness = float(np.mean(np.array(gray)))
    
    # Step 5: Decision Logic
    is_tread = (
        mean_sat < 0.20 and          # Low saturation (grayscale like tire rubber)
        edge_density > 0.05 and      # Significant edges (tread pattern)
        30 < mean_brightness < 220   # Not pure black or white
    )
    
    logger.info("Tread Check: sat=%.3f, edges=%.3f, brightness=%.1f", 
                mean_sat, edge_density, mean_brightness)
    
    return is_tread
```

**Preprocessing Steps Detail**:

| Operation | Input | Output | Purpose |
|-----------|-------|--------|---------|
| **Convert to RGB** | Any format (RGBA, L, etc.) | RGB array | Standardize color space |
| **Saturation Calc** | RGB (0-255) | [0, 1] per-pixel | Measure colorfulness |
| **To Grayscale** | RGB | Grayscale (0-255) | Extract brightness |
| **Edge Detection** | Grayscale | Edge magnitude | Find texture boundaries |
| **Sampling** | Full H×W array | Every 8th pixel | Speed up processing |

**Thresholds Chosen**:
```python
mean_sat < 0.20      # Tires are mostly black/gray (low saturation)
edge_density > 0.05  # 5%+ of pixels are edges (tread grooves)
brightness 30-220    # Not pure black or overexposed white
```

### 4.2 Bounding Box Cropping

**File**: [backend/tyre_detector.py](backend/tyre_detector.py#L186-L203)

**Crop Function**:
```python
def crop_tyre(image: Image.Image, bbox: Tuple[int, int, int, int]) -> Image.Image:
    """Crop tire region and convert to RGB"""
    
    x1, y1, x2, y2 = bbox
    width, height = image.size
    
    # Clamp coordinates to image bounds
    x1 = max(0, min(width, x1))
    y1 = max(0, min(height, y1))
    x2 = max(0, min(width, x2))
    y2 = max(0, min(height, y2))
    
    # Validate bbox validity
    if x2 <= x1 or y2 <= y1:
        raise ValueError("Invalid bounding box for cropping tyre")
    
    # Crop and convert to RGB
    cropped = image.crop((x1, y1, x2, y2)).convert("RGB")
    
    logger.info("Cropped tyre region with size=%s from bbox=%s", 
                cropped.size, bbox)
    
    return cropped
```

**Preprocessing Applied**:
- Bounding box clipping to image boundaries
- RGB conversion (ensures consistent color space)
- Logging for debugging

---

## 5. Local Validation Preprocessing (MobileNetV2)

### 5.1 Saturation Calculation

**File**: [utils/local_validator.py](utils/local_validator.py#L32-L50)

**Purpose**: Detect non-tire images before expensive model inference

**Implementation**:
```python
def get_image_saturation(img: Image.Image) -> float:
    """
    Calculate average saturation using HSV-equivalent formula
    Saturation = (max_RGB - min_RGB) / max_RGB
    """
    # Convert to RGB and normalize 0-1
    rgb = img.convert("RGB")
    arr = np.array(rgb, dtype=np.float32) / 255.0  # Shape: (H, W, 3)
    
    # Per-pixel max and min
    max_c = arr.max(axis=2)      # Maximum of R, G, B
    min_c = arr.min(axis=2)      # Minimum of R, G, B
    
    # Saturation with zero-division protection
    sat = np.divide(
        max_c - min_c,
        max_c,
        out=np.zeros_like(max_c),
        where=max_c > 0          # Avoid division by zero
    )
    
    return float(np.mean(sat))
```

**Why Saturation**:
- Tires are mostly black/gray rubber → LOW saturation (< 0.35)
- Colored objects (cats, cars, shields) → HIGH saturation (> 0.4)
- Fast pre-filter before expensive model inference

### 5.2 MobileNetV2 Image Preprocessing

**File**: [utils/local_validator.py](utils/local_validator.py#L71-L85)

**Implementation**:
```python
# Resize to 224×224 using high-quality LANCZOS interpolation
model_img = pil_img.resize((224, 224), Image.LANCZOS)

# Convert to array and expand batch dimension
x = keras_image.img_to_array(model_img)  # (224, 224, 3) uint8
x = np.expand_dims(x, axis=0)            # (1, 224, 224, 3)

# Apply MobileNetV2-specific preprocessing
x = mobilenet_v2.preprocess_input(x)     # → [-1, 1] range

# Model inference
model = _get_mobilenet_model()
preds = model.predict(x, verbose=0)

# Decode top-5 predictions
decoded = mobilenet_v2.decode_predictions(preds, top=5)[0]
```

**Preprocessing Summary**:

| Step | Input | Output | Purpose |
|------|-------|--------|---------|
| **Load** | JPEG/PNG bytes | PIL Image | Read file |
| **Convert RGB** | Any format | RGB Image | Standardize channels |
| **Resize (LANCZOS)** | Variable size | 224×224 | Model input size |
| **img_to_array** | PIL Image | Numpy (224, 224, 3) uint8 | Array format |
| **Expand dims** | (224, 224, 3) | (1, 224, 224, 3) | Add batch axis |
| **Preprocess** | uint8 [0, 255] | float32 [-1, 1] | Model normalization |

### 5.3 Classification Decision Logic

**File**: [utils/local_validator.py](utils/local_validator.py#L90-L130)

**Multi-Stage Validation**:
```python
is_tyre = False

# Stage 1: Direct keyword matching
for label, score in decoded:
    if any(key in label.lower() for key in DIRECT_TYRE_KEYWORDS):
        # "tire", "tyre", "wheel", "rim" detected
        if score > 0.03:  # Low threshold for certain matches
            is_tyre = True
            break

# Stage 2: Geometric pattern + saturation heuristic
if not is_tyre:
    for label, score in decoded:
        if any(key in label.lower() for key in LOOK_ALIAKE_KEYWORDS):
            # "shield", "manhole", "accordion" detected
            # These share tread's geometric patterns
            if score > 0.05 and saturation < 0.40:
                # BUT low saturation confirms it's grayscale like tire
                is_tyre = True
                break

# Stage 3: Fallback heuristic (pure grayscale assumption)
if not is_tyre and saturation < 0.35:
    # Very low saturation + any confident prediction
    if any(score > 0.08 for _, _, score in decoded):
        is_tyre = True  # Likely a close-up of tire tread
```

**Decision Framework**:
- **Direct Hit** (High confidence): "tire"/"wheel" keywords
- **Indirect Hit** (Medium confidence): Geometric patterns + grayscale
- **Fallback** (Low confidence): Pure saturation-based heuristic

---

## 6. Complete Inference Pipeline Flow

### 6.1 End-to-End Preprocessing Sequence

**File**: [backend/inference_pipeline.py](backend/inference_pipeline.py#L20-L60)

```
1. Upload Image
   ↓
2. Validate Upload [services/validation_service.py]
   - File format check (JPG, PNG, WebP, HEIC)
   - Size validation (< 10 MB)
   - Corruption check (Image.verify())
   - Convert to RGB
   ↓
3. Local Validation [utils/local_validator.py]
   - Load with PIL + convert RGB
   - Calculate saturation → is image colorful?
   - Resize to 224×224 (LANCZOS)
   - MobileNetV2 preprocess: uint8 → [-1, 1]
   - Inference: Top-5 predictions
   - Decision: Is this a tire?
   ↓
4. Tire Detection [backend/tyre_detector.py]
   - YOLOv8 inference (if trained)
     OR
   - Heuristic fallback:
     * Convert to RGB
     * Calculate saturation (low = tire-like)
     * Canny edge detection
     * Find largest contour
     * Return bounding box
   ↓
5. Crop Tire [backend/tyre_detector.py]
   - Clamp bbox to image bounds
   - Crop region from bbox
   - Convert to RGB
   ↓
6. Wear Classification [services/prediction_service.py]
   - Resize cropped tire to 224×224
   - Convert to float32
   - Apply ResNet50 preprocess_input()
   - Expand batch dimension
   - Model inference
   - Output: wear_level (0-100%)
   ↓
7. Decision & Response
   - Map wear_level → health status
   - Save to MongoDB
   - Return JSON response
```

### 6.2 Preprocessing at Each Stage

| Stage | Input Format | Preprocessing | Output |
|-------|--------------|-----------------|--------|
| **Upload** | JPEG/PNG/WebP bytes | Format check, RGB conversion | PIL Image |
| **Local Validation** | PIL Image RGB (any size) | Saturation calc, 224×224 resize, MobileNetV2 norm | float32 [-1, 1] (224, 224, 3) |
| **Tire Detection** | PIL Image RGB (any size) | HSV saturation, Canny edges, contour detection | bbox tuple |
| **Cropping** | PIL Image + bbox | Clamp bounds, crop region, RGB convert | PIL Image cropped |
| **Classification** | PIL Image cropped (any size) | 224×224 resize, float32, ResNet50 norm | float32 [-128, 127] (224, 224, 3) |
| **Model Inference** | float32 array | Already preprocessed | Prediction (0-100%) |

---

## 7. Performance Optimizations

### 7.1 Dataset Caching & Prefetching

**File**: [COLAB_NOTEBOOK_CODE.py](COLAB_NOTEBOOK_CODE.py#L150-L155)

```python
# Cache: Store dataset in RAM after first epoch
train_ds = train_ds.cache()

# Prefetch: Load next batch while GPU is training on current batch
train_ds = train_ds.prefetch(tf.data.AUTOTUNE)

# AUTOTUNE: Let TF auto-tune number of buffered batches
```

**Impact**:
- **Cache**: Avoid disk I/O after first epoch (epochs 2+ much faster)
- **Prefetch**: Avoid GPU stalls waiting for data (pipeline parallelism)
- **Expected speedup**: 2-3× faster training

### 7.2 Parallel Augmentation

**File**: [COLAB_NOTEBOOK_CODE.py](COLAB_NOTEBOOK_CODE.py#L150)

```python
train_ds = train_ds.map(augment_fn, num_parallel_calls=tf.data.AUTOTUNE)
```

**Effect**: Augmentation parallelized across CPU cores while GPU trains.

### 7.3 Sampling in Heuristic Detection

**File**: [backend/tyre_detector.py](backend/tyre_detector.py#L115)

```python
# Process every 8th pixel instead of all pixels
sampled = arr[::8, ::8].reshape(-1, 3)  # 64× fewer pixels
```

**Speed**: Saturation calculation is ~64× faster on full HD images.

---

## 8. Preprocessing Hyperparameters Summary

| Parameter | Value | Location | Purpose |
|-----------|-------|----------|---------|
| **Input Size** | 224×224 | Both models | ImageNet standard |
| **Batch Size** | 32 | Training | Memory-speed tradeoff |
| **Max File Size** | 10 MB | Upload validation | Prevent DoS attacks |
| **Saturation Threshold** | 0.20 (detection), 0.35 (validation) | Heuristics | Distinguish tires from colors |
| **Edge Density Min** | 0.05 | Tire detection | Minimum texture |
| **Brightness Range** | 30-220 | Tire detection | Reject under/over-exposed |
| **Rotation Aug** | ±0.08 rad (4.6°) | Training | Handle tilted images |
| **Zoom Aug** | 90%-110% | Training | Handle distance variation |
| **Contrast Aug** | 90%-110% | Training | Handle lighting variation |
| **ResNet50 Means** | [103.939, 116.779, 123.68] | Inference | ImageNet normalization |
| **MobileNetV2 Range** | [-1, 1] | Validation model | Model-specific requirement |

---

## 9. Key Takeaways

### Data Integrity ✅
- **Upload validation** catches corrupted files before processing
- **Format standardization** (RGB) ensures consistent color space
- **Size constraints** prevent memory exhaustion

### Model Compatibility ✅
- **Different preprocessing** for ResNet50 vs MobileNetV2
- **ImageNet means** essential for transfer learning weights to work
- **Batch dimension** required for inference

### Robustness ✅
- **Data augmentation** creates 4× synthetic variations per image
- **Class weighting** balances learnable representations
- **Multi-stage validation** (format → local AI → detection) catches errors early

### Performance ✅
- **Caching & prefetching** reduce training overhead
- **Sampling** speeds heuristic detection
- **Parallel augmentation** uses idle CPU resources

### Safety ✅
- **Low saturation heuristic** rejects colored non-tire images
- **Edge density check** filters out smooth/blank images
- **Brightness range** rejects malformed uploads

---

## 10. Preprocessing Checklist

When processing new tire images, SafeTread applies:

- [ ] File format validation (jpg/png/webp/heic)
- [ ] File size check (< 10 MB)
- [ ] Image corruption detection
- [ ] RGB color space conversion
- [ ] Saturation analysis (colorfulness check)
- [ ] MobileNetV2 preprocessing (local validation)
- [ ] YOLO or heuristic tire detection
- [ ] Bounding box cropping
- [ ] Final resize to 224×224
- [ ] ResNet50/MobileNetV2-specific normalization
- [ ] Batch dimension expansion
- [ ] Model inference

Each step ensures data quality and model readiness!

---

**Document Generated**: March 23, 2026  
**SafeTread Version**: Production (95% Accuracy Model)  
**Preprocessing Complexity**: 10 discrete stages across upload → inference pipeline
