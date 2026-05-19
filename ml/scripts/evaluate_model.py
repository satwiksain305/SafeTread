import os
import numpy as np
import tensorflow as tf

PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
DATA_ROOT = os.environ.get("DATA_ROOT", os.path.join(PROJECT_ROOT, "ml", "datasets"))
MODEL_PATH = os.path.join(PROJECT_ROOT, "ml", "models", "best_model.h5")

ALLOWED_EXTS = {".jpg", ".jpeg", ".png", ".bmp"}


def count_images(root_dir):
    total = 0
    for dirpath, _, filenames in os.walk(root_dir):
        for name in filenames:
            _, ext = os.path.splitext(name.lower())
            if ext in ALLOWED_EXTS:
                total += 1
    return total


def count_images_per_class(train_dir, class_names):
    counts = {}
    for name in class_names:
        class_dir = os.path.join(train_dir, name)
        counts[name] = count_images(class_dir)
    return counts


def list_classes(train_dir):
    return sorted([
        name for name in os.listdir(train_dir)
        if os.path.isdir(os.path.join(train_dir, name))
    ])


def build_dataset(split_dir, image_size, batch_size):
    return tf.keras.utils.image_dataset_from_directory(
        split_dir,
        labels="inferred",
        label_mode="int",
        image_size=image_size,
        batch_size=batch_size,
        shuffle=False,
    )


def has_images(split_dir):
    if not os.path.isdir(split_dir):
        return False
    for dirpath, _, filenames in os.walk(split_dir):
        for name in filenames:
            _, ext = os.path.splitext(name.lower())
            if ext in ALLOWED_EXTS:
                return True
    return False


def main():
    train_dir = os.path.join(DATA_ROOT, "train")
    val_dir = os.path.join(DATA_ROOT, "validation")
    test_dir = os.path.join(DATA_ROOT, "test")

    if not os.path.isdir(train_dir):
        raise FileNotFoundError(f"Train folder not found: {train_dir}")

    class_names = list_classes(train_dir)
    num_classes = len(class_names)

    total_images = count_images(DATA_ROOT)
    print(f"Total images: {total_images}")
    print(f"Classes ({num_classes}): {class_names}")
    class_counts = count_images_per_class(train_dir, class_names)
    print(f"Train images per class: {class_counts}")

    if not os.path.exists(MODEL_PATH):
        raise FileNotFoundError(f"Model not found: {MODEL_PATH}")

    print(f"Loading model: {MODEL_PATH}")
    model = tf.keras.models.load_model(MODEL_PATH, compile=False)
    model.summary()

    output_units = model.output_shape[-1]
    print(f"Model output units: {output_units}")

    image_size = (224, 224)
    batch_size = 32

    train_ds = build_dataset(train_dir, image_size, batch_size)
    val_ds = build_dataset(val_dir, image_size, batch_size) if has_images(val_dir) else None
    test_ds = build_dataset(test_dir, image_size, batch_size) if has_images(test_dir) else None

    # NOTE: The model includes a Rescaling layer, so we pass raw pixel values.

    if output_units != num_classes:
        print("WARNING: Model output size does not match dataset classes.")
        print("This will cause incorrect predictions and evaluation errors.")
        return

    model.compile(
        optimizer=tf.keras.optimizers.Adam(learning_rate=1e-4),
        loss="sparse_categorical_crossentropy",
        metrics=["accuracy"],
    )

    train_loss, train_acc = model.evaluate(train_ds, verbose=0)
    print(f"Training accuracy: {train_acc:.4f}")
    print(f"Training loss: {train_loss:.4f}")

    if val_ds is not None:
        val_loss, val_acc = model.evaluate(val_ds, verbose=0)
        print(f"Validation accuracy: {val_acc:.4f}")
        print(f"Validation loss: {val_loss:.4f}")

    eval_ds = test_ds if test_ds is not None else val_ds
    if eval_ds is None:
        print("No validation or test set found for confusion matrix.")
        return

    y_true = []
    y_pred = []
    for batch_images, batch_labels in eval_ds:
        preds = model.predict(batch_images, verbose=0)
        pred_labels = np.argmax(preds, axis=1)
        y_true.extend(batch_labels.numpy().tolist())
        y_pred.extend(pred_labels.tolist())

    cm = tf.math.confusion_matrix(y_true, y_pred, num_classes=num_classes).numpy()
    print("Confusion matrix:")
    print(cm)


if __name__ == "__main__":
    main()
