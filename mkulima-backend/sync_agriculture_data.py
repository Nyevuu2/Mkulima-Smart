import pandas as pd
import psycopg2
from psycopg2.extras import execute_values
from datetime import datetime

# 1. LINKED EXACTLY TO YOUR CONTEXT METRICS FROM DATABASE.PY
DB_PARAMS = {
    "dbname": "mkulima_smart",
    "user": "postgres",
    "password": "admin",  # <-- Change this to your real Postgres password
    "host": "localhost",
    "port": "5432"
}

def clean_and_sync_portal_data():
    # Load your historical/downloaded excel or CSV file from the ministry site
    try:
        df = pd.read_csv("ministry_commodity_prices.csv")
    except FileNotFoundError:
        print("📁 Data file 'ministry_commodity_prices.csv' not found. Skipping synchronization loop.")
        return

    # Normalize columns to lowercase to prevent string-matching errors
    df.columns = df.columns.str.strip().str.lower()
    
    # 1. Market Map: Associates town markets seen in the portal images with their target County
    market_to_county = {
        "machakos town": "Machakos", "kathiani": "Machakos", "matuu": "Machakos",
        "wote": "Makueni", "makindu": "Makueni", "kibwezi": "Makueni",
        "kitui town": "Kitui", "mwingi": "Kitui", "mutomo": "Kitui"
    }

    # 2. Commodity Map: Standardizes mixed text patterns down to clean tokens
    commodity_filter = {
        "maize": ["maize - dry", "dry maize", "maize", "mahindi"],
        "ndengu": ["green grams", "ndengu", "mung beans", "grams"]
    }

    cleaned_records = []

    for _, row in df.iterrows():
        raw_commodity = str(row.get('commodity', '')).lower().strip()
        raw_market = str(row.get('market', '')).lower().strip()
        
        # Match commodity type
        crop_key = None
        for key, variations in commodity_filter.items():
            if any(var in raw_commodity for var in variations):
                crop_key = key
                break
                
        # Match target market/county location index
        county_name = market_to_county.get(raw_market)
        
        if not crop_key or not county_name:
            continue # Skip records outside our project domain (e.g., Sorghum, Nairobi)

        # Standardize metric values: Read Wholesale price per 90kg bag
        try:
            wholesale_price = float(row.get('wholesale_price', row.get('wholesale', 0)))
        except ValueError:
            wholesale_price = 0.0
        
        # Safe format fallback check for data dates
        raw_date = row.get('date', datetime.today().strftime('%Y-%m-%d'))

        cleaned_records.append((
            crop_key,
            county_name,
            raw_market.title(),
            wholesale_price,
            raw_date
        ))

    # 3. Batch insert/update records directly into your shared local database
    if cleaned_records:
        conn = psycopg2.connect(**DB_PARAMS)
        cursor = conn.cursor()
        
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS crop_market_prices (
                id SERIAL PRIMARY KEY,
                crop VARCHAR(30),
                county VARCHAR(30),
                market VARCHAR(50),
                wholesale_price NUMERIC(10,2),
                record_date DATE,
                UNIQUE(crop, market, record_date)
            );
        """)
        
        upsert_query = """
            INSERT INTO crop_market_prices (crop, county, market, wholesale_price, record_date)
            VALUES %s
            ON CONFLICT (crop, market, record_date) 
            DO UPDATE SET wholesale_price = EXCLUDED.wholesale_price;
        """
        execute_values(cursor, upsert_query, cleaned_records)
        conn.commit()
        cursor.close()
        conn.close()
        print(f"✅ Successfully tracked and updated {len(cleaned_records)} entries into the database.")

if __name__ == "__main__":
    clean_and_sync_portal_data()