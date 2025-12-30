import psycopg2
from psycopg2 import pool
import pandas as pd
import os
import shutil
import glob
from datetime import datetime, timedelta
import numpy as np
from dotenv import load_dotenv


# Load environment variables
load_dotenv()

# ---------- DATABASE CONFIG ----------
DB_MAIN = {
    "dbname": os.getenv("DB_MAIN_NAME"),
    "user": os.getenv("DB_MAIN_USER"),
    "password": os.getenv("DB_MAIN_PASSWORD"),
    "host": os.getenv("DB_MAIN_HOST"),
    "port": os.getenv("DB_MAIN_PORT"),
}

DB_IMAGES = {
    "dbname": os.getenv("DB_IMAGES_NAME"),
    "user": os.getenv("DB_IMAGES_USER"),
    "password": os.getenv("DB_IMAGES_PASSWORD"),
    "host": os.getenv("DB_IMAGES_HOST"),
    "port": os.getenv("DB_IMAGES_PORT"),
}

OUTPUT_DIR = "output"

# ---------- CONNECTION POOLS ----------
_main_pool = None
_images_pool = None

def _initialize_pools():
    """Initialize connection pools on first use."""
    global _main_pool, _images_pool
    
    if _main_pool is None:
        _main_pool = pool.SimpleConnectionPool(
            minconn=2,
            maxconn=20,
            host=os.getenv("DB_MAIN_HOST"),
            port=os.getenv("DB_MAIN_PORT"),
            user=os.getenv("DB_MAIN_USER"),
            password=os.getenv("DB_MAIN_PASSWORD"),
            database=os.getenv("DB_MAIN_NAME")
        )
    
    if _images_pool is None:
        _images_pool = pool.SimpleConnectionPool(
            minconn=1,
            maxconn=5,
            host=os.getenv("DB_IMAGES_HOST"),
            port=os.getenv("DB_IMAGES_PORT"),
            user=os.getenv("DB_IMAGES_USER"),
            password=os.getenv("DB_IMAGES_PASSWORD"),
            database=os.getenv("DB_IMAGES_NAME")
        )

# Table identifier mapping: table -> (identifier field, timestamp field)
TABLES = {
    "wifi_associations_logs": ("device_hash", "timestamp"),
    "library_checkouts": ("entity_id", "timestamp"),
    "lab_bookings": ("entity_id", "start_time"),
    "free_text_notes": ("entity_id", "timestamp"),
    "cctv_frames": ("face_id", "timestamp"),
    "campus_card_swipes": ("card_id", "timestamp"),
}

# ---------- CONNECTIONS ----------
def connect_main():
    """Get a connection from the main database pool."""
    _initialize_pools()
    return _main_pool.getconn()

def connect_images():
    """Get a connection from the images database pool."""
    _initialize_pools()
    return _images_pool.getconn()

def release_main(conn):
    """Return a connection to the main database pool."""
    if conn and _main_pool:
        _main_pool.putconn(conn)

def release_images(conn):
    """Return a connection to the images database pool."""
    if conn and _images_pool:
        _images_pool.putconn(conn)

# ---------- OUTPUT FOLDER ----------
def clear_output_folder():
    if os.path.exists(OUTPUT_DIR):
        shutil.rmtree(OUTPUT_DIR)
        print(f"Cleared existing '{OUTPUT_DIR}' folder.")
    os.makedirs(OUTPUT_DIR, exist_ok=True)

# ---------- TIME NORMALIZATION ----------
def normalize_time_input(t, is_start=True):
    if not t:
        return None
    try:
        return datetime.strptime(t, "%Y-%m-%d %H:%M:%S")
    except ValueError:
        try:
            d = datetime.strptime(t, "%Y-%m-%d")
            return d.replace(hour=0, minute=0, second=0) if is_start else d.replace(hour=23, minute=59, second=59)
        except ValueError:
            raise ValueError("Invalid date format. Use YYYY-MM-DD or YYYY-MM-DD HH:MM:SS")

# ---------- USER INPUT ----------
def get_user_input():
    print("\n--- QUERY INPUT FORM ---")
    print("Provide one identifier: entity_id, name, email, student_id, staff_id, card_id, device_hash, face_id")
    identifier_type = input("Identifier type: ").strip()
    identifier_value = input("Identifier value: ").strip()
    start_time = input("Start time (YYYY-MM-DD or YYYY-MM-DD HH:MM:SS, blank=all): ").strip()
    end_time   = input("End time   (YYYY-MM-DD or YYYY-MM-DD HH:MM:SS, blank=all): ").strip()
    location   = input("Location (optional, blank=all): ").strip()

    return {
        "identifier": {identifier_type: identifier_value},
        "start_time": start_time if start_time else None,
        "end_time": end_time if end_time else None,
        "location": location if location else None
    }

# ---------- RESOLVE ENTITY ----------
def resolve_entity(cur, identifier):
    #print("Resolving entity for identifier:", identifier)
    key, value = list(identifier.items())[0]
    print(f"Resolving entity by {key} = {value} ...")
    cur.execute(f"SELECT * FROM student_or_staff_profiles WHERE {key}=%s", (value,))
    row = cur.fetchone()
    #print("Resolved entity:", row)
    if not row:
        return None
    cols = [desc[0] for desc in cur.description]
    return dict(zip(cols, row))

# ---------- QUERY TABLE ----------
def query_table(cur, table, id_field, id_value, time_field=None, start=None, end=None, location=None):
    sql = f"SELECT * FROM {table} WHERE {id_field}=%s"
    params = [id_value]

    if start and end and time_field:
        sql += f" AND {time_field} BETWEEN %s AND %s"
        params.extend([start, end])

    if location and "location_id" in table:
        sql += " AND location_id=%s"
        params.append(location)

    cur.execute(sql, params)
    rows = cur.fetchall()
    if not rows:
        return pd.DataFrame()
    cols = [desc[0] for desc in cur.description]
    return pd.DataFrame(rows, columns=cols)

# ---------- SAVE IMAGES ----------
def save_images(entity_id, entity_dir=None, save_to_disk=True):
    """Fetch images and optionally save to disk.
    Returns: list of dicts with image_id and image_data
    """
    face_id = "F" + entity_id[1:]  # derive face_id
    conn_img = None
    try:
        conn_img = connect_images()
        cur_img = conn_img.cursor()
        cur_img.execute("SELECT image_id, image_data FROM face_images WHERE image_id LIKE %s", (f"{face_id}%",))
        rows = cur_img.fetchall()
        
        images = []
        for image_id, image_data in rows:
            images.append({"image_id": image_id, "image_data": image_data})
            
            if save_to_disk and entity_dir:
                img_dir = os.path.join(entity_dir, "images")
                os.makedirs(img_dir, exist_ok=True)
                filename = image_id if image_id.lower().endswith(".jpg") else f"{image_id}.jpg"
                with open(os.path.join(img_dir, filename), "wb") as f:
                    f.write(image_data)
        
        if save_to_disk:
            print(f"Saved {len(rows)} images for entity_id={entity_id} (face_id={face_id})")
        return images
    finally:
        if conn_img:
            release_images(conn_img)

# ---------- BUILD TIMELINE ----------
def build_timeline(entity_dir, entity_id, conn_main, save_to_disk=True, data_dict=None):
    """Build timeline from entity data.
    
    Args:
        entity_dir: directory path (only used when save_to_disk=True)
        entity_id: the entity ID
        conn_main: database connection
        save_to_disk: whether to save timeline to disk
        data_dict: dict mapping table names to dataframes (used when save_to_disk=False)
    """
    timeline_records = []

    schema = [
        "source", "event_id", "entity_id", "face_id", "card_id",
        "device_hash", "location_id", "room_id", "ap_id", "book_id",
        "category", "text", "start_time", "end_time", "timestamp",
        "name", "summary"
    ]

    cur = conn_main.cursor()
    try:
        cur.execute("SELECT entity_id, card_id, device_hash, face_id, name FROM student_or_staff_profiles")
        all_profiles = cur.fetchall()
        cols = [desc[0] for desc in cur.description]
        profiles_df = pd.DataFrame(all_profiles, columns=cols)
    finally:
        cur.close()

    def get_names_by_field(field, value):
        if value is None: return None
        matches = profiles_df.loc[profiles_df[field] == value, "name"].unique()
        return ", ".join(matches) if len(matches) > 0 else None

    # Get data from either CSV files or passed data_dict
    table_data = {}
    if save_to_disk and entity_dir:
        csv_files = glob.glob(os.path.join(entity_dir, "*.csv"))
        for file in csv_files:
            table = os.path.splitext(os.path.basename(file))[0]
            table_data[table] = pd.read_csv(file)
    elif data_dict:
        table_data = data_dict
    else:
        # No data available
        return []

    for table, df in table_data.items():
        if df.empty:
            continue

        if table == "lab_bookings":
            for _, row in df.iterrows():
                name = get_names_by_field("entity_id", row.get("entity_id"))
                timeline_records.append({
                    "source": table,
                    "event_id": row.get("booking_id"),
                    "entity_id": row.get("entity_id"),
                    "room_id": row.get("room_id"),
                    "start_time": row.get("start_time"),
                    "end_time": row.get("end_time"),
                    "timestamp": row.get("start_time"),
                    "name": name,
                    "summary": f"🧑‍🔬 {name} booked Room {row.get('room_id')} from {row.get('start_time')} to {row.get('end_time')}"
                })

        elif table == "wifi_associations_logs":
            for _, row in df.iterrows():
                name = get_names_by_field("device_hash", row.get("device_hash"))
                timeline_records.append({
                    "source": table,
                    "device_hash": row.get("device_hash"),
                    "ap_id": row.get("ap_id"),
                    "timestamp": row.get("timestamp"),
                    "name": name,
                    "summary": f"{name} connected to WiFi AP {row.get('ap_id')} at {row.get('timestamp')}"
                })

        elif table == "library_checkouts":
            for _, row in df.iterrows():
                name = get_names_by_field("entity_id", row.get("entity_id"))
                timeline_records.append({
                    "source": table,
                    "event_id": row.get("checkout_id"),
                    "entity_id": row.get("entity_id"),
                    "book_id": row.get("book_id"),
                    "timestamp": row.get("timestamp"),
                    "name": name,
                    "summary": f"{name} checked out Book {row.get('book_id')} at {row.get('timestamp')}"
                })

        elif table == "free_text_notes":
            for _, row in df.iterrows():
                name = get_names_by_field("entity_id", row.get("entity_id"))
                timeline_records.append({
                    "source": table,
                    "event_id": row.get("note_id"),
                    "entity_id": row.get("entity_id"),
                    "category": row.get("category"),
                    "text": row.get("text"),
                    "timestamp": row.get("timestamp"),
                    "name": name,
                    "summary": f"Note for {name}: {row.get('category')} - \"{row.get('text')}\""
                })

        elif table == "cctv_frames":
            for _, row in df.iterrows():
                name = get_names_by_field("face_id", row.get("face_id"))
                timeline_records.append({
                    "source": table,
                    "event_id": row.get("frame_id"),
                    "face_id": row.get("face_id"),
                    "location_id": row.get("location_id"),
                    "timestamp": row.get("timestamp"),
                    "name": name,
                    "summary": f"🎥 {name} seen in CCTV at {row.get('location_id')} on {row.get('timestamp')}"
                })

        elif table == "campus_card_swipes":
            for _, row in df.iterrows():
                names = get_names_by_field("card_id", row.get("card_id"))
                timeline_records.append({
                    "source": table,
                    "card_id": row.get("card_id"),
                    "location_id": row.get("location_id"),
                    "timestamp": row.get("timestamp"),
                    "name": names,
                    "summary": f"Card {row.get('card_id')} (used by {names}) swiped at {row.get('location_id')} on {row.get('timestamp')}"
                })
    

    timeline_df = pd.DataFrame(timeline_records, columns=schema)
    timeline_df["timeline_timestamp"] = pd.to_datetime(
        timeline_df["timestamp"].fillna(timeline_df["start_time"]),
        errors="coerce"
    )
    timeline_df = timeline_df.sort_values("timeline_timestamp")
    
    if save_to_disk and entity_dir:
        out_path = os.path.join(entity_dir, f"entity_{entity_id}_timeline.csv")
        timeline_df.to_csv(out_path, index=False)
        print(f"Timeline saved: {out_path}")
    
    # timeline_df is your DataFrame
    timeline_df = timeline_df.replace({np.nan: None, np.inf: None, -np.inf: None})

    # Convert to list of dicts for JSON
    timeline_list = timeline_df.to_dict(orient="records")
    return timeline_list


#---alerts---

def check_inactive_entities():
    """Check for entities with no activity in the last 12 hours using efficient SQL."""
    conn = None
    try:
        conn = connect_main()
        cur = conn.cursor()
        
        twelve_hours_ago = datetime.now() - timedelta(hours=12)
        
        # Build a single SQL query using UNION ALL to aggregate all events in one pass
        # This allows Postgres to use indexes and parallel execution efficiently
        sql = """
        WITH all_events AS (
            -- WiFi associations
            SELECT p.entity_id, w.timestamp
            FROM wifi_associations_logs w
            JOIN student_or_staff_profiles p ON w.device_hash = p.device_hash
            WHERE p.device_hash IS NOT NULL
            
            UNION ALL
            
            -- Library checkouts
            SELECT entity_id, timestamp
            FROM library_checkouts
            
            UNION ALL
            
            -- Lab bookings
            SELECT entity_id, start_time AS timestamp
            FROM lab_bookings
            
            UNION ALL
            
            -- Free text notes
            SELECT entity_id, timestamp
            FROM free_text_notes
            
            UNION ALL
            
            -- CCTV frames
            SELECT p.entity_id, c.timestamp
            FROM cctv_frames c
            JOIN student_or_staff_profiles p ON c.face_id = p.face_id
            WHERE p.face_id IS NOT NULL
            
            UNION ALL
            
            -- Campus card swipes
            SELECT p.entity_id, s.timestamp
            FROM campus_card_swipes s
            JOIN student_or_staff_profiles p ON s.card_id = p.card_id
            WHERE p.card_id IS NOT NULL
        ),
        entity_last_activity AS (
            SELECT 
                entity_id,
                MAX(timestamp) AS last_activity
            FROM all_events
            GROUP BY entity_id
        )
        SELECT 
            p.entity_id,
            p.card_id,
            p.role,
            p.department,
            p.name,
            COALESCE(ela.last_activity, NULL) AS last_activity
        FROM student_or_staff_profiles p
        LEFT JOIN entity_last_activity ela ON p.entity_id = ela.entity_id
        WHERE ela.last_activity IS NULL OR ela.last_activity < %s
        ORDER BY ela.last_activity NULLS LAST
        """
        
        cur.execute(sql, (twelve_hours_ago,))
        rows = cur.fetchall()
        cols = [desc[0] for desc in cur.description]
        
        inactive_entities = []
        for row in rows:
            entity_dict = dict(zip(cols, row))
            if entity_dict['last_activity']:
                entity_dict['last_activity'] = entity_dict['last_activity'].strftime("%Y-%m-%d %H:%M:%S")
            inactive_entities.append(entity_dict)
        
        cur.close()
        return inactive_entities
    finally:
        if conn:
            release_main(conn)

# ---------- MAIN QUERY FUNCTION ----------

def entity_details(user_input):
    conn_main = None
    try:
        conn_main = connect_main()
        cur_main = conn_main.cursor()

        resolved = resolve_entity(cur_main, user_input["identifier"])
        if not resolved:
            print("Entity not found::")
            return None
        return resolved
    finally:
        if conn_main:
            release_main(conn_main)
    
    

def query_entity(user_input, save_to_disk=False):
    """Query entity timeline data.
    
    Args:
        user_input: dict with identifier, start_time, end_time, location
        save_to_disk: if True, save CSV files and images to OUTPUT_DIR
    
    Returns:
        dict with timeline data and images (in-memory)
    """
    conn_main = None
    try:
        conn_main = connect_main()
        cur_main = conn_main.cursor()

        resolved = resolve_entity(cur_main, user_input["identifier"])
        if not resolved:
            print("Entity not found :(")
            return None
        entity_id = resolved["entity_id"]
        print(f"Resolved to entity_id: {entity_id}")

        card_id = resolved.get("card_id")
        device_hash = resolved.get("device_hash")

        start_time = normalize_time_input(user_input["start_time"], True) if user_input["start_time"] else None
        end_time   = normalize_time_input(user_input["end_time"], False) if user_input["end_time"] else None

        entity_dir = None
        if save_to_disk:
            entity_dir = os.path.join(OUTPUT_DIR, f"entity_{entity_id}")
            os.makedirs(entity_dir, exist_ok=True)

        # Collect data in-memory
        data_dict = {}
        for table, (id_field, time_field) in TABLES.items():
            if id_field == "entity_id":
                id_value = entity_id
            elif id_field == "card_id":
                if not card_id: continue
                id_value = card_id
            elif id_field == "device_hash":
                if not device_hash: continue
                id_value = device_hash
            elif id_field == "face_id":
                id_value = "F" + entity_id[1:]
            else:
                continue

            df = query_table(cur_main, table, id_field, id_value, time_field, start_time, end_time, user_input["location"])
            if not df.empty:
                data_dict[table] = df
                if save_to_disk and entity_dir:
                    df.to_csv(os.path.join(entity_dir, f"{table}.csv"), index=False)
                    print(f"Saved {len(df)} rows from {table}")

        images = save_images(entity_id, entity_dir, save_to_disk=save_to_disk)
        timeline_dict = build_timeline(entity_dir, entity_id, conn_main, save_to_disk=save_to_disk, data_dict=data_dict)
        #print("Timeline built.", len(timeline_dict), "events found.")
        cur_main.close()
        if save_to_disk:
            print(f"Finished. Data + timeline saved in {entity_dir}")
        #print("Query complete.", timeline_dict)
        return timeline_dict
    finally:
        if conn_main:
            release_main(conn_main)

# ---------- MAIN ----------
if __name__ == "__main__":
    clear_output_folder()
    user_input = get_user_input()
    query_entity(user_input, save_to_disk=True)
