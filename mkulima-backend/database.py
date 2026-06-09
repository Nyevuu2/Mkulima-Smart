import psycopg2
from psycopg2.extras import RealDictCursor

# 1. Your Teammate's Relational DB connection setup
DB_PARAMS = {
    "dbname": "postgres",  # Your relational database name
    "user": "postgres",
    "password": "yourpassword",  # <-- Change this to your real Postgres password
    "host": "localhost",
    "port": "6543"  # Active server host port
}

# 2. YOUR TimescaleDB connection setup
TIMESCALEDB_PARAMS = {
    "dbname": "mkulima_timescale",  # Your standalone Timescale database name
    "user": "postgres",
    "password": "yourpassword",  # <-- Change this to your real Postgres password
    "host": "localhost",
    "port": "6543"  # Coexisting on the same running server port
}

def get_relational_connection():
    """Establishes connection to standard web relational tables pool."""
    return psycopg2.connect(**DB_PARAMS, cursor_factory=RealDictCursor)

def get_timescale_connection():
    """Establishes connection to hyper-structured time-series/analytical tables pool."""
    return psycopg2.connect(**TIMESCALEDB_PARAMS, cursor_factory=RealDictCursor)

def create_tables():
    # ════════════════════════════════════════════════════════════════════════
    # STEP A: BUILDING REGULAR RELATIONAL TABLES (TEAMMATE'S PWA CORE)
    # ════════════════════════════════════════════════════════════════════════
    print("⏳ Initializing Base Relational Database Migration Matrix...")
    rel_conn = get_relational_connection()
    rel_cur = rel_conn.cursor()
    
    try:
        # 1. Base Users Table
        rel_cur.execute("""
            CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                full_name VARCHAR(100) NOT NULL,
                phone VARCHAR(20) UNIQUE NOT NULL,
                county VARCHAR(50) NOT NULL,
                password_hash VARCHAR(255) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        """)
        
        # 2. Base Production Expenses Table
        rel_cur.execute("""
            CREATE TABLE IF NOT EXISTS expenses (
                id SERIAL PRIMARY KEY,
                user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
                description VARCHAR(255) NOT NULL,
                category VARCHAR(50) NOT NULL,
                amount NUMERIC(12, 2) NOT NULL,
                date DATE NOT NULL
            );
        """)
        
        rel_conn.commit()
        print("✅ Relational Core Tables (Users & Expenses) verified successfully.")
    except Exception as e:
        rel_conn.rollback()
        print(f"❌ Error migrating Relational database blocks: {e}")
        raise e
    finally:
        rel_cur.close()
        rel_conn.close()

    # ════════════════════════════════════════════════════════════════════════
    # STEP B: BUILDING K-MEANS KNOWLEDGE TABLES (YOUR TIMESCALEDB INSTANCE)
    # ════════════════════════════════════════════════════════════════════════
    print("\n⏳ Initializing TimescaleDB Analytical Knowledge Engine Matrix...")
    ts_conn = get_timescale_connection()
    ts_cur = ts_conn.cursor()
    
    try:
        # 1. Regional Weather Clusters Mapping Index Map
        ts_cur.execute("""
            CREATE TABLE IF NOT EXISTS weather_clusters (
                county VARCHAR(50) PRIMARY KEY,
                cluster_id INTEGER NOT NULL,
                climate_condition VARCHAR(100) NOT NULL,
                alert_level VARCHAR(100) NOT NULL
            );
        """)

        # 2. Complete Agronomic Expert Knowledge Base Matrix
        ts_cur.execute("""
            CREATE TABLE IF NOT EXISTS agronomic_knowledge_base (
                cluster_id INTEGER PRIMARY KEY,
                maize_rule TEXT NOT NULL,
                greengrams_rule TEXT NOT NULL,
                agronomic_rationale TEXT NOT NULL,
                source_citation VARCHAR(255) NOT NULL
            );
        """)
        
        # 3. Pre-seed baseline county mapping records
        ts_cur.execute("""
            INSERT INTO weather_clusters (county, cluster_id, climate_condition, alert_level) VALUES
            ('machakos', 3, 'Mild Moisture Deficit', 'Elevated Risk - Transition Phase'),
            ('makueni', 2, 'Critical Heat & Moisture Stress', 'CRITICAL RISK - Drought Mitigation'),
            ('kitui', 2, 'Critical Heat & Moisture Stress', 'CRITICAL RISK - Drought Mitigation')
            ON CONFLICT (county) DO NOTHING;
        """)

        # 4. Pre-seed exact structural cluster rule assets from your Colab Notebook
        ts_cur.execute("""
            INSERT INTO agronomic_knowledge_base (cluster_id, maize_rule, greengrams_rule, agronomic_rationale, source_citation) VALUES
            (0, 
             'Favorable soil moisture detected. Proceed with nitrogenous top-dressing.', 
             'Optimal vegetative and podding conditions. Maintain weed-free field.', 
             'High precipitation + moderate heat creates maximum nutrient uptake velocity.', 
             'KALRO ASAL Farming Guidelines; Maize AGRIDaksh Pest Management Matrix'),
             
            (1, 
             'Soil temperatures below optimal threshold for rapid cell division.', 
             'Metabolic slowdown expected. Avoid chemical interventions. Prepare windbreaks.', 
             'Low temperatures reduce root permeability and nutrient transport kinetics.', 
             'Adapted from standard Crop Evapotranspiration (ETc) models for semi-arid zones.'),
             
            (2, 
             'EMERGENCY: Evapotranspiration exceeds rainfall. Halt all planting. For standing crops, apply emergency deficit irrigation.', 
             'Extreme heat may induce flower abortion despite drought tolerance. Avoid field cultivation during peak heat.', 
             'High temperatures combined with severe moisture deficit trigger stomatal closure.', 
             'KALRO Drought Mitigation Strategies for Machakos/Makueni/Kitui.'),
             
            (3, 
             'Declining soil moisture profile. Employ conservation agriculture techniques such as structural mulching.', 
             'Conditions favor rapid pod maturation. Prioritize harvesting mature pods to minimize shattering losses.', 
             'Moderate stress accelerates the reproductive phase (senescence signaling).', 
             'KALRO Green Gram (Ndengu) Production Manual for Eastern Kenya.')
            ON CONFLICT (cluster_id) DO NOTHING;
        """)
        
        ts_conn.commit()
        print("✅ TimescaleDB Knowledge Base Engine Tables verified & pre-seeded successfully.")
        print("\n🚀 Dual-Database Environment Initialization Complete without Errors!")
    except Exception as e:
        ts_conn.rollback()
        print(f"❌ Error migrating TimescaleDB database blocks: {e}")
        raise e
    finally:
        ts_cur.close()
        ts_conn.close()

if __name__ == "__main__":
    create_tables()