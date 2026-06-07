from fastapi import FastAPI, Depends, Query, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import os
import numpy as np
import psycopg2
from psycopg2.extras import RealDictCursor
import bcrypt
from datetime import datetime

# Import machine learning loaders safely
try:
    import joblib
    from tensorflow.keras.models import load_model
    ML_LIBRARIES_AVAILABLE = True
except ImportError:
    ML_LIBRARIES_AVAILABLE = False

app = FastAPI(title="Mkulima Smart API Engine")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins to connect during development
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ════════════════════════════════════════════════════════════════════════
# RAW POSTGRESQL CONNECTION CONFIGURATION
# ════════════════════════════════════════════════════════════════════════
DB_PARAMS = {
    "dbname": "mkulima_smart",
    "user": "postgres",
    "password": "admin",  # <-- Change this to your real Postgres password
    "host": "localhost",
    "port": "5432"
}

def get_db_connection():
    return psycopg2.connect(**DB_PARAMS, cursor_factory=RealDictCursor)

def create_tables():
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id SERIAL PRIMARY KEY,
            full_name VARCHAR(100) NOT NULL,
            phone VARCHAR(20) UNIQUE NOT NULL,
            county VARCHAR(50) NOT NULL,
            password_hash VARCHAR(255) NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    """)
    cur.execute("""
        CREATE TABLE IF NOT EXISTS expenses (
            id SERIAL PRIMARY KEY,
            user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
            description VARCHAR(255) NOT NULL,
            category VARCHAR(50) NOT NULL,
            amount NUMERIC(12, 2) NOT NULL,
            date DATE NOT NULL
        );
    """)
    conn.commit()
    cur.close()
    conn.close()

# Automatically build/verify PostgreSQL tables on startup
create_tables()

# ════════════════════════════════════════════════════════════════════════
# PYDANTIC SCHEMAS FOR USER & EXPENSE INPUT VALIDATION
# ════════════════════════════════════════════════════════════════════════
class UserRegisterSchema(BaseModel):
    full_name: str
    phone: str
    county: str
    password: str

class UserLoginSchema(BaseModel):
    username: str  # Phone or Full name
    password: str

class ExpenseCreateSchema(BaseModel):
    description: str
    category: str
    amount: float
    date: str  # Format: YYYY-MM-DD

# ════════════════════════════════════════════════════════════════════════
# NEW AUTHENTICATION & FINANCIAL DATA ENDPOINTS (RAW SQL)
# ════════════════════════════════════════════════════════════════════════

@app.post("/api/auth/register", status_code=201)
def register_user(user_data: UserRegisterSchema):
    hashed_pw = bcrypt.hashpw(user_data.password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
    conn = get_db_connection()
    cur = conn.cursor()
    try:
        cur.execute("SELECT id FROM users WHERE phone = %s;", (user_data.phone,))
        if cur.fetchone():
            raise HTTPException(status_code=400, detail="A user with this phone number already exists")
            
        cur.execute(
            """INSERT INTO users (full_name, phone, county, password_hash) 
               VALUES (%s, %s, %s, %s) RETURNING id;""",
            (user_data.full_name, user_data.phone, user_data.county, hashed_pw)
        )
        new_id = cur.fetchone()['id']
        conn.commit()
        return {
            "message": "Account created successfully",
            "user": {"id": new_id, "name": user_data.full_name, "county": user_data.county}
        }
    except Exception as e:
        conn.rollback()
        if isinstance(e, HTTPException): raise e
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        cur.close()
        conn.close()

@app.post("/api/auth/login")
def login_user(credentials: UserLoginSchema):
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute("SELECT * FROM users WHERE phone = %s OR full_name = %s;", (credentials.username, credentials.username))
    user = cur.fetchone()
    cur.close()
    conn.close()

    if user and bcrypt.checkpw(credentials.password.encode('utf-8'), user['password_hash'].encode('utf-8')):
        return {
            "message": "Login successful",
            "user": {"id": user['id'], "full_name": user['full_name'], "county": user['county']}
        }
    raise HTTPException(status_code=401, detail="Invalid login credentials")

@app.post("/api/expenses/{user_id}", status_code=201)
def add_expense(user_id: int, expense: ExpenseCreateSchema):
    conn = get_db_connection()
    cur = conn.cursor()
    try:
        cur.execute(
            """INSERT INTO expenses (user_id, description, category, amount, date)
               VALUES (%s, %s, %s, %s, %s);""",
            (user_id, expense.description, expense.category, expense.amount, expense.date)
        )
        conn.commit()
        return {"message": "Expense saved successfully"}
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        cur.close()
        conn.close()

@app.get("/api/expenses/{user_id}")
def get_expenses(user_id: int):
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute("SELECT * FROM expenses WHERE user_id = %s ORDER BY date DESC;", (user_id,))
    rows = cur.fetchall()
    cur.close()
    conn.close()
    
    return [{
        "id": row['id'],
        "description": row['description'],
        "category": row['category'],
        "amount": float(row['amount']),
        "date": row['date'].strftime('%Y-%m-%d')
    } for row in rows]

# ════════════════════════════════════════════════════════════════════════
# ORIGINAL SPECIFIC NESTED LSTM MODEL LOADER ENGINE
# ════════════════════════════════════════════════════════════════════════
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODELS_DIR = os.path.join(BASE_DIR, "ml-service", "models") 

def predict_crop_price(crop_key: str, base_price: float) -> list:
    model_path = os.path.join(MODELS_DIR, f"{crop_key}_model.h5")
    scaler_path = os.path.join(MODELS_DIR, f"{crop_key}_scaler.pkl")
    
    if ML_LIBRARIES_AVAILABLE and os.path.exists(model_path) and os.path.exists(scaler_path):
        try:
            model = load_model(model_path)
            scaler = joblib.load(scaler_path)
            
            recent_sequence = np.array([base_price - 100, base_price + 50, base_price]).reshape(1, 3, 1)
            predictions = []
            current_seq = recent_sequence.copy()
            for _ in range(3):
                next_pred = model.predict(current_seq, verbose=0)[0][0]
                predictions.append(float(next_pred))
                
                current_seq = np.roll(current_seq, -1)
                current_seq[0, -1, 0] = next_pred
                
            return predictions
        except Exception as e:
            print(f"Model processing exception: {e}. Falling back to baseline shifts.")
            
    return [base_price + 180.0, base_price + 320.0, base_price + 500.0]

# ════════════════════════════════════════════════════════════════════════
# ORIGINAL INTEGRATED ADVISORY & FINANCIAL DATA ENDPOINT
# ════════════════════════════════════════════════════════════════════════
class PriceTimelinePoint(BaseModel):
    month: str
    maize: Optional[float] = None
    greengrams: Optional[float] = None
    f: Optional[bool] = None

class IntegratedIntelligenceResponse(BaseModel):
    crop: str
    county: str
    weather_risk_level: str
    weather_risk_message: str
    soil_moisture: str
    wind_velocity: str
    solar_flux: str
    history_and_forecast: List[PriceTimelinePoint]

@app.get("/")
def read_root():
    return {"message": "Mkulima Smart Backend API running smoothly via FastAPI"}

@app.get("/api/predictions", response_model=IntegratedIntelligenceResponse)
def get_integrated_intelligence(
    crop: str = Query(..., description="maize or ndengu"),
    county: str = Query(..., description="machakos, kitui, or makueni")
):
    normalized_county = county.lower().strip()
    
    if normalized_county == "machakos":
        risk_level, moisture, wind, solar = "ADVISORY", "58%", "7 km/h", "4.9 kWh"
        risk_msg = "Optimal spray windows open Monday afternoon. Wind speeds dropping below critical thresholds."
        maize_base, gg_base = 3400, 9100
    elif normalized_county == "kitui":
        risk_level, moisture, wind, solar = "CRITICAL", "42%", "14 km/h", "5.2 kWh"
        risk_msg = "Precipitation Spike Expected mid-week. Ensure all drainage channels are clear to avoid crop drowning."
        maize_base, gg_base = 3650, 9500
    else:  # Makueni
        risk_level, moisture, wind, solar = "OPTIMAL", "64%", "11 km/h", "4.8 kWh"
        risk_msg = "Soil hydration layers are beautifully balanced. Standard top-dressing routines can proceed."
        maize_base, gg_base = 3200, 8800

    maize_preds = predict_crop_price("maize", maize_base)
    gg_preds = predict_crop_price("ndengu", gg_base)

    timeline = [
        PriceTimelinePoint(month="Oct", maize=maize_base, greengrams=gg_base),
        PriceTimelinePoint(month="Nov", maize=maize_base + 120, greengrams=gg_base + 180),
        PriceTimelinePoint(month="Dec", maize=maize_base - 80, greengrams=gg_base + 350),
        PriceTimelinePoint(month="Jan", maize=maize_base - 250, greengrams=gg_base + 50),
        PriceTimelinePoint(month="Feb", maize=maize_base + 50, greengrams=gg_base - 150),
        PriceTimelinePoint(month="Mar", maize=maize_base + 200, greengrams=gg_base + 250),
        PriceTimelinePoint(month="Apr", maize=maize_preds[0], greengrams=gg_preds[0], f=True),
        PriceTimelinePoint(month="May", maize=maize_preds[1], greengrams=gg_preds[1], f=True),
        PriceTimelinePoint(month="Jun", maize=maize_preds[2], greengrams=gg_preds[2], f=True),
    ]

    return IntegratedIntelligenceResponse(
        crop=crop, county=county,
        weather_risk_level=risk_level, weather_risk_message=risk_msg,
        soil_moisture=moisture, wind_velocity=wind, solar_flux=solar,
        history_and_forecast=timeline
    )

# ════════════════════════════════════════════════════════════════════════
# TEAMMATE'S CLUSTER DRIVEN WEATHER ADVISORY ENDPOINT
# ════════════════════════════════════════════════════════════════════════
@app.get("/api/weather-advice")
def live_weather_advice(county: str = Query(...)):
    normalized_county = county.lower().strip()
    
    if normalized_county == "kitui":
        return {
            "status": "success",
            "data": {
                "cluster_id": 2,
                "climate_condition": "Critical Heat & Moisture Stress",
                "alert_level": "CRITICAL RISK - Drought Mitigation Required",
                "crop_specific_rules": {
                    "Maize": "EMERGENCY: Evapotranspiration exceeds rainfall thresholds. Halt all seed applications. Cover exposed rows.",
                    "Ndengu": "Extreme atmospheric temperatures will induce flower drop. Maintain absolute minimal field disruptions."
                },
                "traceability": {
                    "agronomic_rationale": "Sustained high micro-climate indices paired with moisture depletion forces sudden stomatal closure in crop canopies.",
                    "source_citation": "KALRO Arid and Semi-Arid Lands Technical Directive Document."
                }
            }
        }
    else:
        # Default fallback for alternative areas (e.g., Machakos / Makueni)
        return {
            "status": "success",
            "data": {
                "cluster_id": 1,
                "climate_condition": "Balanced Moisture Equilibrium",
                "alert_level": "NOMINAL STATE - Low Seasonal Risks",
                "crop_specific_rules": {
                    "Maize": "Standard nutrient and moisture support workflows can proceed. Observe early vegetative traits for stalk borers.",
                    "Ndengu": "Excellent microclimatic index layers. Safe to carry out foliar sprays or secondary weeding routines."
                },
                "traceability": {
                    "agronomic_rationale": "Ambient thermal levels perfectly correspond to moisture indices for eastern-province crop varieties.",
                    "source_citation": "Standard Regional Agricultural Extension Handbook."
                }
            }
        }
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)