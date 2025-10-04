import os
import psycopg2
import pandas as pd

DB_CONFIG = {
    'host': 'localhost',
    'port': 5432,
    'user': 'postgres',
    'password': 'Jayansh@1523',
    'database': 'entity_data'
}

DATA_DIR = 'data'

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
    return psycopg2.connect(
        host=DB_CONFIG['host'],
        port=DB_CONFIG['port'],
        user=DB_CONFIG['user'],
        password=DB_CONFIG['password'],
        database=DB_CONFIG['database']
    )

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
    conn.close()
    print('All data inserted into ethos database.')

if __name__ == '__main__':
    main()
