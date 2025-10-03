import pandas as pd
import os

face_embeddings = pd.read_csv('data/face_embeddings.csv')
all_face_ids = set(face_embeddings['face_id'].str.replace('.jpg', '', regex=False))

profiles = pd.read_csv('data/student or staff profiles.csv')
profile_face_ids = set(profiles['face_id'].dropna().astype(str))

unmatched_face_ids = all_face_ids - profile_face_ids

print(len(unmatched_face_ids))