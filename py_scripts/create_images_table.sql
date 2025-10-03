-- Table: face_images
CREATE TABLE IF NOT EXISTS face_images (
    image_id VARCHAR PRIMARY KEY,
    image_data BYTEA NOT NULL
);
