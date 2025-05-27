
import asyncpg
import os


# Lấy cấu hình từ .env
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
        port=POSTGRES_PORT
    )

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