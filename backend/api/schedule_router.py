from typing import List
from fastapi import HTTPException, Depends
from sqlalchemy.orm import Session
from starlette import status
import api.models as models
import api.schemas as schemas
from fastapi import APIRouter
from api.database import get_db
import jwt
import time
import os
import dotenv
import uuid
from datetime import timedelta, datetime, timezone
from api.util.school_data import fetch_and_map_domains
from api.util.email_verify import send_verification_email
from pydantic import BaseModel

dotenv.load_dotenv()
secret = os.getenv("JWT_SECRET")
algorithm = os.getenv("JWT_ALGORITHM")

router = APIRouter(prefix="/schedule", tags=["Schedule"])


class ImageRequest(BaseModel):
    image: str


@router.post("/upload", status_code=status.HTTP_201_CREATED)
def upload_image(image_request: ImageRequest, db: Session = Depends(get_db)):
    image_data = image_request.image
    if not image_data:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No image data provided",
        )
    print(image_data)
    return {"detail": "Image uploaded successfully", "success": True}
