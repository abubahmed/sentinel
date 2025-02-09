from fastapi import HTTPException, Depends, APIRouter, Request
from sqlalchemy.orm import Session
from starlette import status
import json
from datetime import datetime, timezone
import api.models as models
from api.database import get_db
from pydantic import BaseModel
from api.util.read_schedule import extract_calendar_info_from_base64
from api.report_router import verify_jwt

router = APIRouter(prefix="/schedule", tags=["Schedule"])

class ImageRequest(BaseModel):
    image: str

@router.post("/upload", status_code=status.HTTP_201_CREATED)
def upload_image(image_request: ImageRequest, request: Request, db: Session = Depends(get_db)):
    user = verify_jwt(request, db)
    image_data = image_request.image
    if not image_data:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No image data provided",
        )

    try:
        base64_index = image_data.find('base64')
        if base64_index != -1:
            image_data = image_data[base64_index + len('base64'):]
        
        extracted_data = extract_calendar_info_from_base64(image_data)
        if not extracted_data or not extracted_data.get("success") or not extracted_data.get("data"):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Failed to extract data from image",
            )
        
        extracted_data_str = json.dumps(extracted_data["data"])
        print(extracted_data_str)

        new_schedule = models.Schedule(
            data=extracted_data_str,
            created_at=datetime.now(timezone.utc),
            user_id=user.id,
        )

        db.add(new_schedule)
        db.commit()
        db.refresh(new_schedule)
    except Exception as e:
        db.rollback()
        print(f"Exception occurred: {e}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Error processing image",
        )

    return {"detail": "Image uploaded successfully", "success": True}
