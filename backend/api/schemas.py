from pydantic import BaseModel


class UserBase(BaseModel):
  name: str
  institution: str
  email: str
  phone_number: str | None = None
  password: str
  verification_code: str | None = None
  is_verified: bool | None = False
  
  class Config:
    orm_mode = True


class CreateUser(UserBase):
  class Config:
    orm_mode = True
    
class UserLogin(BaseModel):
  email: str
  password: str

  class Config:
    orm_mode = True
    
class CreateSchedule(BaseModel):
  id: int
  user_id: int | None = None
  data: str | None = None
  

  class Config:
    orm_mode = True
    
class CreateReport(BaseModel):
  id: int
  user_id: int | None = None
  title: str | None = None
  description: str | None = None
  self_report: bool | None = True

  class Config:
    orm_mode = True