from typing import List
from fastapi import HTTPException, Depends
from sqlalchemy.orm import Session
from starlette import status
import models
import schemas
from fastapi import APIRouter
from database import get_db

router = APIRouter(prefix="/users", tags=["Users"])


@router.get("/", response_model=List[schemas.CreateUser])
def test_users(db: Session = Depends(get_db)):

    user = db.query(models.User).all()

    return user


@router.post(
    "/", status_code=status.HTTP_201_CREATED, response_model=List[schemas.CreateUser]
)
def test_users_sent(user_user: schemas.CreateUser, db: Session = Depends(get_db)):

    existing_user = db.query(models.User).filter(models.User.email == user_user.email).first()
    if existing_user:
      raise HTTPException(
        status_code=status.HTTP_400_BAD_REQUEST,
        detail="User with this email already exists",
      )
    new_user = models.User(**user_user.dict())
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return [new_user]


@router.get("/{id}", response_model=schemas.CreateUser, status_code=status.HTTP_200_OK)
def get_test_one_user(id: int, db: Session = Depends(get_db)):

    idv_user = db.query(models.User).filter(models.User.id == id).first()

    if idv_user is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"The id: {id} you requested for does not exist",
        )
    return idv_user


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
