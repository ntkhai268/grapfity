-- Tạo database nếu chưa tồn tại
SELECT 'CREATE DATABASE recommender'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'recommender')\gexec

\c recommender

-- Tạo extension uuid-ossp để sinh UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tạo bảng tracks
CREATE TABLE IF NOT EXISTS tracks (
  trackname VARCHAR,
  track_id INTEGER PRIMARY KEY NOT NULL,
  lyrics TEXT,
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
  time_signature INTEGER,
  year INTEGER,
  release_date DATE
);

-- Tạo bảng events
CREATE TABLE IF NOT EXISTS events (
    id SERIAL PRIMARY KEY,
    event_id VARCHAR(50) NOT NULL,
    event_type VARCHAR(50) NOT NULL,
    track_id INTEGER NOT NULL REFERENCES tracks(track_id) ON DELETE CASCADE,
    user_id VARCHAR(50) NOT NULL,
    timestamp TIMESTAMP NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_events_user_id ON events(user_id);
CREATE INDEX IF NOT EXISTS idx_events_timestamp ON events(timestamp);

-- ------------------------
-- Chèn 100 bản ghi vào tracks
-- ------------------------
INSERT INTO tracks (
  trackname, track_id, lyrics, explicit,
  danceability, energy, key, loudness, mode,
  speechiness, acousticness, instrumentalness, liveness,
  valence, tempo, duration_ms, time_signature, year, release_date
)
SELECT
  'Track ' || gs.id AS trackname,
  gs.id AS track_id,
  'Lyrics for track ' || gs.id AS lyrics,
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
  (floor(random() * 7) + 1)::int AS time_signature,
  (2025 - floor(random() * 30))::int AS year,
  (CURRENT_DATE - ((floor(random() * 365 * 30))::int || ' days')::interval)::date AS release_date
FROM generate_series(1,100) AS gs(id);

-- ------------------------
-- Chèn 500 bản ghi vào events, đảm bảo track_id từ tracks
-- ------------------------
INSERT INTO events (
  event_id, event_type, track_id, user_id, timestamp
)
SELECT
  uuid_generate_v4()::text AS event_id,
  -- Random event type
  CASE floor(random() * 3)::int
    WHEN 0 THEN 'click'
    WHEN 1 THEN 'play'
    ELSE 'skip'
  END AS event_type,
  t.track_id AS track_id,
  -- user_id từ 'user1' đến 'user50'
  'user' || ((floor(random() * 50) + 1)::int)::text AS user_id,
  -- timestamp random trong 90 ngày gần đây
  (NOW()
     - ((floor(random() * 90))::int || ' days')::interval
     - ((floor(random() * 86400))::int || ' seconds')::interval
  ) AS timestamp
FROM generate_series(1,500) AS gs(id)
-- LATERAL join để lấy ngẫu nhiên 1 row từ tracks cho mỗi gs.id
CROSS JOIN LATERAL (
  SELECT track_id
  FROM tracks
  ORDER BY random()
  LIMIT 1
) AS t;
