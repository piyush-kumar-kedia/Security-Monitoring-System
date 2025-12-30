-- Performance indexes for Security Monitoring System

-- Timestamp indexes
CREATE INDEX IF NOT EXISTS idx_campus_card_swipes_timestamp ON campus_card_swipes(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_cctv_frames_timestamp ON cctv_frames(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_wifi_associations_timestamp ON wifi_associations_logs(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_library_checkouts_timestamp ON library_checkouts(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_lab_bookings_start_time ON lab_bookings(start_time DESC);
CREATE INDEX IF NOT EXISTS idx_free_text_notes_timestamp ON free_text_notes(timestamp DESC);

-- Foreign key indexes
CREATE INDEX IF NOT EXISTS idx_campus_card_swipes_card_id ON campus_card_swipes(card_id);
CREATE INDEX IF NOT EXISTS idx_cctv_frames_face_id ON cctv_frames(face_id);
CREATE INDEX IF NOT EXISTS idx_wifi_associations_device_hash ON wifi_associations_logs(device_hash);
CREATE INDEX IF NOT EXISTS idx_profiles_card_id ON student_or_staff_profiles(card_id);
CREATE INDEX IF NOT EXISTS idx_profiles_face_id ON student_or_staff_profiles(face_id);
CREATE INDEX IF NOT EXISTS idx_profiles_device_hash ON student_or_staff_profiles(device_hash);

-- Composite indexes
CREATE INDEX IF NOT EXISTS idx_library_checkouts_entity_ts ON library_checkouts(entity_id, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_lab_bookings_entity_ts ON lab_bookings(entity_id, start_time DESC);
CREATE INDEX IF NOT EXISTS idx_free_text_notes_entity_ts ON free_text_notes(entity_id, timestamp DESC);

-- Composite indexes for better join performance
CREATE INDEX idx_campus_card_swipes_card_ts ON campus_card_swipes(card_id, timestamp DESC);
CREATE INDEX idx_wifi_logs_device_ts ON wifi_associations_logs(device_hash, timestamp DESC);
CREATE INDEX idx_cctv_frames_face_ts ON cctv_frames(face_id, timestamp DESC);

-- Pattern index for image LIKE queries
CREATE INDEX idx_face_images_pattern ON face_images(image_id text_pattern_ops);

-- Update statistics
ANALYZE campus_card_swipes;
ANALYZE cctv_frames;
ANALYZE wifi_associations_logs;
ANALYZE library_checkouts;
ANALYZE lab_bookings;
ANALYZE free_text_notes;
ANALYZE student_or_staff_profiles;
