import pandas as pd
def profile_preprocessing():
    df = pd.read_csv(r"data_upload\student or staff profiles.csv")
    face_mask = df['face_id'].isnull() | (df['face_id'] == "")
    df.loc[face_mask, 'face_id'] = df.loc[face_mask, 'entity_id'].str.replace('^E', 'F', regex=True)
    df['student_id'] = df['entity_id'].str.replace('^E', 'S', regex=True)
    if "Unnamed: 0" in df.columns:
        df.drop("Unnamed: 0", axis=1, inplace=True)
    df.to_csv(r"data_upload\student or staff profiles.csv", index=False)

profile_preprocessing()