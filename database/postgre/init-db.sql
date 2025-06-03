-- Tạo database nếu chưa tồn tại
SELECT 'CREATE DATABASE recommender'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'recommender')\gexec

\c recommender

-- Tạo extension uuid-ossp để sinh UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tạo bảng tracks
CREATE TABLE IF NOT EXISTS tracks (
  track_id INTEGER PRIMARY KEY NOT NULL,
  explicit BOOLEAN,
  danceability FLOAT,
  energy FLOAT,
  key INTEGER,
  loudness FLOAT,
  mode INTEGER,
  speechiness FLOAT,
  acousticness FLOAT,
  instrumentalness FLOAT,
  liveness FLOAT,
  valence FLOAT,
  tempo FLOAT,
  duration_ms INTEGER,
  time_signature INTEGER
);

CREATE TABLE IF NOT EXISTS events (
    id SERIAL PRIMARY KEY,
    event_id VARCHAR(50) NOT NULL UNIQUE,  -- thêm UNIQUE ở đây
    event_type VARCHAR(50) NOT NULL,
    track_id INTEGER NOT NULL REFERENCES tracks(track_id) ON DELETE CASCADE,
    user_id VARCHAR(50) NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_events_user_id ON events(user_id);
CREATE INDEX IF NOT EXISTS idx_events_timestamp ON events(timestamp);

-- ------------------------
-- Chèn 100 bản ghi vào tracks
-- ------------------------
INSERT INTO tracks (
   track_id, explicit,
  danceability, energy, key, loudness, mode,
  speechiness, acousticness, instrumentalness, liveness,
  valence, tempo, duration_ms, time_signature
)
SELECT
  gs.id AS track_id,
  (random() < 0.3) AS explicit,
  random() AS danceability,
  random() AS energy,
  (floor(random() * 12))::int AS key,
  (random() * -60)::float AS loudness,
  (floor(random() * 2))::int AS mode,
  random() AS speechiness,
  random() AS acousticness,
  random() AS instrumentalness,
  random() AS liveness,
  random() AS valence,
  (random() * 200 + 60)::float AS tempo,
  (floor(random() * 300000) + 60000)::int AS duration_ms,
  (floor(random() * 7) + 1)::int AS time_signature
FROM generate_series(1,100) AS gs(id);

-- ------------------------
-- Chèn 500 bản ghi vào events, đảm bảo track_id từ tracks
-- ------------------------
INSERT INTO events (
  event_id,
  event_type,
  track_id,
  user_id,
  timestamp
)
SELECT
  uuid_generate_v4()::text AS event_id,
  combo.event_type,
  combo.track_id,
  combo.user_id,
  -- Sinh timestamp ngẫu nhiên trong 90 ngày gần đây
  (NOW()
     - ((floor(random() * 90))::int || ' days')::interval
     - ((floor(random() * 86400))::int || ' seconds')::interval
  ) AS timestamp
FROM (
  -- Tạo toàn bộ tổ hợp (track, user, event_type)
  SELECT
    t.track_id,
    u.user_id,
    e.event_type
  FROM tracks t
  CROSS JOIN (
    SELECT 'click'   AS event_type
    UNION ALL
    SELECT 'play'
    UNION ALL
    SELECT 'skip'
  ) AS e
  CROSS JOIN (
    -- Tạo user1..user50
    SELECT 'user' || gs::text AS user_id
    FROM generate_series(1,50) AS gs
  ) AS u
) AS combo
-- Lấy ngẫu nhiên 500 tổ hợp duy nhất
ORDER BY random()
LIMIT 500;
