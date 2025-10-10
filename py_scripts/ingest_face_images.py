import os
import psycopg2
import shutil
import pandas as pd
from dotenv import load_dotenv

load_dotenv()


FACE_IMAGES_DIR = os.path.join('data_upload', 'face_images')
DATA_FACE_IMAGES_DIR = os.path.join('data', 'face_images')

os.makedirs(DATA_FACE_IMAGES_DIR, exist_ok=True)

def get_connection():
    db_config = {
        'host': os.getenv("DB_MAIN_HOST"),
        'port': os.getenv("DB_MAIN_PORT"),
        'user': os.getenv("DB_MAIN_USER"),
        'password': os.getenv("DB_MAIN_PASSWORD"),
        'database': os.getenv("DB_MAIN_NAME")
    }
    return psycopg2.connect(**db_config)

def ingest_images():
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
    conn.close()
    print('All images ingested, copied to data/face_images, and data_upload/face_images cleared.')

if __name__ == '__main__':
    ingest_images()
