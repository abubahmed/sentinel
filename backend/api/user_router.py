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
from datetime import timedelta, datetime, timezone

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

    existing_user = (
        db.query(models.User).filter(models.User.email == user_user.email).first()
    )
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User with this email already exists",
        )
    new_user = models.User(**user_user.dict())
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    payload = {
        "email": user_user.email,
        "exp": datetime.now(timezone.utc) + timedelta(hours=48),
    }
    token = jwt.encode(payload, secret, algorithm)
    return {
        "detail": "User created successfully",
        "user": new_user,
        "token": token,
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

    user = db.query(models.User).filter(models.User.email == user.email).first()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Invalid credentials"
        )

    if user.password != user.password:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Invalid credentials"
        )

    payload = {
        "email": user.email,
        "exp": datetime.now(timezone.utc) + timedelta(hours=48),
    }
    token = jwt.encode(payload, secret, algorithm)
    return {"token": token, "user": user, "detail": "Login successful"}


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
