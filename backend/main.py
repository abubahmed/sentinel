from fastapi import FastAPI
from backend.routers.user_router import router
from database import engine, SessionLocal
import models
import psycopg2


models.Base.metadata.create_all(bind=engine)
app = FastAPI()
app.include_router(router)


