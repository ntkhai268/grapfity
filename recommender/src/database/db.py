import asyncpg
import os
import logging

logger = logging.getLogger(__name__)

POSTGRES_HOST = os.getenv("POSTGRES_HOST", "localhost")
POSTGRES_PORT = os.getenv("POSTGRES_PORT", "5432")
POSTGRES_USER = os.getenv("POSTGRES_USER", "your_user")
POSTGRES_PASSWORD = os.getenv("POSTGRES_PASSWORD", "your_password")
POSTGRES_DB = os.getenv("POSTGRES_DB", "your_database")

async def get_db_connection():
    logger.info(f"Creating new database connection to {POSTGRES_DB} as {POSTGRES_USER}")
    try:
        conn = await asyncpg.connect(
            user=POSTGRES_USER,
            password=POSTGRES_PASSWORD,
            database=POSTGRES_DB,
            host=POSTGRES_HOST,
            port=POSTGRES_PORT,
            server_settings={'search_path': 'public'}
        )
        logger.info(f"Successfully connected to database")
        return conn
    except Exception as e:
        logger.error(f"Database connection failed: {str(e)}")
        raise

async def get_all_event_data():
    query = """
    SELECT user_id, track_id, event_type
    FROM events
    """
    logger.info("Executing query to get all event data")
    conn = await get_db_connection()
    try:
        logger.info(f"Connecting as user: {POSTGRES_USER} to database: {POSTGRES_DB}")
        result = await conn.fetch(query)
        logger.info(f"Retrieved {len(result)} events from database")
        return result
    except Exception as e:
        logger.error(f"Database query failed: {str(e)}", exc_info=True)
        raise
    finally:
        await conn.close()
        logger.info("Database connection closed")

async def get_user_events(user_id: str):
    query = """
    SELECT event_id, event_type, track_id, user_id, timestamp
    FROM events
    WHERE user_id = $1
    """
    logger.info(f"Fetching events for user: {user_id}")
    conn = await get_db_connection()
    try:
        result = await conn.fetch(query, user_id)
        logger.info(f"Retrieved {len(result)} events for user: {user_id}")
        return result
    except Exception as e:
        logger.error(f"Error fetching events for user {user_id}: {str(e)}", exc_info=True)
        raise
    finally:
        await conn.close()
        logger.info("Database connection closed")

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
    logger.info("Fetching track metadata")
    conn = await get_db_connection()
    try:
        result = await conn.fetch(query)
        logger.info(f"Retrieved metadata for {len(result)} tracks")
        return result
    except Exception as e:
        logger.error(f"Error fetching track metadata: {str(e)}", exc_info=True)
        raise
    finally:
        await conn.close()
        logger.info("Database connection closed")

async def insert_event(event: dict):
    logger.info(f"Inserting event: {event['event_id']}")
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
        logger.info(f"Event {event['event_id']} inserted successfully")
    except Exception as e:
        logger.error(f"Error inserting event {event['event_id']}: {str(e)}", exc_info=True)
        raise
    finally:
        await conn.close()
        logger.info("Database connection closed")