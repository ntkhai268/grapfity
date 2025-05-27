from aiokafka import AIOKafkaConsumer
import json
import logging
from database.db import insert_event
import os
from dotenv import load_dotenv

# Cấu hình logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Đọc file .env
load_dotenv()

# Lấy cấu hình từ .env
KAFKA_HOST = os.getenv("KAFKA_HOST", "localhost")
KAFKA_PORT = os.getenv("KAFKA_PORT", "9092")
KAFKA_BOOTSTRAP_SERVERS = f"{KAFKA_HOST}:{KAFKA_PORT}"

async def consume_events():
    consumer = AIOKafkaConsumer(
        'event_tracking_topic',
        bootstrap_servers=KAFKA_BOOTSTRAP_SERVERS,
        group_id="event_tracking_group",
        auto_offset_reset='earliest'
    )
    try:
        logger.info(f"Connecting to Kafka at {KAFKA_BOOTSTRAP_SERVERS}")
        await consumer.start()
        logger.info("Kafka consumer started")
        async for msg in consumer:
            try:
                event = json.loads(msg.value.decode('utf-8'))
                await insert_event(event)
                logger.info(f"Saved event {event['event_id']} to PostgreSQL")
            except Exception as e:
                logger.error(f"Error processing message: {str(e)}")
    except Exception as e:
        logger.error(f"Kafka consumer error: {str(e)}")
    finally:
        logger.info("Stopping Kafka consumer")
        await consumer.stop()
