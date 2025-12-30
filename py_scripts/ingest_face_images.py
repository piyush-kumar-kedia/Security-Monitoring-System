import os
import psycopg2
from psycopg2 import pool
import shutil
import pandas as pd
from dotenv import load_dotenv

load_dotenv()


FACE_IMAGES_DIR = os.path.join('data_upload', 'face_images')
DATA_FACE_IMAGES_DIR = os.path.join('data', 'face_images')

os.makedirs(DATA_FACE_IMAGES_DIR, exist_ok=True)

# Connection pool
_db_pool = None

def _initialize_pool():
    """Initialize connection pool on first use."""
    global _db_pool
    if _db_pool is None:
        _db_pool = pool.SimpleConnectionPool(
            minconn=1,
            maxconn=3,
            host=os.getenv("DB_MAIN_HOST"),
            port=os.getenv("DB_MAIN_PORT"),
            user=os.getenv("DB_MAIN_USER"),
            password=os.getenv("DB_MAIN_PASSWORD"),
            database=os.getenv("DB_MAIN_NAME")
        )

def get_connection():
    """Get a connection from the database pool."""
    _initialize_pool()
    return _db_pool.getconn()

def release_connection(conn):
    """Return a connection to the database pool."""
    if conn and _db_pool:
        _db_pool.putconn(conn)

def ingest_images():
    conn = None
    try:
        conn = get_connection()
        cur = conn.cursor()
        for file_name in os.listdir(FACE_IMAGES_DIR):
            file_path = os.path.join(FACE_IMAGES_DIR, file_name)
            if os.path.isfile(file_path) and file_name.lower().endswith('.jpg'):
                with open(file_path, 'rb') as f:
                    image_data = f.read()
                cur.execute(
                    'INSERT INTO face_images (image_id, image_data) VALUES (%s, %s) ON CONFLICT (image_id) DO NOTHING',
                    (file_name, psycopg2.Binary(image_data))
                )
                # Save a copy to data/face_images
                shutil.copy2(file_path, os.path.join(DATA_FACE_IMAGES_DIR, file_name))
                # Delete from data_upload/face_images
                os.remove(file_path)
        conn.commit()
        cur.close()
        print('All images ingested, copied to data/face_images, and data_upload/face_images cleared.')
    finally:
        if conn:
            release_connection(conn)

if __name__ == '__main__':
    ingest_images()
