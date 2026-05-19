import base64
import io
import re
import uuid
from PIL import Image


ALLOWED_EXTENSIONS = {"jpg", "jpeg", "png", "webp", "heic", "heif"}
MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024


def _get_stream_size(file_storage):
    file_storage.stream.seek(0, io.SEEK_END)
    size = file_storage.stream.tell()
    file_storage.stream.seek(0)
    return size


def _open_and_verify_image(stream):
    stream.seek(0)
    image = Image.open(stream)
    image.verify()
    stream.seek(0)
    image = Image.open(stream).convert("RGB")
    return image


def validate_uploaded_image(file):
    if not file:
        return {"valid": False, "message": "No image file provided"}

    filename = (file.filename or "").strip()
    if not filename:
        return {"valid": False, "message": "Empty upload"}

    extension = filename.rsplit(".", 1)[-1].lower() if "." in filename else ""
    if extension not in ALLOWED_EXTENSIONS:
        return {"valid": False, "message": "Invalid image format or file too large"}

    size = _get_stream_size(file)
    if size <= 0 or size > MAX_FILE_SIZE_BYTES:
        return {"valid": False, "message": "Invalid image format or file too large"}

    try:
        image = _open_and_verify_image(file.stream)
    except Exception:
        return {"valid": False, "message": "Corrupted or unsupported image file"}

    return {
        "valid": True,
        "image": image,
        "extension": extension,
        "size": size,
        "filename": filename,
    }


def decode_base64_image(image_string):
    if not image_string or not isinstance(image_string, str):
        return {"valid": False, "message": "Invalid base64 image payload"}

    content = image_string.strip()
    mime_ext = "jpg"

    data_uri_match = re.match(r"^data:image\/([a-zA-Z0-9+\-]+);base64,(.+)$", content, flags=re.DOTALL)
    if data_uri_match:
        mime = data_uri_match.group(1).lower()
        content = data_uri_match.group(2)
        if mime in {"jpeg", "jpg"}:
            mime_ext = "jpg"
        elif mime in {"png", "webp", "heic", "heif"}:
            mime_ext = mime

    try:
        decoded = base64.b64decode(content, validate=True)
    except Exception:
        return {"valid": False, "message": "Invalid base64 image payload"}

    if len(decoded) == 0 or len(decoded) > MAX_FILE_SIZE_BYTES:
        return {"valid": False, "message": "Invalid image format or file too large"}

    buffer = io.BytesIO(decoded)
    try:
        image = _open_and_verify_image(buffer)
    except Exception:
        return {"valid": False, "message": "Corrupted or unsupported image file"}

    return {
        "valid": True,
        "image": image,
        "extension": mime_ext,
        "size": len(decoded),
        "filename": f"camera_{uuid.uuid4().hex[:10]}.{mime_ext}",
    }
