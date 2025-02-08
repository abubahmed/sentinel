from fastapi import FastAPI
from api.user_router import router
from api.database import engine, SessionLocal
import api.models as models
import psycopg2


models.Base.metadata.create_all(bind=engine)
app = FastAPI()
app.include_router(router)


