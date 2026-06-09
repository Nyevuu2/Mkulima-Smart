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

# Import kmeans engine safely — if models.py is missing or broken, the weather
# endpoint falls back gracefully instead of preventing the whole server from starting
try:
    from models import kmeans_engine
    KMEANS_AVAILABLE = True
except Exception as _models_err:
    kmeans_engine = None
    KMEANS_AVAILABLE = False
    print(f"[WARNING] Could not import kmeans_engine from models.py: {_models_err}")
    print("[WARNING] /api/weather-advice will use static fallback cluster data.")

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
# DUAL-DATABASE ROUTING CONNECTIONS CONFIGURATION (PORT: 5432)
# ════════════════════════════════════════════════════════════════════════
<<<<<<< HEAD

# Single active DB config — both relational and TimescaleDB queries use mkulima_smart
DB_PARAMS = {
    "dbname": "mkulima_smart",
    "user": "postgres",
    "password": os.getenv("POSTGRES_PASSWORD", "admin"),
    "host": "localhost",
    "port": "5432"
}
=======
DB_PARAMS = {
    "dbname": "postgres",  # Your relational database name
    "user": "postgres",
   "password": "yourpassword",  # <-- Change this to your real Postgres password
    "host": "localhost",
    "port": "6543"
}

>>>>>>> cd4841284a6d4c3e124646b814715ef4a548d076

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
# ADMIN INVITE CODE — set ADMIN_INVITE_CODE in your .env to change it
# Any teammate who registers with this code gets role='admin'
# Change the env var at any time to revoke the old code
# ════════════════════════════════════════════════════════════════════════
ADMIN_INVITE_CODE = os.getenv("ADMIN_INVITE_CODE", "mkulima-admin-2026")

# ════════════════════════════════════════════════════════════════════════
# PYDANTIC SCHEMAS
# ════════════════════════════════════════════════════════════════════════
class UserRegisterSchema(BaseModel):
    full_name: str
    phone: str
    county: str
    password: str
    username: Optional[str] = None       # optional short login alias
    crop: Optional[str] = "Maize"
    invite_code: Optional[str] = None    # pass ADMIN_INVITE_CODE to get admin role

class UserLoginSchema(BaseModel):
    username: str   # accepts phone, username, or full_name
    password: str

class ExpenseCreateSchema(BaseModel):
    description: str
    category: str
    amount: float
    date: str
    note: Optional[str] = None
    season: Optional[str] = None
    crop: Optional[str] = None
    county: Optional[str] = None

class SaleCreateSchema(BaseModel):
    bags: int
    price_per_bag: float
    sale_date: str
    buyer_note: Optional[str] = None
    season: Optional[str] = None
    crop: Optional[str] = None
    county: Optional[str] = None

class MarketplaceListingSchema(BaseModel):
    farmer_name: str
    crop: str
    quantity: int
    unit: Optional[str] = "90kg bags"
    price_per_unit: float
    phone: str
    county: str
    notes: Optional[str] = None

# ════════════════════════════════════════════════════════════════════════
# AUTH ENDPOINTS
# ════════════════════════════════════════════════════════════════════════

@app.post("/api/auth/register", status_code=201)
def register_user(user_data: UserRegisterSchema):
    hashed_pw = bcrypt.hashpw(user_data.password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

    # Determine role — admin only if invite code matches
    role = "admin" if (user_data.invite_code and user_data.invite_code == ADMIN_INVITE_CODE) else "farmer"

    # Auto-generate username if not provided: firstname_id (finalised after insert)
    conn = get_db_connection()
    cur = conn.cursor()
    try:
        cur.execute("SELECT id FROM users WHERE phone = %s;", (user_data.phone,))
        if cur.fetchone():
            raise HTTPException(status_code=400, detail="A user with this phone number already exists.")

        if user_data.username:
            cur.execute("SELECT id FROM users WHERE username = %s;", (user_data.username,))
            if cur.fetchone():
                raise HTTPException(status_code=400, detail="That username is already taken. Please choose another.")

        cur.execute(
            """INSERT INTO users (full_name, phone, county, crop, role, password_hash)
               VALUES (%s, %s, %s, %s, %s, %s) RETURNING id;""",
            (user_data.full_name, user_data.phone, user_data.county,
             user_data.crop or "Maize", role, hashed_pw)
        )
        new_id = cur.fetchone()['id']

        # Set username: provided value OR auto-generated fallback
        final_username = user_data.username or (
            user_data.full_name.split()[0].lower() + "_" + str(new_id)
        )
        cur.execute("UPDATE users SET username = %s WHERE id = %s;", (final_username, new_id))

        # Create default settings row
        cur.execute(
            "INSERT INTO user_settings (user_id) VALUES (%s) ON CONFLICT (user_id) DO NOTHING;",
            (new_id,)
        )

        conn.commit()
        return {
            "message": "Account created successfully",
            "user": {
                "id": new_id,
                "full_name": user_data.full_name,
                "username": final_username,
                "county": user_data.county,
                "crop": user_data.crop or "Maize",
                "role": role
            }
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
    conn = None
    try:
        conn = get_db_connection()
        cur = conn.cursor()
        # Accept phone, username, OR full_name — whichever the farmer types
        cur.execute(
            "SELECT * FROM users WHERE phone = %s OR username = %s OR full_name = %s;",
            (credentials.username, credentials.username, credentials.username)
        )
        user = cur.fetchone()
        cur.close()
    except Exception as e:
        if conn:
            conn.close()
        raise HTTPException(status_code=503, detail=f"Database unavailable: {str(e)}")
    finally:
        if conn:
            conn.close()

    if user and bcrypt.checkpw(credentials.password.encode('utf-8'), user['password_hash'].encode('utf-8')):
        return {
            "message": "Login successful",
            "user": {
                "id":        user['id'],
                "full_name": user['full_name'],
                "username":  user.get('username'),
                "county":    user['county'],
                "crop":      user.get('crop', 'Maize'),
                "role":      user.get('role', 'farmer'),
            }
        }
    raise HTTPException(status_code=401, detail="Invalid credentials. Check your phone/username and password.")

# ════════════════════════════════════════════════════════════════════════
# EXPENSES
# ════════════════════════════════════════════════════════════════════════

@app.post("/api/expenses/{user_id}", status_code=201)
def add_expense(user_id: int, expense: ExpenseCreateSchema):
    conn = get_db_connection()
    cur = conn.cursor()
    try:
        cur.execute(
            """INSERT INTO expenses (user_id, description, category, amount, date, note, season, crop, county)
               VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s);""",
            (user_id, expense.description, expense.category, expense.amount, expense.date,
             expense.note, expense.season, expense.crop, expense.county)
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
    return [{"id": r['id'], "description": r['description'], "category": r['category'],
             "amount": float(r['amount']), "date": r['date'].strftime('%Y-%m-%d'),
             "note": r.get('note'), "season": r.get('season'),
             "crop": r.get('crop'), "county": r.get('county')} for r in rows]

@app.delete("/api/expenses/{expense_id}")
def delete_expense(expense_id: int):
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute("DELETE FROM expenses WHERE id = %s;", (expense_id,))
    conn.commit()
    cur.close()
    conn.close()
    return {"message": "Expense deleted"}

# ════════════════════════════════════════════════════════════════════════
# SALES
# ════════════════════════════════════════════════════════════════════════

@app.post("/api/sales/{user_id}", status_code=201)
def add_sale(user_id: int, sale: SaleCreateSchema):
    conn = get_db_connection()
    cur = conn.cursor()
    try:
        cur.execute(
            """INSERT INTO sales (user_id, bags, price_per_bag, sale_date, buyer_note, season, crop, county)
               VALUES (%s, %s, %s, %s, %s, %s, %s, %s) RETURNING id, total_revenue;""",
            (user_id, sale.bags, sale.price_per_bag, sale.sale_date,
             sale.buyer_note, sale.season, sale.crop, sale.county)
        )
        row = cur.fetchone()
        conn.commit()
        return {"message": "Sale logged", "id": row['id'], "total_revenue": float(row['total_revenue'])}
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        cur.close()
        conn.close()

@app.get("/api/sales/{user_id}")
def get_sales(user_id: int):
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute("SELECT * FROM sales WHERE user_id = %s ORDER BY sale_date DESC;", (user_id,))
    rows = cur.fetchall()
    cur.close()
    conn.close()
    return [{"id": r['id'], "bags": r['bags'], "price_per_bag": float(r['price_per_bag']),
             "total_revenue": float(r['total_revenue']), "sale_date": r['sale_date'].strftime('%Y-%m-%d'),
             "buyer_note": r.get('buyer_note'), "season": r.get('season'),
             "crop": r.get('crop'), "county": r.get('county')} for r in rows]

# ════════════════════════════════════════════════════════════════════════
# MARKETPLACE
# ════════════════════════════════════════════════════════════════════════

@app.post("/api/marketplace", status_code=201)
def create_listing(listing: MarketplaceListingSchema, user_id: Optional[int] = None):
    conn = get_db_connection()
    cur = conn.cursor()
    try:
        cur.execute(
            """INSERT INTO marketplace_listings
               (user_id, farmer_name, crop, quantity, unit, price_per_unit, phone, county, notes)
               VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s) RETURNING id;""",
            (user_id, listing.farmer_name, listing.crop, listing.quantity, listing.unit,
             listing.price_per_unit, listing.phone, listing.county, listing.notes)
        )
        new_id = cur.fetchone()['id']
        conn.commit()
        return {"message": "Listing posted", "id": new_id}
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        cur.close()
        conn.close()

@app.get("/api/marketplace")
def get_listings(county: Optional[str] = None, crop: Optional[str] = None):
    conn = get_db_connection()
    cur = conn.cursor()
    query = "SELECT * FROM marketplace_listings WHERE status = 'active'"
    params = []
    if county:
        query += " AND LOWER(county) = %s"; params.append(county.lower())
    if crop:
        query += " AND LOWER(crop) = %s"; params.append(crop.lower())
    query += " ORDER BY posted_at DESC;"
    cur.execute(query, params)
    rows = cur.fetchall()
    cur.close()
    conn.close()
    return [{"id": r['id'], "farmer_name": r['farmer_name'], "crop": r['crop'],
             "quantity": r['quantity'], "unit": r['unit'],
             "price_per_unit": float(r['price_per_unit']), "phone": r['phone'],
             "county": r['county'], "notes": r.get('notes'),
             "posted_at": r['posted_at'].strftime('%Y-%m-%d')} for r in rows]

@app.patch("/api/marketplace/{listing_id}/status")
def update_listing_status(listing_id: int, status: str):
    if status not in ("active", "sold", "removed"):
        raise HTTPException(status_code=400, detail="status must be active, sold, or removed")
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute("UPDATE marketplace_listings SET status = %s WHERE id = %s;", (status, listing_id))
    conn.commit()
    cur.close()
    conn.close()
    return {"message": f"Listing marked as {status}"}

# ════════════════════════════════════════════════════════════════════════
# ADMIN ENDPOINTS
# ════════════════════════════════════════════════════════════════════════

def require_admin(user_id: int, conn):
    cur = conn.cursor()
    cur.execute("SELECT role FROM users WHERE id = %s;", (user_id,))
    row = cur.fetchone()
    cur.close()
    if not row or row['role'] != 'admin':
        raise HTTPException(status_code=403, detail="Admin access required.")

@app.get("/api/admin/overview")
def admin_overview(admin_id: int):
    conn = get_db_connection()
    require_admin(admin_id, conn)
    cur = conn.cursor()
    cur.execute("SELECT COUNT(*) AS total FROM users WHERE role = 'farmer';")
    farmer_count = cur.fetchone()['total']
    cur.execute("SELECT COUNT(*) AS total FROM sales;")
    sale_count = cur.fetchone()['total']
    cur.execute("SELECT COUNT(*) AS total FROM marketplace_listings WHERE status = 'active';")
    active_listings = cur.fetchone()['total']
    cur.execute("SELECT COALESCE(SUM(total_revenue),0) AS total FROM sales;")
    total_revenue = float(cur.fetchone()['total'])
    cur.execute("SELECT COUNT(DISTINCT county) AS total FROM users;")
    counties = cur.fetchone()['total']
    cur.close()
    conn.close()
    return {"farmers_registered": farmer_count, "sales_logged": sale_count,
            "active_listings": active_listings,
            "total_platform_revenue_ksh": total_revenue, "counties_covered": counties}

@app.get("/api/admin/farmers")
def admin_get_farmers(admin_id: int):
    conn = get_db_connection()
    require_admin(admin_id, conn)
    cur = conn.cursor()
    cur.execute("""SELECT id, full_name, username, phone, county, crop, role, created_at
                   FROM users ORDER BY created_at DESC;""")
    rows = cur.fetchall()
    cur.close()
    conn.close()
    return [{"id": r['id'], "full_name": r['full_name'], "username": r.get('username'),
             "phone": r['phone'], "county": r['county'], "crop": r.get('crop'),
             "role": r['role'], "joined": r['created_at'].strftime('%Y-%m-%d')} for r in rows]

@app.patch("/api/admin/farmers/{target_id}/role")
def admin_change_role(target_id: int, new_role: str, admin_id: int):
    if new_role not in ("farmer", "admin"):
        raise HTTPException(status_code=400, detail="role must be farmer or admin")
    conn = get_db_connection()
    require_admin(admin_id, conn)
    cur = conn.cursor()
    cur.execute("UPDATE users SET role = %s WHERE id = %s;", (new_role, target_id))
    conn.commit()
    cur.close()
    conn.close()
    return {"message": f"User {target_id} role updated to {new_role}"}

@app.get("/api/admin/marketplace")
def admin_get_all_listings(admin_id: int):
    conn = get_db_connection()
    require_admin(admin_id, conn)
    cur = conn.cursor()
    cur.execute("SELECT * FROM marketplace_listings ORDER BY posted_at DESC;")
    rows = cur.fetchall()
    cur.close()
    conn.close()
    return [{"id": r['id'], "farmer_name": r['farmer_name'], "crop": r['crop'],
             "quantity": r['quantity'], "price_per_unit": float(r['price_per_unit']),
             "phone": r['phone'], "county": r['county'], "status": r['status'],
             "posted_at": r['posted_at'].strftime('%Y-%m-%d')} for r in rows]

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
    if KMEANS_AVAILABLE and kmeans_engine is not None:
        scaled_vector = kmeans_engine.scale_features(max_temp=avg_max_temp, min_temp=avg_min_temp, rainfall=total_precip)
        predicted_cluster = kmeans_engine.predict_cluster_id(scaled_vector)
    else:
        # Static fallback mapping when model isn't loaded
        if total_precip > 20:
            predicted_cluster = 0
        elif avg_max_temp > 30:
            predicted_cluster = 2
        else:
            predicted_cluster = 3

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
        cur = conn.cursor()

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