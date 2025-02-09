from api.database import Base
from sqlalchemy import Column, Integer, String, TIMESTAMP, Boolean, text


class User(Base):
    __tablename__ = "users"

    id = Column(Integer,primary_key=True,nullable=False)
    name = Column(String,nullable=True)
    institution = Column(String,nullable=True)
    email = Column(String,nullable=False)
    phone_number = Column(String,nullable=True)
    password = Column(String,nullable=True)
    verification_code = Column(String,nullable=True)
    is_verified = Column(Boolean,default=False)
    created_at = Column(TIMESTAMP(timezone=True), server_default=text('now()'))