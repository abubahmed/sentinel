from pydantic import BaseModel


class UserBase(BaseModel):
  name: str
  institution: str
  email: str
  phone_number: str
  password: str

  class Config:
    orm_mode = True


class CreateUser(UserBase):
  class Config:
    orm_mode = True