from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
import database
import models

app = FastAPI(title="Mkulima Smart API Engine")

# Enable CORS so your teammate's Vite frontend can communicate with this API securely
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, swap "*" with your explicit frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Tell SQLAlchemy to automatically create the tables on startup
models.Base.metadata.create_all(bind=database.engine)

@app.get("/")
def read_root():
    return {"message": "Mkulima Smart Backend API running smoothly via FastAPI"}