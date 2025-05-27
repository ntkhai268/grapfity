-- Tạo database nếu chưa tồn tại
CREATE DATABASE event_tracking;

-- Kết nối vào database mới tạo
\c event_tracking

-- Tạo bảng events nếu chưa tồn tại
CREATE TABLE IF NOT EXISTS events (
    id SERIAL PRIMARY KEY,  -- SERIAL ~ auto-increment integer
    event_id VARCHAR(50) NOT NULL,
    event_type VARCHAR(50) NOT NULL,
    track_id VARCHAR(50) NOT NULL,
    user_id VARCHAR(50) NOT NULL,
    timestamp TIMESTAMP NOT NULL
);

-- Tạo index để tối ưu hiệu năng (tuỳ chọn)
CREATE INDEX IF NOT EXISTS idx_events_user_id ON events(user_id);
CREATE INDEX IF NOT EXISTS idx_events_timestamp ON events(timestamp);