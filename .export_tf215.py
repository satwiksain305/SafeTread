import tensorflow as tf
import os, shutil
from tensorflow.keras.layers import InputLayer
from tensorflow.keras import mixed_precision

# Patch InputLayer for legacy batch_shape
_orig_from_config = InputLayer.from_config
@classmethod
def _patched_from_config(cls, config):
    if 'batch_shape' in config and 'batch_input_shape' not in config:
        config['batch_input_shape'] = config.pop('batch_shape')
    return _orig_from_config(config)
InputLayer.from_config = _patched_from_config  # type: ignore

custom_objects = {"DTypePolicy": mixed_precision.Policy}

src = r"E:\\SafeTread\\ml\\models\\best_model.h5"
dst_h5 = r"C:\\Users\\satwi\\OneDrive\\Desktop\\SafeTread\\ml\\models\\best_model_tf215.h5"
dst_saved = r"C:\\Users\\satwi\\OneDrive\\Desktop\\SafeTread\\ml\\models\\best_model_tf215_saved"

print("TF version:", tf.__version__)
print("Loading:", src)
model = tf.keras.models.load_model(src, compile=False, custom_objects=custom_objects, safe_mode=False)

print("Saving H5 ->", dst_h5)
model.save(dst_h5, include_optimizer=False)

print("Saving SavedModel ->", dst_saved)
if os.path.exists(dst_saved):
    shutil.rmtree(dst_saved)
model.save(dst_saved, include_optimizer=False)

print("Done.")
