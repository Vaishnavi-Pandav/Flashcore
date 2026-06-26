import os
import uuid
import cloudinary
import cloudinary.uploader
from fastapi import UploadFile, HTTPException

cloudinary.config(
    cloud_name=os.getenv("CLOUDINARY_CLOUD_NAME"),
    api_key=os.getenv("CLOUDINARY_API_KEY"),
    api_secret=os.getenv("CLOUDINARY_API_SECRET"),
)

ALLOWED_TYPES = {"image/jpeg", "image/png", "image/webp", "image/gif"}
MAX_FILE_SIZE_MB = 5


async def upload_image(file: UploadFile, folder: str = "ecommerce/products") -> str:
    """Upload a single image to Cloudinary and return its secure URL."""
    if file.content_type not in ALLOWED_TYPES:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file type '{file.content_type}'. Allowed: JPEG, PNG, WEBP, GIF.",
        )

    contents = await file.read()
    if len(contents) > MAX_FILE_SIZE_MB * 1024 * 1024:
        raise HTTPException(
            status_code=400,
            detail=f"File too large. Max size is {MAX_FILE_SIZE_MB}MB.",
        )

    public_id = f"{folder}/{uuid.uuid4()}"
    result = cloudinary.uploader.upload(
        contents,
        public_id=public_id,
        overwrite=True,
        resource_type="image",
    )
    return result["secure_url"]


async def upload_images(files: list[UploadFile], folder: str = "ecommerce/products") -> list[str]:
    """Upload multiple images to Cloudinary and return their secure URLs."""
    urls = []
    for file in files:
        url = await upload_image(file, folder)
        urls.append(url)
    return urls


async def delete_image(public_id: str) -> None:
    """Delete an image from Cloudinary by its public ID."""
    cloudinary.uploader.destroy(public_id)
