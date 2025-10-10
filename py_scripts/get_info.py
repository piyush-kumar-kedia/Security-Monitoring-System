import psycopg2
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
    db_config = {
        'host': os.getenv("DB_MAIN_HOST"),
        'port': os.getenv("DB_MAIN_PORT"),
        'user': os.getenv("DB_MAIN_USER"),
        'password': os.getenv("DB_MAIN_PASSWORD"),
        'database': os.getenv("DB_MAIN_NAME")
    }
    return psycopg2.connect(**db_config)

def connect_images():
    db_config = {
        'host': os.getenv("DB_MAIN_HOST"),
        'port': os.getenv("DB_MAIN_PORT"),
        'user': os.getenv("DB_MAIN_USER"),
        'password': os.getenv("DB_MAIN_PASSWORD"),
        'database': os.getenv("DB_MAIN_NAME")
    }
    return psycopg2.connect(**db_config)

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
    key, value = list(identifier.items())[0]
    cur.execute(f"SELECT * FROM student_or_staff_profiles WHERE {key}=%s", (value,))
    row = cur.fetchone()
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
def save_images(entity_id, entity_dir):
    face_id = "F" + entity_id[1:]  # derive face_id
    conn_img = connect_images()
    cur_img = conn_img.cursor()
    img_dir = os.path.join(entity_dir, "images")
    os.makedirs(img_dir, exist_ok=True)
    cur_img.execute("SELECT image_id, image_data FROM face_images WHERE image_id LIKE %s", (f"{face_id}%",))
    rows = cur_img.fetchall()
    for image_id, image_data in rows:
        filename = image_id if image_id.lower().endswith(".jpg") else f"{image_id}.jpg"
        with open(os.path.join(img_dir, filename), "wb") as f:
            f.write(image_data)
    cur_img.close()
    conn_img.close()
    print(f"Saved {len(rows)} images for entity_id={entity_id} (face_id={face_id})")

# ---------- BUILD TIMELINE ----------
def build_timeline(entity_dir, entity_id, conn_main):
    timeline_records = []

    schema = [
        "source", "event_id", "entity_id", "face_id", "card_id",
        "device_hash", "location_id", "room_id", "ap_id", "book_id",
        "category", "text", "start_time", "end_time", "timestamp",
        "name", "summary"
    ]

    cur = conn_main.cursor()
    cur.execute("SELECT entity_id, card_id, device_hash, face_id, name FROM student_or_staff_profiles")
    all_profiles = cur.fetchall()
    cols = [desc[0] for desc in cur.description]
    profiles_df = pd.DataFrame(all_profiles, columns=cols)

    def get_names_by_field(field, value):
        if value is None: return None
        matches = profiles_df.loc[profiles_df[field] == value, "name"].unique()
        return ", ".join(matches) if len(matches) > 0 else None

    csv_files = glob.glob(os.path.join(entity_dir, "*.csv"))

    for file in csv_files:
        table = os.path.splitext(os.path.basename(file))[0]
        df = pd.read_csv(file)

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
    conn = connect_main()
    cur = conn.cursor()
    
    # Get all entities
    cur.execute("SELECT entity_id, card_id, role, department, device_hash, face_id, name FROM student_or_staff_profiles")
    entities = cur.fetchall()
    cols = [desc[0] for desc in cur.description]
    entities_df = pd.DataFrame(entities, columns=cols)
    
    inactive_entities = []

    twelve_hours_ago = datetime.now() - timedelta(hours=12)
    
    for _, row in entities_df.iterrows():
        entity_id = row["entity_id"]
        card_id = row["card_id"]
        role = row["role"]
        department = row["department"]
        device_hash = row["device_hash"]
        face_id = row["face_id"]
        
        last_times = []

        for table, (id_field, time_field) in TABLES.items():
            if id_field == "entity_id":
                id_value = entity_id
            elif id_field == "card_id":
                id_value = card_id
                if not id_value: continue
            elif id_field == "device_hash":
                id_value = device_hash
                if not id_value: continue
            elif id_field == "face_id":
                id_value = face_id
                if not id_value: continue
            else:
                continue
            
            cur.execute(f"SELECT MAX({time_field}) FROM {table} WHERE {id_field}=%s", (id_value,))
            result = cur.fetchone()[0]
            if result:
                last_times.append(result)
        
        if last_times:
            last_activity = max(last_times)
            if isinstance(last_activity, str):
                last_activity = datetime.strptime(last_activity, "%Y-%m-%d %H:%M:%S")
            if last_activity < twelve_hours_ago:
                inactive_entities.append({
                    "entity_id": entity_id,
                    "card_id": card_id,
                    "role": role,
                    "department": department,
                    "name": row["name"],
                    "last_activity": last_activity.strftime("%Y-%m-%d %H:%M:%S")
                })
        else:
            # No logs at all → consider inactive
            inactive_entities.append({
                "entity_id": entity_id,
                "card_id": card_id,
                "role": role,
                "department": department,
                "name": row["name"],
                "last_activity": None
            })
    
    cur.close()
    conn.close()
    return inactive_entities

# ---------- MAIN QUERY FUNCTION ----------

def entity_details(user_input):
    conn_main = connect_main()
    cur_main = conn_main.cursor()

    resolved = resolve_entity(cur_main, user_input["identifier"])
    if not resolved:
        print("Entity not found")
        return
    return resolved
    
    

def query_entity(user_input):
    conn_main = connect_main()
    cur_main = conn_main.cursor()

    resolved = resolve_entity(cur_main, user_input["identifier"])
    if not resolved:
        print("Entity not found")
        return
    entity_id = resolved["entity_id"]
    print(f"Resolved to entity_id: {entity_id}")

    card_id = resolved.get("card_id")
    device_hash = resolved.get("device_hash")

    start_time = normalize_time_input(user_input["start_time"], True) if user_input["start_time"] else None
    end_time   = normalize_time_input(user_input["end_time"], False) if user_input["end_time"] else None

    entity_dir = os.path.join(OUTPUT_DIR, f"entity_{entity_id}")
    os.makedirs(entity_dir, exist_ok=True)

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
            df.to_csv(os.path.join(entity_dir, f"{table}.csv"), index=False)
            print(f"Saved {len(df)} rows from {table}")

    save_images(entity_id, entity_dir)
    timeline_dict = build_timeline(entity_dir, entity_id, conn_main)

    cur_main.close()
    conn_main.close()
    print(f"Finished. Data + timeline saved in {entity_dir}")
    return timeline_dict

# ---------- MAIN ----------
if __name__ == "__main__":
    clear_output_folder()
    user_input = get_user_input()
    query_entity(user_input)
