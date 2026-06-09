from fastapi import FastAPI, Depends, Query, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import os
import json
import urllib.request
import numpy as np
import psycopg2
from psycopg2.extras import RealDictCursor
import bcrypt
from datetime import datetime

# 1. IMPORT YOUR ENGINE OBJECT DIRECTLY FROM MODELS.PY
from models import kmeans_engine

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
# DUAL-DATABASE ROUTING CONNECTIONS CONFIGURATION (PORT: 6543)
# ════════════════════════════════════════════════════════════════════════
DB_PARAMS = {
    "dbname": "postgres",  # Your relational database name
    "user": "postgres",
    "password": "yourpassword",  # <-- Change this to your real Postgres password
    "host": "localhost",
    "port": "6543"
}

TIMESCALEDB_PARAMS = {
    "dbname": "mkulima_timescale",  # Your standalone Timescale database name
    "user": "postgres",
    "password": "yourpassword",  # <-- Change this to your real Postgres password
    "host": "localhost",
    "port": "6543"
}

def get_db_connection():
    """Connects to the Teammate's standard web relational tables."""
    return psycopg2.connect(**DB_PARAMS, cursor_factory=RealDictCursor)

def get_timescale_connection():
    """Connects to your structured analytical/TimescaleDB knowledge base."""
    return psycopg2.connect(**TIMESCALEDB_PARAMS, cursor_factory=RealDictCursor)


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
# AUTHENTICATION & FINANCIAL DATA ENDPOINTS (ROUTED VIA STANDARD RELATIONAL DB)
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
# SPECIFIC NESTED LSTM MODEL LOADER ENGINE (FILE-BASED INFERENCE)
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
# INTEGRATED ADVISORY & FINANCIAL DATA ENDPOINT
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
# FIXED: CLUSTER-DRIVEN WEATHER ADVISORY ENDPOINT (FLAT RESPONSE FOR INTERGRATION)
# ════════════════════════════════════════════════════════════════════════

@app.get("/api/weather-advice")
def live_weather_advice(
    county: str = Query(...),
    crop: Optional[str] = Query(None)
):
    # 1. Clean and normalize input parameters
    normalized_county = county.lower().strip() if county else "machakos"
    
    # Clean the crop text completely to capture "Green Grams", "ndengu", or "maize"
    raw_crop = str(crop).lower().strip() if crop else "maize"
    
    # 2. Open-Meteo Dynamic Weather Tracking
    try:
        geo_coordinates = {
            "machakos": {"lat": -1.5183, "lon": 37.2634},
            "kitui": {"lat": -1.3670, "lon": 38.0106},
            "makueni": {"lat": -1.8041, "lon": 37.6203}
        }
        coords = geo_coordinates.get(normalized_county, geo_coordinates["machakos"])
        open_meteo_url = f"https://api.open-meteo.com/v1/forecast?latitude={coords['lat']}&longitude={coords['lon']}&daily=temperature_2m_max,temperature_2m_min,precipitation_sum&timezone=Africa%2FNairobi"
        
        req = urllib.request.Request(open_meteo_url, headers={'User-Agent': 'MkulimaSmartPWA/1.0'})
        with urllib.request.urlopen(req, timeout=5) as response:
            weather_payload = json.loads(response.read().decode())
            avg_max_temp = float(np.mean(weather_payload["daily"]["temperature_2m_max"]))
            avg_min_temp = float(np.mean(weather_payload["daily"]["temperature_2m_min"]))
            total_precip = float(np.sum(weather_payload["daily"]["precipitation_sum"]))
    except Exception:
        if normalized_county == "machakos":
            avg_max_temp, avg_min_temp, total_precip = 26.5, 14.2, 18.5
        elif normalized_county == "kitui":
            avg_max_temp, avg_min_temp, total_precip = 31.0, 18.0, 4.2
        else:
            avg_max_temp, avg_min_temp, total_precip = 29.5, 16.5, 8.0

    # 3. K-Means Live Cluster Assignment
    scaled_vector = kmeans_engine.scale_features(max_temp=avg_max_temp, min_temp=avg_min_temp, rainfall=total_precip)
    predicted_cluster = kmeans_engine.predict_cluster_id(scaled_vector)

    # Clean profile mappings to show on user cards
    RISK_PROFILE_MAPPING = {
        0: "Optimal Moisture Profile",
        1: "Thermal Depression Zone (Cool Stress)",
        2: "Critical Heat & Moisture Deficit",
        3: "Mild Moisture Deficit"
    }
    ALERT_MAPPING = {
        0: "NORMAL STATUS - STABLE DEVELOPMENT",
        1: "WATCH STATUS - THERMAL MONITORING",
        2: "CRITICAL ALERT - EMERGENCY RESPONSE",
        3: "ADVISORY STATUS - CONSERVATION PHASE"
    }
    
    friendly_profile = RISK_PROFILE_MAPPING.get(predicted_cluster, "Standard Regional Microclimate")
    friendly_alert = ALERT_MAPPING.get(predicted_cluster, "DYNAMIC ADVISORY MONITOR")

    # 4. Fetch your exact core columns from TimescaleDB
    row = None
    try:
        conn = get_timescale_connection()
        # Use RealDictCursor to safely map columns to keys without position errors
        cur = conn.cursor(cursor_factory=RealDictCursor)

        cur.execute("""
            SELECT maize_rule, greengrams_rule, agronomic_rationale, source_citation
            FROM agronomic_knowledge_base
            WHERE cluster_id = %s LIMIT 1;
        """, (predicted_cluster,))
        
        db_row = cur.fetchone()
        if db_row:
            row = dict(db_row) # Safely converts the database row to a standard python dictionary
        cur.close()
        conn.close()
    except Exception as db_err:
        print(f"Database read error: {db_err}")

    # Fallback structure if the database row isn't found
    if not row:
        row = {
            "maize_rule": "Standard structural mulching layout recommended around growing base stems. [Fallback Seed Missing]",
            "greengrams_rule": "Monitor root-zone humidity layers closely. Postpone intensive fertilizer applications. [Fallback Seed Missing]",
            "agronomic_rationale": "Historical variations point to baseline seasonal microclimates. [Fallback]",
            "source_citation": "KALRO Extension Libraries"
        }

   
    # 🚨 FIX: Comprehensive, explicit check for both English and Swahili dropdown values
    if "maize" in raw_crop or "mahindi" in raw_crop:
        chosen_advisory_text = row["maize_rule"]
    elif "ndengu" in raw_crop or "gram" in raw_crop:
        chosen_advisory_text = row["greengrams_rule"]
    else:
        # Secure fallback default if the frontend sends an unhandled string structure
        chosen_advisory_text = row["maize_rule"]
        
    return {
        "cluster_id": predicted_cluster,
        "risk_profile": friendly_profile,
        "advisory_title": friendly_alert,
        "advisory_text": chosen_advisory_text,          # Returned cleanly to frontend
        "agronomic_rationale": row["agronomic_rationale"], # Returned cleanly to frontend
        "source_citation": row["source_citation"],
        "telemetry": {
            "temperature": round(avg_max_temp, 1),
            "precipitation": round(total_precip, 1),
            "humidity": 60.0
        } 
    }
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True) 