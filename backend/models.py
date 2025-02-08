from database import Base
from sqlalchemy import Column, Integer, String, TIMESTAMP, Boolean, text


class User(Base):
    __tablename__ = "users"

    id = Column(Integer,primary_key=True,nullable=False)
    name = Column(String,nullable=False)
    institution = Column(String,nullable=False)
    email = Column(String,nullable=False)
    phone_number = Column(String,nullable=False)
    password = Column(String,nullable=True)
    created_at = Column(TIMESTAMP(timezone=True), server_default=text('now()'))