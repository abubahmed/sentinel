from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import psycopg2
import os
from dotenv import load_dotenv

load_dotenv()

POSTGRES_USERNAME = os.getenv("POSTGRES_USERNAME", "default_username")
POSTGRES_PASSWORD = os.getenv("POSTGRES_PASSWORD", "default_password")
POSTGRES_DATABASE = os.getenv("POSTGRES_DATABASE", "default_database")
SQLALCHEMY_DATABASE_URL = f"postgresql://{POSTGRES_USERNAME}:{POSTGRES_PASSWORD}@localhost/{POSTGRES_DATABASE}"


def create_db_if_not_exists():
    connection = psycopg2.connect(
        dbname="postgres",
        user=POSTGRES_USERNAME,
        password=POSTGRES_PASSWORD,
    )
    connection.autocommit = True
    cursor = connection.cursor()
    cursor.execute(
        f"SELECT 1 FROM pg_catalog.pg_database WHERE datname = '{POSTGRES_DATABASE}'"
    )
    exists = cursor.fetchone()
    if not exists:
        cursor.execute(f"CREATE DATABASE {POSTGRES_DATABASE}")
    cursor.close()
    connection.close()


create_db_if_not_exists()

engine = create_engine(SQLALCHEMY_DATABASE_URL)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
