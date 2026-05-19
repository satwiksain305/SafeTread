import os
import tensorflow as tf

PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
DATA_ROOT = os.environ.get("DATA_ROOT", os.path.join(PROJECT_ROOT, "ml", "datasets"))
MODEL_OUT = os.path.join(PROJECT_ROOT, "ml", "models", "best_mobilenetv2.h5")

BATCH_SIZE = 32
IMG_SIZE = (224, 224)
EPOCHS = 20

train_dir = os.path.join(DATA_ROOT, "train")
val_dir = os.path.join(DATA_ROOT, "validation")

if os.path.isdir(train_dir):
    train_ds = tf.keras.utils.image_dataset_from_directory(
        train_dir,
        labels="inferred",
        label_mode="categorical",
        image_size=IMG_SIZE,
        batch_size=BATCH_SIZE,
    )

    val_ds = tf.keras.utils.image_dataset_from_directory(
        val_dir,
        labels="inferred",
        label_mode="categorical",
        image_size=IMG_SIZE,
        batch_size=BATCH_SIZE,
    ) if os.path.isdir(val_dir) else None
else:
    # Fallback: use DATA_ROOT with automatic validation split
    if not os.path.isdir(DATA_ROOT):
        raise FileNotFoundError(f"Dataset folder not found: {DATA_ROOT}")

    train_ds = tf.keras.utils.image_dataset_from_directory(
        DATA_ROOT,
        labels="inferred",
        label_mode="categorical",
        image_size=IMG_SIZE,
        batch_size=BATCH_SIZE,
        validation_split=0.2,
        subset="training",
        seed=42,
    )

    val_ds = tf.keras.utils.image_dataset_from_directory(
        DATA_ROOT,
        labels="inferred",
        label_mode="categorical",
        image_size=IMG_SIZE,
        batch_size=BATCH_SIZE,
        validation_split=0.2,
        subset="validation",
        seed=42,
    )

class_names = train_ds.class_names
num_classes = len(class_names)
print(f"Classes ({num_classes}): {class_names}")

def count_images_per_class(root_dir, class_names):
    counts = {}
    for name in class_names:
        class_dir = os.path.join(root_dir, name)
        total = 0
        for _, _, filenames in os.walk(class_dir):
            total += len([f for f in filenames if f.lower().endswith((".jpg", ".jpeg", ".png", ".bmp"))])
        counts[name] = total
    return counts

class_root = train_dir if os.path.isdir(train_dir) else DATA_ROOT
class_counts = count_images_per_class(class_root, class_names)
print(f"Train images per class: {class_counts}")

total = sum(class_counts.values())
class_weight = {
    idx: total / (num_classes * max(class_counts[name], 1))
    for idx, name in enumerate(class_names)
}
print(f"Class weights: {class_weight}")

# Data augmentation for robustness
augmentation = tf.keras.Sequential([
    tf.keras.layers.RandomFlip("horizontal"),
    tf.keras.layers.RandomRotation(0.08),
    tf.keras.layers.RandomZoom(0.1),
    tf.keras.layers.RandomContrast(0.1),
], name="augmentation")

# MobileNetV2 expects inputs in [-1, 1]
preprocess = tf.keras.applications.mobilenet_v2.preprocess_input

base_model = tf.keras.applications.MobileNetV2(
    input_shape=IMG_SIZE + (3,),
    include_top=False,
    weights="imagenet",
)
base_model.trainable = False

inputs = tf.keras.Input(shape=IMG_SIZE + (3,))

x = augmentation(inputs)
x = preprocess(x)

x = base_model(x, training=False)
x = tf.keras.layers.GlobalAveragePooling2D()(x)
x = tf.keras.layers.Dropout(0.3)(x)
outputs = tf.keras.layers.Dense(num_classes, activation="softmax")(x)

model = tf.keras.Model(inputs, outputs)

model.compile(
    optimizer=tf.keras.optimizers.Adam(learning_rate=1e-4),
    loss="categorical_crossentropy",
    metrics=["accuracy"],
)

callbacks = [
    tf.keras.callbacks.EarlyStopping(monitor="val_loss", patience=4, restore_best_weights=True),
    tf.keras.callbacks.ReduceLROnPlateau(monitor="val_loss", factor=0.5, patience=2, min_lr=1e-6),
    tf.keras.callbacks.ModelCheckpoint(MODEL_OUT, monitor="val_loss", save_best_only=True),
]

train_ds = train_ds.cache().prefetch(tf.data.AUTOTUNE)
if val_ds is not None:
    val_ds = val_ds.cache().prefetch(tf.data.AUTOTUNE)

history = model.fit(
    train_ds,
    validation_data=val_ds,
    epochs=EPOCHS,
    callbacks=callbacks,
    class_weight=class_weight,
)

print("Training complete. Best model saved to:", MODEL_OUT)
