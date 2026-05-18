from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# PostgreSQL connection string format: postgresql://user:password@host:port/db_name
DATABASE_URL = "postgresql://mkulima_admin:mkulima_pass123@localhost:5432/mkulima_db"

# The engine handles the actual connection to the PostgreSQL database
engine = create_engine(DATABASE_URL)

# Each instance of SessionLocal will be a database session
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base class which our database models (tables) will inherit from
Base = declarative_base()

# Dependency tool to yield database sessions to API endpoints
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()