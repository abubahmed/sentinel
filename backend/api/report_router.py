from typing import List
from fastapi import HTTPException, Depends, APIRouter, Request
from sqlalchemy.orm import Session
from starlette import status
import api.models as models
from api.database import get_db
import jwt
import os
import dotenv
from datetime import datetime, timezone
from pydantic import BaseModel
from api.util.read_schedule import get_coords_from_schedule_name
import json
import random

dotenv.load_dotenv()
secret = os.getenv("JWT_SECRET")
algorithm = os.getenv("JWT_ALGORITHM")

router = APIRouter(prefix="/reports", tags=["Reports"])


class ReportRequest(BaseModel):
    title: str
    description: str
    dates: list[str] | None = None
    severity: str | None = None
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
            severity=report_request.severity,
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
  
@router.post("/all")
def get_all_reports(request: Request, db: Session = Depends(get_db)):
  user = verify_jwt(request, db) 
  
  try:
    reports = db.query(models.Report).all()
    if not reports:
      raise HTTPException(
        status_code=status.HTTP_404_NOT_FOUND,
        detail="No reports found",
      )
    
    location_map = {}
    instances = []
    for report in reports:
      user_report = db.query(models.User).filter(models.User.id == report.user_id).first()
      if user_report and user_report.institution != user.institution:
        continue
      if (datetime.now(timezone.utc) - report.created_at).days > 5:
        continue
      
      dates = report.dates if report.dates else []
      user_id = report.user_id if report.user_id else None
      schedule_item = db.query(models.Schedule).filter(models.Schedule.user_id == user_id).first()
      schedule_data = json.loads(schedule_item.data) if schedule_item else None
      
      for date in dates:
          day_of_week = datetime.strptime(date, "%Y-%m-%d").strftime("%A")
          print("day of week", day_of_week)
          print("day ", date)
          severity = report.severity if report.severity else None
          
          if schedule_data:
            matching_items = [item for item in schedule_data if item.get('day') == day_of_week]
            print("matching items", matching_items)
            
            for item in matching_items:
              location = item.get('location')
              print("location", location)
              latitude, longitude = None, None
              if location not in location_map:
                latitude = random.uniform(0, 1)
                longitude = random.uniform(0, 1)
                location_map[location] = (latitude, longitude)
                response = get_coords_from_schedule_name(location, user.institution)
                if response and response["success"]:
                  latitude = float(response["latitude"])
                  longitude = float(response["longitude"])
                  location_map[location] = (latitude, longitude)
                else:
                  continue
              latitude, longitude = location_map[location]
                
              exposure = {
                "date": date,
                "location": location,
                "latitude": float(longitude),
                "longitude": float(latitude),
                "class_start": item.get("start"),
                "class_end": item.get("end"),
                "user_id": user_id,
                "report_id": report.id,
                "class": item.get("title"),
                "title": report.title,
                "description": report.description,
                "severity": severity,
              }
              instances.append(exposure)
    
    locations = []
    future = []
    matches = []
    for report in reports:
      user_report = db.query(models.User).filter(models.User.id == report.user_id).first()
      if user_report and user_report.institution != user.institution:
          continue
      if (datetime.now(timezone.utc) - report.created_at).days > 5:
        continue
      
      dates = report.dates if report.dates else []
      user_id = report.user_id if report.user_id else None
      severity = report.severity if report.severity else None
      # if user_id == user.id:
      #   continue
      schedule_item_theirs = db.query(models.Schedule).filter(models.Schedule.user_id == user_id).first()
      schedule_data_theirs = json.loads(schedule_item_theirs.data) if schedule_item_theirs else None
      schedule_item_mine = db.query(models.Schedule).filter(models.Schedule.user_id == user.id).first()
      schedule_data_mine = json.loads(schedule_item_mine.data) if schedule_item_mine else None
      
      for date in dates:     
          if schedule_data_theirs:
            day_of_week = datetime.strptime(date, "%Y-%m-%d").strftime("%A")
            print("day of week", day_of_week)
            print("day ", date)
            matching_items = [item for item in schedule_data_theirs if item.get('day') == day_of_week]
            print("matching items", matching_items)
            
            for item in matching_items:
              location = item.get('location')
              title = item.get('title')
              start_time = item.get('start')
              end_time = item.get('end')
              day_of_week = item.get('day')
              if location not in locations:
                locations.append(location)
              
              schedule_data_mine_match = [
                item_mine for item_mine in schedule_data_mine 
                if item_mine.get('location') == location and 
                  item_mine.get('start') == start_time and 
                  item_mine.get("title") == title and day_of_week == item_mine.get("day")
                 ]
              if len(schedule_data_mine_match) == 0:
                continue              
                
              print("location", location)
              latitude, longitude = None, None
              if location not in location_map:
                latitude = random.uniform(0, 1)
                longitude = random.uniform(0, 1)
                location_map[location] = (latitude, longitude)
                response = get_coords_from_schedule_name(location, user.institution)
                if response and response["success"]:
                  latitude = float(response["latitude"])
                  longitude = float(response["longitude"])
                  location_map[location] = (latitude, longitude)
                else:
                  continue
              latitude, longitude = location_map[location]
                
              exposure_point = {
                "date": date,
                "location": location,
                "latitude": float(longitude),
                "longitude": float(latitude),
                "class_start": item.get("start"),
                "class_end": item.get("end"),
                "user_id": user_id,
                "report_id": report.id,
                "title": report.title,
                "class": title,
                "description": report.description,
                "severity": severity,
              }
              print("Exposure point", exposure_point)
              matches.append(exposure_point)
              
    schedule_item_mine = db.query(models.Schedule).filter(models.Schedule.user_id == user.id).first()
    schedule_data_mine = json.loads(schedule_item_mine.data) if schedule_item_mine else None
    for item in schedule_data_mine:
      location = item.get('location')
      if location in locations:
        future.append(item)
        
    return {"instances": instances, "matches": matches, "future": future}
        
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
    print(token)
    try:
        payload = jwt.decode(token, secret, algorithms=[algorithm])
        user_pl = payload.get("user_id")
        print(user_pl)
        user = db.query(models.User).filter(models.User.id == user_pl).first()
        if not user:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
        return user
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")
