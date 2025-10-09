# import os
# import pandas as pd
# import numpy as np
# from datetime import datetime, timedelta
# from collections import defaultdict, Counter
# import psycopg2
# from psycopg2.extras import RealDictCursor

# # ---------- DATABASE CONFIG ----------
# DB_CONFIG = {
#     "host": "db.tlruewxqrjvkyypmsbfg.supabase.co",
#     "database": "postgres",
#     "user": "postgres",
#     "password": "ethos_prod",
#     "port": "5432"
# }

# CACHE_DIR = "cached_data"
# os.makedirs(CACHE_DIR, exist_ok=True)
# CACHE_FILE = os.path.join(CACHE_DIR, "all_timelines.csv")

# # ---------- CONNECTION ----------
# def get_db_connection():
#     """Create database connection"""
#     return psycopg2.connect(**DB_CONFIG)

# # ---------- DATA FETCHING ----------
# def fetch_timeline_from_db(name=None, department=None):
#     """Load and merge data across all relevant sources into one timeline."""
#     conn = get_db_connection()
#     cur = conn.cursor(cursor_factory=RealDictCursor)

#     # Step 1: Get entity base info
#     person_query = """
#         SELECT entity_id, name, department, card_id, device_hash, face_id
#         FROM student_or_staff_profiles
#         WHERE 1=1
#     """
#     params = []
#     if name:
#         person_query += " AND name ILIKE %s"
#         params.append(f"%{name}%")
#     if department:
#         person_query += " AND department ILIKE %s"
#         params.append(f"%{department}%")

#     cur.execute(person_query, params)
#     persons = cur.fetchall()
#     if not persons:
#         cur.close()
#         conn.close()
#         return pd.DataFrame()

#     df_list = []
#     for person in persons:
#         eid = person["entity_id"]
#         cname = person["name"]
#         dept = person["department"]
#         card_id = person.get("card_id")
#         face_id = person.get("face_id")
#         device_hash = person.get("device_hash")

#         # -------- 1. Card Swipes --------
#         cur.execute("""
#             SELECT timestamp, location_id AS location, 'campus_card_swipes' AS source
#             FROM campus_card_swipes
#             WHERE card_id = %s
#         """, (card_id,))
#         df_swipe = pd.DataFrame(cur.fetchall()) if cur.rowcount else pd.DataFrame()

#         # -------- 2. Lab Bookings --------
#         cur.execute("""
#             SELECT start_time AS timestamp, room_id AS location, 'lab_bookings' AS source
#             FROM lab_bookings
#             WHERE entity_id = %s
#         """, (eid,))
#         df_lab = pd.DataFrame(cur.fetchall()) if cur.rowcount else pd.DataFrame()

#         # -------- 3. CCTV Frames --------
#         cur.execute("""
#             SELECT timestamp, location_id AS location, 'cctv_frames' AS source
#             FROM cctv_frames
#             WHERE face_id = %s
#         """, (face_id,))
#         df_cctv = pd.DataFrame(cur.fetchall()) if cur.rowcount else pd.DataFrame()

#         # -------- 4. WiFi Associations --------
#         cur.execute("""
#             SELECT timestamp, ap_id AS location, 'wifi_associations_logs' AS source
#             FROM wifi_associations_logs
#             WHERE device_hash = %s
#         """, (device_hash,))
#         df_wifi = pd.DataFrame(cur.fetchall()) if cur.rowcount else pd.DataFrame()

#         # -------- 5. Library Checkouts --------
#         cur.execute("""
#             SELECT timestamp, book_id AS location, 'library_checkouts' AS source
#             FROM library_checkouts
#             WHERE entity_id = %s
#         """, (eid,))
#         df_lib = pd.DataFrame(cur.fetchall()) if cur.rowcount else pd.DataFrame()

#         # -------- 6. Free Text Notes --------
#         cur.execute("""
#             SELECT timestamp, category AS location, 'free_text_notes' AS source
#             FROM free_text_notes
#             WHERE entity_id = %s
#         """, (eid,))
#         df_notes = pd.DataFrame(cur.fetchall()) if cur.rowcount else pd.DataFrame()

#         # Combine all sources
#         df_all = pd.concat([df_swipe, df_lab, df_cctv, df_wifi, df_lib, df_notes], ignore_index=True)
#         if not df_all.empty:
#             df_all["name"] = cname
#             df_all["department"] = dept
#             df_list.append(df_all)

#     cur.close()
#     conn.close()

#     if not df_list:
#         return pd.DataFrame()

#     df = pd.concat(df_list, ignore_index=True)
#     df.rename(columns={"location": "location_id", "timestamp": "timeline_timestamp"}, inplace=True)
#     return df

# # ---------- CACHED LOADER ----------
# def load_timeline_data(name=None, department=None, refresh=False):
#     """
#     Loads timeline data from cache if available, else fetches from DB.
#     Set refresh=True to force re-fetch.
#     """
#     if not refresh and os.path.exists(CACHE_FILE):
#         print("✅ Loading cached timeline data...")
#         df = pd.read_csv(CACHE_FILE)
#         return df
#     else:
#         print("⚙️ Fetching data from database...")
#         df = fetch_timeline_from_db()
#         if not df.empty:
#             df.to_csv(CACHE_FILE, index=False)
#             print(f"💾 Cached data saved at {CACHE_FILE}")
#         return df

# # ---------- CLEAN + SORT ----------
# def clean_and_sort(df):
#     df["timeline_timestamp"] = pd.to_datetime(df["timeline_timestamp"], errors="coerce")
#     df = df.dropna(subset=["location_id", "timeline_timestamp"])
#     df = df.sort_values(["name", "timeline_timestamp"])
#     return df

# # ---------- MARKOV MODEL ----------
# def build_transition_matrix(df):
#     transitions = defaultdict(Counter)
#     for name, group in df.groupby("name"):
#         states = group["location_id"].tolist()
#         for i in range(len(states) - 1):
#             if pd.isna(states[i]) or pd.isna(states[i + 1]):
#                 continue
#             transitions[states[i]][states[i + 1]] += 1

#     transition_probs = {}
#     for s_from, counts in transitions.items():
#         total = sum(counts.values())
#         transition_probs[s_from] = {s_to: c / total for s_to, c in counts.items()}
#     return transition_probs

# # ---------- PREDICTIONS ----------
# def predict_next_state(entity_timeline, transition_probs):
#     if entity_timeline.empty:
#         return None, 0.0, "No timeline data available."
    
#     entity_timeline = entity_timeline.dropna(subset=["location_id"])
#     if entity_timeline.empty:
#         return None, 0.0, "No valid location data."

#     last_state = entity_timeline["location_id"].iloc[-1]
#     if last_state not in transition_probs:
#         return None, 0.0, f"No transitions found for location '{last_state}'."

#     next_candidates = transition_probs[last_state]
#     if not next_candidates:
#         return None, 0.0, f"No outgoing transitions from '{last_state}'."

#     predicted_state = max(next_candidates, key=next_candidates.get)
#     confidence = next_candidates[predicted_state]
#     reason = f"Based on transitions from {last_state} → {predicted_state} ({confidence*100:.1f}%)"
#     return predicted_state, confidence, reason

# def predict_missing_intervals(entity_timeline, transition_probs, gap_threshold_hours=6):
#     predictions = []
#     df = entity_timeline.dropna(subset=["timeline_timestamp", "location_id"]).sort_values("timeline_timestamp").reset_index(drop=True)
#     for i in range(len(df) - 1):
#         t1, t2 = df.loc[i, "timeline_timestamp"], df.loc[i + 1, "timeline_timestamp"]
#         gap = (t2 - t1).total_seconds() / 3600
#         if gap > gap_threshold_hours:
#             pred, conf, reason = predict_next_state(df.iloc[:i + 1], transition_probs)
#             predictions.append({
#                 "missing_start": t1.isoformat(),
#                 "missing_end": t2.isoformat(),
#                 "predicted_state": pred,
#                 "confidence": round(conf, 3),
#                 "reason": reason,
#                 "gap_hours": round(gap, 2)
#             })
#     return predictions

# # ---------- MAIN FUNCTION ----------
# def predict_entity_movement(name, department=None, refresh=False):
#     try:
#         # Fetch all and build global model
#         all_df = load_timeline_data(refresh=refresh)
#         if all_df.empty:
#             return {"error": "No timeline data found in database."}
#         all_df = clean_and_sort(all_df)
#         transition_probs = build_transition_matrix(all_df)

#         # Filter for specific person
#         entity_df = all_df[all_df["name"].str.contains(name, case=False, na=False)]
#         if entity_df.empty:
#             return {"error": f"No timeline found for '{name}'."}
#         entity_df = clean_and_sort(entity_df)

#         next_state, conf, reason = predict_next_state(entity_df, transition_probs)
#         missing_preds = predict_missing_intervals(entity_df, transition_probs)

#         return {
#             "name": name,
#             "department": department,
#             "last_seen": entity_df["timeline_timestamp"].max().isoformat(),
#             "last_location": entity_df["location_id"].iloc[-1],
#             "predicted_next_location": next_state,
#             "confidence": round(conf, 3),
#             "explanation": reason,
#             "missing_event_predictions": missing_preds
#         }

#     except Exception as e:
#         return {"error": str(e)}

# # ---------- CLI ----------
# if __name__ == "__main__":
#     name = input("Enter person name: ").strip()
#     dept = input("Enter department (optional): ").strip() or None
#     refresh = input("Refresh cache? (y/n): ").strip().lower() == "y"
#     result = predict_entity_movement(name, dept, refresh)
#     print("\n--- Prediction Result ---")
#     print(result)
