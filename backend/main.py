from fastapi import FastAPI
from api.user_router import router as user_router
from api.schedule_router import router as schedule_router
from api.report_router import router as report_router
from api.database import engine, SessionLocal
import api.models as models
import psycopg2


models.Base.metadata.create_all(bind=engine)
app = FastAPI()
app.include_router(user_router)
app.include_router(schedule_router)
app.include_router(report_router)