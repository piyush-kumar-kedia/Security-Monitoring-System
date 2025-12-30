import psycopg2
import os
from dotenv import load_dotenv
from datetime import datetime

load_dotenv()

DB_CONFIG = {
    "dbname": os.getenv("DB_MAIN_NAME"),
    "user": os.getenv("DB_MAIN_USER"),
    "password": os.getenv("DB_MAIN_PASSWORD"),
    "host": os.getenv("DB_MAIN_HOST"),
    "port": os.getenv("DB_MAIN_PORT"),
}

SQL_FILE = os.path.join(os.path.dirname(__file__), "create_indexes.sql")


def main():
    # Check SQL file
    if not os.path.exists(SQL_FILE):
        print(f"Can't find '{SQL_FILE}'")
        return
    
    # Read SQL file
    try:
        with open(SQL_FILE, 'r') as f:
            sql_content = f.read()
    except Exception as e:
        print(f"Error reading file: {e}")
        return
    
    conn = None
    
    try:
        # Connect and create indexes
        conn = psycopg2.connect(**DB_CONFIG)
        cursor = conn.cursor()
        
        cursor.execute(sql_content)
        conn.commit()
        
        print("Indexes created successfully!")
        
        cursor.close()
        
    except psycopg2.OperationalError as e:
        print(f"Connection failed: {e}")
        
    except Exception as e:
        print(f"Error: {e}")
        if conn:
            conn.rollback()
        
    finally:
        if conn:
            conn.close()


if __name__ == "__main__":
    main()
