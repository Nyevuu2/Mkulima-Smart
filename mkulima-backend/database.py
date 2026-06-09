import psycopg2
from psycopg2.extras import RealDictCursor
import os

# ════════════════════════════════════════════════════════════════════════
# DATABASE CONNECTION PARAMETERS
# Change passwords here or set env vars: POSTGRES_PASSWORD, ADMIN_INVITE_CODE
# ════════════════════════════════════════════════════════════════════════
DB_PARAMS = {
    "dbname": "mkulima_smart",
    "user": "postgres",
    "password": os.getenv("POSTGRES_PASSWORD", "admin"), # Replace 'yourpassword' if needed
    "host": "localhost",
    "port": "5432"
}

# Both the relational and time-series logic now point to the same database
# This prevents 'database does not exist' errors
TIMESCALEDB_PARAMS = {
    "dbname": "mkulima_smart",
    "user": "postgres",
    "password": os.getenv("POSTGRES_PASSWORD", "admin"),
    "host": "localhost",
    "port": "5432"
}

def get_relational_connection():
    return psycopg2.connect(**DB_PARAMS, cursor_factory=RealDictCursor)

def get_timescale_connection():
    return psycopg2.connect(**TIMESCALEDB_PARAMS, cursor_factory=RealDictCursor)


def create_tables():
    # ════════════════════════════════════════════════════════════════════
    # STEP A: RELATIONAL DATABASE (postgres)
    # ════════════════════════════════════════════════════════════════════
    print("⏳ Setting up relational database tables...")
    conn = get_relational_connection()
    cur = conn.cursor()

    try:
        # 1. USERS — core identity table
        cur.execute("""
            CREATE TABLE IF NOT EXISTS users (
                id            SERIAL PRIMARY KEY,
                full_name     VARCHAR(100) NOT NULL,
                phone         VARCHAR(20)  UNIQUE NOT NULL,
                username      VARCHAR(50)  UNIQUE,
                county        VARCHAR(50)  NOT NULL DEFAULT 'Machakos',
                crop          VARCHAR(50)  NOT NULL DEFAULT 'Maize',
                role          VARCHAR(20)  NOT NULL DEFAULT 'farmer',
                password_hash VARCHAR(255) NOT NULL,
                created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        """)

        # Add new columns to existing users table (safe — ignored if already exists)
        for col_sql in [
            "ALTER TABLE users ADD COLUMN IF NOT EXISTS username VARCHAR(50) UNIQUE;",
            "ALTER TABLE users ADD COLUMN IF NOT EXISTS crop VARCHAR(50) NOT NULL DEFAULT 'Maize';",
            "ALTER TABLE users ADD COLUMN IF NOT EXISTS role VARCHAR(20) NOT NULL DEFAULT 'farmer';",
        ]:
            try:
                cur.execute(col_sql)
            except Exception:
                conn.rollback()

        # 2. EXPENSES — farm cost entries
        cur.execute("""
            CREATE TABLE IF NOT EXISTS expenses (
                id          SERIAL PRIMARY KEY,
                user_id     INTEGER REFERENCES users(id) ON DELETE CASCADE,
                description VARCHAR(255) NOT NULL,
                category    VARCHAR(50)  NOT NULL,
                amount      NUMERIC(12, 2) NOT NULL,
                date        DATE NOT NULL,
                note        VARCHAR(255),
                season      VARCHAR(100),
                crop        VARCHAR(50),
                county      VARCHAR(50),
                created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        """)
        for col_sql in [
            "ALTER TABLE expenses ADD COLUMN IF NOT EXISTS note VARCHAR(255);",
            "ALTER TABLE expenses ADD COLUMN IF NOT EXISTS season VARCHAR(100);",
            "ALTER TABLE expenses ADD COLUMN IF NOT EXISTS crop VARCHAR(50);",
            "ALTER TABLE expenses ADD COLUMN IF NOT EXISTS county VARCHAR(50);",
        ]:
            try:
                cur.execute(col_sql)
            except Exception:
                conn.rollback()

        # 3. SALES — income / sales log
        cur.execute("""
            CREATE TABLE IF NOT EXISTS sales (
                id            SERIAL PRIMARY KEY,
                user_id       INTEGER REFERENCES users(id) ON DELETE CASCADE,
                bags          INTEGER NOT NULL,
                price_per_bag NUMERIC(10, 2) NOT NULL,
                total_revenue NUMERIC(12, 2) GENERATED ALWAYS AS (bags * price_per_bag) STORED,
                sale_date     DATE NOT NULL,
                buyer_note    VARCHAR(255),
                season        VARCHAR(100),
                crop          VARCHAR(50),
                county        VARCHAR(50),
                created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        """)

        # 4. MARKETPLACE LISTINGS
        cur.execute("""
            CREATE TABLE IF NOT EXISTS marketplace_listings (
                id             SERIAL PRIMARY KEY,
                user_id        INTEGER REFERENCES users(id) ON DELETE SET NULL,
                farmer_name    VARCHAR(100) NOT NULL,
                crop           VARCHAR(50)  NOT NULL,
                quantity       INTEGER NOT NULL,
                unit           VARCHAR(30)  DEFAULT '90kg bags',
                price_per_unit NUMERIC(10, 2) NOT NULL,
                phone          VARCHAR(20)  NOT NULL,
                county         VARCHAR(50)  NOT NULL,
                notes          TEXT,
                status         VARCHAR(20)  DEFAULT 'active',
                posted_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        """)

        # 5. USER SETTINGS — language, season, calculator state
        cur.execute("""
            CREATE TABLE IF NOT EXISTS user_settings (
                id             SERIAL PRIMARY KEY,
                user_id        INTEGER UNIQUE REFERENCES users(id) ON DELETE CASCADE,
                language       VARCHAR(20)  DEFAULT 'English',
                active_season  VARCHAR(100) DEFAULT 'Long Rains 2026',
                season_calcs   JSON         DEFAULT '{}',
                updated_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        """)

        conn.commit()
        print("✅ Relational tables verified (users, expenses, sales, marketplace_listings, user_settings)")

    except Exception as e:
        conn.rollback()
        print(f"❌ Relational DB error: {e}")
        raise
    finally:
        cur.close()
        conn.close()

    # ════════════════════════════════════════════════════════════════════
    # STEP B: TIMESCALEDB (mkulima_timescale)
    # ════════════════════════════════════════════════════════════════════
    print("\n⏳ Setting up TimescaleDB knowledge tables...")
    ts_conn = get_timescale_connection()
    ts_cur = ts_conn.cursor()

    try:
        ts_cur.execute("""
            CREATE TABLE IF NOT EXISTS weather_clusters (
                county          VARCHAR(50) PRIMARY KEY,
                cluster_id      INTEGER NOT NULL,
                climate_condition VARCHAR(100) NOT NULL,
                alert_level     VARCHAR(100) NOT NULL
            );
        """)

        ts_cur.execute("""
            CREATE TABLE IF NOT EXISTS agronomic_knowledge_base (
                cluster_id          INTEGER PRIMARY KEY,
                maize_rule          TEXT NOT NULL,
                greengrams_rule     TEXT NOT NULL,
                agronomic_rationale TEXT NOT NULL,
                source_citation     VARCHAR(255) NOT NULL
            );
        """)

        ts_cur.execute("""
            INSERT INTO weather_clusters (county, cluster_id, climate_condition, alert_level) VALUES
            ('machakos', 3, 'Mild Moisture Deficit', 'Elevated Risk - Transition Phase'),
            ('makueni',  2, 'Critical Heat & Moisture Stress', 'CRITICAL RISK - Drought Mitigation'),
            ('kitui',    2, 'Critical Heat & Moisture Stress', 'CRITICAL RISK - Drought Mitigation')
            ON CONFLICT (county) DO NOTHING;
        """)

        ts_cur.execute("""
            INSERT INTO agronomic_knowledge_base
                (cluster_id, maize_rule, greengrams_rule, agronomic_rationale, source_citation)
            VALUES
            (0,'Favorable soil moisture. Proceed with nitrogenous top-dressing.',
               'Optimal podding conditions. Maintain weed-free field.',
               'High precipitation + moderate heat creates maximum nutrient uptake velocity.',
               'KALRO ASAL Farming Guidelines'),
            (1,'Soil temperatures below optimal for rapid cell division.',
               'Metabolic slowdown expected. Avoid chemical interventions.',
               'Low temperatures reduce root permeability and nutrient transport.',
               'Crop Evapotranspiration (ETc) models for semi-arid zones'),
            (2,'EMERGENCY: Evapotranspiration exceeds rainfall. Halt planting. Apply emergency deficit irrigation for standing crops.',
               'Extreme heat may induce flower abortion. Avoid field cultivation during peak heat.',
               'High temperatures combined with severe moisture deficit trigger stomatal closure.',
               'KALRO Drought Mitigation Strategies for Machakos/Makueni/Kitui'),
            (3,'Declining soil moisture. Employ conservation agriculture techniques such as mulching.',
               'Conditions favor rapid pod maturation. Prioritize harvesting to minimize shattering.',
               'Moderate stress accelerates the reproductive phase (senescence signaling).',
               'KALRO Green Gram Production Manual for Eastern Kenya')
            ON CONFLICT (cluster_id) DO NOTHING;
        """)

        ts_conn.commit()
        print("✅ TimescaleDB knowledge tables verified and seeded")
        print("\n🚀 Database setup complete!")

    except Exception as e:
        ts_conn.rollback()
        print(f"❌ TimescaleDB error: {e}")
        raise
    finally:
        ts_cur.close()
        ts_conn.close()


if __name__ == "__main__":
    create_tables()