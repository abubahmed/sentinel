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
from api.util.read_schedule import extract_calendar_info_from_base64
from fastapi import HTTPException, Depends, APIRouter, Request
import json

dotenv.load_dotenv()

router = APIRouter(prefix="/reports", tags=["Reports"])


class ReportRequest(BaseModel):
    title: str
    description: str
    dates: list[str] | None = None
@router.post("/create", status_code=status.HTTP_201_CREATED)
def upload_report(report_request: ReportRequest, request: Request, db: Session = Depends(get_db)):
    if not report_request.title or not report_request.description:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Title and description are required",
        )
    user = verify_jwt(request, db)
    try:
        new_report = models.Report(
            title=report_request.title,
            description=report_request.description,
            dates=report_request.dates,
            created_at=datetime.now(timezone.utc),
            user_id=user.id,
        )
        db.add(new_report)
        db.commit()
        db.refresh(new_report)
    except Exception as e:
        print("Error creating report:", e)
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Failed to upload report",
        )
    return {"detail": "Report uploaded successfully", "success": True}
  
@router.get("/all")
def get_all_reports(db: Session = Depends(get_db)):
  try:
    reports = db.query(models.Report).all()
    if not reports:
      raise HTTPException(
        status_code=status.HTTP_404_NOT_FOUND,
        detail="No reports found",
      )
    locations = []
    for report in reports:
      dates = json.loads(report.dates) if report.dates else []
      user_id = report.user_id if report.user_id else None
      schedule_item = db.query(models.Schedule).filter(models.Schedule.user_id == user_id).first()
      schedule_data = json.loads(schedule_item.data) if schedule_item else None
      for date in dates:
          day_of_week = datetime.strptime(date, "%Y-%m-%d").strftime("%A")
          if schedule_data:
            matching_items = [item for item in schedule_data if item.get('day') == day_of_week]
            locations.extend([item.get('location') for item in matching_items])
    print(locations)
    return {"locations": locations}
            
        
  except Exception as e:
    print("Error fetching reports:", e)
    raise HTTPException(
      status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
      detail="Failed to fetch reports",
    )
    
def verify_jwt(request: Request, db: Session):
    auth_header = request.headers.get("Authorization")
    if not auth_header:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Authorization header missing")

    token_parts = auth_header.split(" ")
    if len(token_parts) != 2 or token_parts[0].lower() != "bearer":
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid authorization header format")

    token = token_parts[1]
    try:
        payload = jwt.decode(token, secret, algorithms=[algorithm])
        user_id = payload.get("user_id")
        user = db.query(models.User).filter(models.User.id == user_id).first()
        if not user:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
        return user
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")
