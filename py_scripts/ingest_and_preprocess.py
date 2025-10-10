import os
import shutil
import pandas as pd
from datetime import datetime
from glob import glob
DB_CONFIG = {
    "dbname": os.getenv("DB_MAIN_NAME"),
    "user": os.getenv("DB_MAIN_USER"),
    "password": os.getenv("DB_MAIN_PASSWORD"),
    "host": os.getenv("DB_MAIN_HOST"),
    "port": os.getenv("DB_MAIN_PORT"),
}

DATA_UPLOAD_DIR = 'data_upload'
DATA_PROCESSED_DIR = 'data'

os.makedirs(DATA_PROCESSED_DIR, exist_ok=True)

DATETIME_COLUMNS = {
    'campus card_swipes.csv': ['timestamp'],
    'cctv_frames.csv': ['timestamp'],
    'face_embeddings.csv': [],
    'free_text_notes (helpdesk or RSVPs).csv': ['timestamp'],
    'lab_bookings.csv': ['start_time', 'end_time'],
    'library_checkouts.csv': ['timestamp'],
    'student or staff profiles.csv': [],
    'wifi_associations_logs.csv': ['timestamp'],
}

DATETIME_FORMAT = '%Y-%m-%d %H:%M:%S'

def preprocess_datetime(df, columns):
    for col in columns:
        if col in df.columns:
            df[col] = pd.to_datetime(df[col], errors='coerce').dt.strftime(DATETIME_FORMAT)
    return df

def preprocess_file(file_path, file_name):
    df = pd.read_csv(file_path)
    dt_cols = DATETIME_COLUMNS.get(file_name, [])
    df = preprocess_datetime(df, dt_cols)
    return df

def main():
    for file_name in os.listdir(DATA_UPLOAD_DIR):
        file_path = os.path.join(DATA_UPLOAD_DIR, file_name)
        if os.path.isfile(file_path) and file_name.endswith('.csv'):
            print(f'Processing {file_name}...')
            df = preprocess_file(file_path, file_name)
            processed_path = os.path.join(DATA_PROCESSED_DIR, file_name)
            df.to_csv(processed_path, index=False)
            os.remove(file_path)
    print('Preprocessing complete. Processed files saved to data/.')

if __name__ == '__main__':
    main()
