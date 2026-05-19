import os
import numpy as np
import tensorflow as tf
from PIL import Image, ImageFilter
from tensorflow.keras.applications.resnet import preprocess_input as resnet_preprocess_input


def _find_last_conv_layer_name(model):
    for layer in reversed(model.layers):
        output_shape = getattr(layer, "output_shape", None)
        if output_shape is None:
            continue
        if isinstance(output_shape, tuple) and len(output_shape) == 4:
            return layer.name
        if isinstance(output_shape, list) and output_shape and len(output_shape[0]) == 4:
            return layer.name
    return None


def generate_gradcam_heatmap(model, image, output_path="heatmap_output.jpg"):
    """Generate Grad-CAM overlay image and return saved path."""
    if image is None:
        raise ValueError("Input image is required for Grad-CAM")

    rgb_image = image.convert("RGB")
    original_width, original_height = rgb_image.size

    if model is None:
        edge_map = rgb_image.convert("L").filter(ImageFilter.FIND_EDGES)
        heatmap_arr = np.array(edge_map.resize((original_width, original_height), Image.BILINEAR), dtype=np.uint8)

        color_map = np.zeros((original_height, original_width, 3), dtype=np.uint8)
        color_map[..., 0] = heatmap_arr
        color_map[..., 1] = np.clip((255 - heatmap_arr) * 0.35, 0, 255).astype(np.uint8)

        base_arr = np.array(rgb_image, dtype=np.uint8)
        overlay = np.clip(0.7 * base_arr + 0.3 * color_map, 0, 255).astype(np.uint8)
        overlay_image = Image.fromarray(overlay)

        output_dir = os.path.dirname(output_path)
        if output_dir:
            os.makedirs(output_dir, exist_ok=True)
        overlay_image.save(output_path, format="JPEG", quality=92)
        return output_path

    resized = rgb_image.resize((224, 224))
    img_array = np.array(resized, dtype=np.float32)
    input_tensor = resnet_preprocess_input(img_array.copy())
    input_tensor = np.expand_dims(input_tensor, axis=0)

    last_conv_layer_name = _find_last_conv_layer_name(model)
    if not last_conv_layer_name:
        raise RuntimeError("Could not find a convolutional layer for Grad-CAM")

    grad_model = tf.keras.models.Model(
        [model.inputs],
        [model.get_layer(last_conv_layer_name).output, model.output],
    )

    with tf.GradientTape() as tape:
        conv_outputs, predictions = grad_model(input_tensor)
        if len(predictions.shape) == 2 and predictions.shape[1] == 1:
            target_index = 0
            target_score = predictions[:, 0]
        else:
            target_index = tf.argmax(predictions[0])
            target_score = predictions[:, target_index]

    grads = tape.gradient(target_score, conv_outputs)
    pooled_grads = tf.reduce_mean(grads, axis=(0, 1, 2))
    conv_outputs = conv_outputs[0]
    cam = tf.reduce_sum(tf.multiply(pooled_grads, conv_outputs), axis=-1)
    cam = tf.maximum(cam, 0)
    max_value = tf.reduce_max(cam)
    if float(max_value) > 0:
        cam = cam / max_value

    heatmap = cam.numpy()
    heatmap = Image.fromarray(np.uint8(heatmap * 255)).resize((original_width, original_height), Image.BILINEAR)
    heatmap_arr = np.array(heatmap, dtype=np.uint8)

    color_map = np.zeros((original_height, original_width, 3), dtype=np.uint8)
    color_map[..., 0] = heatmap_arr
    color_map[..., 1] = np.clip((255 - heatmap_arr) * 0.3, 0, 255).astype(np.uint8)
    color_map[..., 2] = np.clip((255 - heatmap_arr) * 0.1, 0, 255).astype(np.uint8)

    base_arr = np.array(rgb_image, dtype=np.uint8)
    overlay = np.clip(0.65 * base_arr + 0.35 * color_map, 0, 255).astype(np.uint8)
    overlay_image = Image.fromarray(overlay)

    output_dir = os.path.dirname(output_path)
    if output_dir:
        os.makedirs(output_dir, exist_ok=True)
    overlay_image.save(output_path, format="JPEG", quality=92)
    return output_path
