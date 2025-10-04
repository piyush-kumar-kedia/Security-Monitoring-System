import os
import psycopg2
import shutil
import pandas as pd
FACE_IMAGES_DIR = os.path.join('data_upload', 'face_images')
DATA_FACE_IMAGES_DIR = os.path.join('data', 'face_images')

DB_CONFIG = {
    'host': 'localhost',
    'port': 5432,
    'user': 'postgres',
    'password': 'Jayansh@1523', 
    'database': 'face_images'
}

os.makedirs(DATA_FACE_IMAGES_DIR, exist_ok=True)

def get_connection():
    return psycopg2.connect(
        host=DB_CONFIG['host'],
        port=DB_CONFIG['port'],
        user=DB_CONFIG['user'],
        password=DB_CONFIG['password'],
        database=DB_CONFIG['database']
    )

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
