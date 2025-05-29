import asyncpg
import os

import logging  # 👈 Thêm logging

logger = logging.getLogger(__name__)

POSTGRES_HOST = os.getenv("POSTGRES_HOST", "localhost")
POSTGRES_PORT = os.getenv("POSTGRES_PORT", "5432")
POSTGRES_USER = os.getenv("POSTGRES_USER", "your_user")
POSTGRES_PASSWORD = os.getenv("POSTGRES_PASSWORD", "your_password")
POSTGRES_DB = os.getenv("POSTGRES_DB", "your_database")

async def get_db_connection():
    return await asyncpg.connect(
        user=POSTGRES_USER,
        password=POSTGRES_PASSWORD,
        database=POSTGRES_DB,
        host=POSTGRES_HOST,
        port=POSTGRES_PORT,
        server_settings={'search_path': 'public'}  # ← Thêm dòng này
    )

async def get_all_event_data():
    query = """
    SELECT user_id, track_id, event_type
    FROM events
    """
    conn = await get_db_connection()
    try:
        logger.info("Executing query to get all event data")
        logger.info(f"Connecting as user: {POSTGRES_USER} to database: {POSTGRES_DB}")
        result = await conn.fetch(query)
        logger.info(f"Retrieved {len(result)} events from database")
        return result
    except Exception as e:
        logger.error(f"Database query failed: {str(e)}")
        raise
    finally:
        await conn.close()

async def get_user_events(user_id: str):
    query = """
    SELECT event_id, event_type, track_id, user_id, timestamp
    FROM events
    WHERE user_id = $1
    """
    conn = await get_db_connection()
    try:
        return await conn.fetch(query, user_id)
    finally:
        await conn.close()

async def get_track_metadata():
    query = """
    SELECT
        track_id,
        explicit,
        danceability,
        energy,
        key,
        loudness,
        mode,
        speechiness,
        acousticness,
        instrumentalness,
        liveness,
        valence,
        tempo,
        duration_ms,
        time_signature
    FROM tracks;

    """
    conn = await get_db_connection()
    try:
        return await conn.fetch(query)
    finally:
        await conn.close()

async def insert_event(event: dict):
    conn = await get_db_connection()
    try:
        await conn.execute(
            """
            INSERT INTO events (event_id, event_type, track_id, user_id, timestamp)
            VALUES ($1, $2, $3, $4, $5)
            ON CONFLICT (event_id) DO NOTHING
            """,
            event['event_id'],
            event['event_type'],
            event['track_id'],
            event['user_id'],
            event['timestamp']
        )
    finally:
        await conn.close()