import psycopg2
from psycopg2.extras import RealDictCursor

DB_PARAMS = {
    "dbname": "mkulima_smart",
    "user": "postgres",
    "password": "yourpassword",  # <-- Change this to your real Postgres password
    "host": "localhost",
    "port": "5432"
}

def get_db_connection():
    # RealDictCursor makes queries return rows as dictionaries: {'id': 1, 'full_name': 'John'}
    return psycopg2.connect(**DB_PARAMS, cursor_factory=RealDictCursor)

def create_tables():
    conn = get_db_connection()
    cur = conn.cursor()
    
    # Create Users Table
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
    
    # Create Expenses Table
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
    print("🚀 PostgreSQL tables verified/created successfully!")