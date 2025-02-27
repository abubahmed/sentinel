from typing import List
from fastapi import HTTPException, Depends, APIRouter
from sqlalchemy.orm import Session
from starlette import status
import api.models as models
import api.schemas as schemas
from api.database import get_db
import jwt
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

router = APIRouter(prefix="/users", tags=["Users"])


@router.get("/", response_model=List[schemas.CreateUser])
def test_users(db: Session = Depends(get_db)):

    user = db.query(models.User).all()
    return user


@router.post("/signup", status_code=status.HTTP_201_CREATED)
def test_users_sent(user_user: schemas.CreateUser, db: Session = Depends(get_db)):
  try:
    existing_user = (
      db.query(models.User).filter(models.User.email == user_user.email).first()
    )
    email_extension = user_user.email.split("@")[-1]
    domain_college_map = fetch_and_map_domains()
    if email_extension not in domain_college_map:
      raise HTTPException(
        status_code=status.HTTP_400_BAD_REQUEST,
        detail="Email domain does not match any known institution",
      )
    if domain_college_map[email_extension] != user_user.institution:
      raise HTTPException(
        status_code=status.HTTP_400_BAD_REQUEST,
        detail="Email domain does not match the provided institution",
      )
    if existing_user:
      raise HTTPException(
        status_code=status.HTTP_400_BAD_REQUEST,
        detail="User with this email already exists",
      )
    print(user_user)
    verification_code = str(uuid.uuid4())[:4]
    user_user.verification_code = verification_code
    user_user.is_verified = False
    new_user = models.User(
      **user_user.dict(),
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    send_verification_email(user_user.email, verification_code)

    return {
      "detail": "User created successfully. Please check your email to verify your account.",
      "success": True,
    }
  except Exception as e:
    db.rollback()
    print(f"Exception occurred: {e}")
    raise HTTPException(
      status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
      detail=f"An error occurred: {str(e)}",
    )


class VerificationRequest(BaseModel):
    email: str
    verification_code: str


@router.post("/verify", status_code=status.HTTP_200_OK)
def verify_user(request: VerificationRequest, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == request.email).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="User not found"
        )
    if user.verification_code != request.verification_code:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid verification code"
        )
    user.is_verified = True
    db.commit()
    db.refresh(user)
    payload = {
        "email": user.email,
        "user_id": user.id,
        "exp": datetime.now(timezone.utc) + timedelta(hours=48),
    }
    token = jwt.encode(payload, secret, algorithm)
    return {
        "detail": "User verified successfully",
        "success": True,
        "token": token,
        "user": user,
    }


@router.get("/{id}", response_model=schemas.CreateUser, status_code=status.HTTP_200_OK)
def get_test_one_user(id: int, db: Session = Depends(get_db)):

    idv_user = db.query(models.User).filter(models.User.id == id).first()

    if idv_user is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"The id: {id} you requested for does not exist",
        )
    return idv_user


@router.post("/login", status_code=status.HTTP_200_OK)
def login_test_user(user: schemas.UserLogin, db: Session = Depends(get_db)):

    found_user = db.query(models.User).filter(models.User.email == user.email).first()
    if not found_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Invalid credentials"
        )
    if found_user.password != user.password:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Invalid credentials"
        )
    if found_user.institution != user.institution:
        print(found_user.institution, user.institution)
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Invalid credentials"
        )
    if not found_user.is_verified:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Please verify your account",
        )

    payload = {
        "email": user.email,
        "user_id": found_user.id,
        "exp": datetime.now(timezone.utc) + timedelta(hours=48),
    }
    token = jwt.encode(payload, secret, algorithm)
    return {"token": token, "user": user, "detail": "Login successful", "success": True}


@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_test_user(id: int, db: Session = Depends(get_db)):

    deleted_user = db.query(models.User).filter(models.User.id == id)

    if deleted_user.first() is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"The id: {id} you requested for does not exist",
        )
    deleted_user.delete(synchronize_session=False)
    db.commit()


@router.put("/users/{id}", response_model=schemas.CreateUser)
def update_test_user(
    update_user: schemas.UserBase, id: int, db: Session = Depends(get_db)
):

    updated_user = db.query(models.User).filter(models.User.id == id)

    if updated_user.first() is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail=f"The id:{id} does not exist"
        )
    updated_user.update(update_user.dict(), synchronize_session=False)
    db.commit()

    return updated_user.first()
