import os
import psycopg2
from psycopg2 import pool
import pandas as pd
from dotenv import load_dotenv

load_dotenv()


DATA_DIR = 'data'

# Connection pool
_db_pool = None

def _initialize_pool():
    """Initialize connection pool on first use."""
    global _db_pool
    if _db_pool is None:
        _db_pool = pool.SimpleConnectionPool(
            minconn=1,
            maxconn=5,
            host=os.getenv("DB_MAIN_HOST"),
            port=os.getenv("DB_MAIN_PORT"),
            user=os.getenv("DB_MAIN_USER"),
            password=os.getenv("DB_MAIN_PASSWORD"),
            database=os.getenv("DB_MAIN_NAME")
        )

# Mapping of file names to table names
FILE_TABLE_MAP = {
    'campus card_swipes.csv': 'campus_card_swipes',
    'cctv_frames.csv': 'cctv_frames',
    'face_embeddings.csv': 'face_embeddings',
    'free_text_notes (helpdesk or RSVPs).csv': 'free_text_notes',
    'lab_bookings.csv': 'lab_bookings',
    'library_checkouts.csv': 'library_checkouts',
    'student or staff profiles.csv': 'student_or_staff_profiles',
    'wifi_associations_logs.csv': 'wifi_associations_logs',
}

# Column renaming for specific files
COLUMN_RENAMES = {
    'lab_bookings.csv': {'attended (YES/NO)': 'attended'},
}

def get_connection():
    """Get a connection from the database pool."""
    _initialize_pool()
    return _db_pool.getconn()

def release_connection(conn):
    """Return a connection to the database pool."""
    if conn and _db_pool:
        _db_pool.putconn(conn)

def insert_dataframe(df, table_name, conn):
    cols = ','.join(df.columns)
    vals = ','.join(['%s'] * len(df.columns))
    insert_sql = f'INSERT INTO {table_name} ({cols}) VALUES ({vals}) ON CONFLICT DO NOTHING'
    cur = conn.cursor()
    success, fail = 0, 0
    first_error = None
    for row in df.itertuples(index=False, name=None):
        try:
            cur.execute('BEGIN;')
            cur.execute(insert_sql, row)
            cur.execute('COMMIT;')
            success += 1
        except Exception as e:
            cur.execute('ROLLBACK;')
            fail += 1
            if not first_error:
                first_error = str(e)
    cur.close()
    print(f"Table {table_name}: {success} rows inserted, {fail} failed.")
    if first_error:
        print(f"First error for {table_name}: {first_error}")

def main():
    conn = None
    try:
        conn = get_connection()
        for file_name, table_name in FILE_TABLE_MAP.items():
            file_path = os.path.join(DATA_DIR, file_name)
            if os.path.exists(file_path):
                print(f'Inserting {file_name} into {table_name}...')
                df = pd.read_csv(file_path)
                # Rename columns if needed
                if file_name in COLUMN_RENAMES:
                    df = df.rename(columns=COLUMN_RENAMES[file_name])
                insert_dataframe(df, table_name, conn)
        print('All data inserted into ethos database.')
    finally:
        if conn:
            release_connection(conn)

if __name__ == '__main__':
    main()
