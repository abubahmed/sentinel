from api.database import Base
from sqlalchemy import Column, Integer, String, TIMESTAMP, Boolean, text
from sqlalchemy.dialects.postgresql import ARRAY


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
    
class Schedule(Base):
    __tablename__ = "schedules"

    id = Column(Integer,primary_key=True,nullable=False)
    user_id = Column(Integer,nullable=True)
    data = Column(String,nullable=True)
    created_at = Column(TIMESTAMP(timezone=True), server_default=text('now()'))
    
class Report(Base):
    __tablename__ = "reports"

    id = Column(Integer,primary_key=True,nullable=False)
    user_id = Column(Integer,nullable=True)
    title = Column(String,nullable=True)
    description = Column(String,nullable=True)
    self_report = Column(Boolean,default=True)
    severity = Column(String,nullable=True)
    dates = Column(ARRAY(String), nullable=True)
    created_at = Column(TIMESTAMP(timezone=True), server_default=text('now()'))