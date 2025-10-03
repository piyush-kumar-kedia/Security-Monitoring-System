-- Table: campus_card_swipes
CREATE TABLE IF NOT EXISTS campus_card_swipes (
    card_id VARCHAR NOT NULL,
    location_id VARCHAR NOT NULL,
    timestamp TIMESTAMP NOT NULL
);

-- Table: cctv_frames
CREATE TABLE IF NOT EXISTS cctv_frames (
    frame_id VARCHAR PRIMARY KEY,
    location_id VARCHAR NOT NULL,
    timestamp TIMESTAMP NOT NULL,
    face_id VARCHAR
);

-- Table: face_embeddings
CREATE TABLE IF NOT EXISTS face_embeddings (
    face_id VARCHAR PRIMARY KEY,
    embedding TEXT NOT NULL -- Could be JSON or array, but TEXT for now
);

-- Table: free_text_notes
CREATE TABLE IF NOT EXISTS free_text_notes (
    note_id VARCHAR PRIMARY KEY,
    entity_id VARCHAR NOT NULL,
    category VARCHAR,
    text TEXT,
    timestamp TIMESTAMP
);

-- Table: lab_bookings
CREATE TABLE IF NOT EXISTS lab_bookings (
    booking_id VARCHAR PRIMARY KEY,
    entity_id VARCHAR NOT NULL,
    room_id VARCHAR NOT NULL,
    start_time TIMESTAMP NOT NULL,
    end_time TIMESTAMP NOT NULL,
    attended VARCHAR CHECK (attended IN ('YES', 'NO'))
);

-- Table: library_checkouts
CREATE TABLE IF NOT EXISTS library_checkouts (
    checkout_id VARCHAR PRIMARY KEY,
    entity_id VARCHAR NOT NULL,
    book_id VARCHAR NOT NULL,
    timestamp TIMESTAMP NOT NULL
);

-- Table: student_or_staff_profiles
CREATE TABLE IF NOT EXISTS student_or_staff_profiles (
    entity_id VARCHAR PRIMARY KEY,
    name VARCHAR,
    role VARCHAR,
    email VARCHAR,
    department VARCHAR,
    student_id VARCHAR,
    staff_id VARCHAR,
    card_id VARCHAR,
    device_hash VARCHAR,
    face_id VARCHAR
);

-- Table: wifi_associations_logs
CREATE TABLE IF NOT EXISTS wifi_associations_logs (
    device_hash VARCHAR NOT NULL,
    ap_id VARCHAR NOT NULL,
    timestamp TIMESTAMP NOT NULL
);
