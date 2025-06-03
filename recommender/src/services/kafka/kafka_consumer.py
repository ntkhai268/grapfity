from aiokafka import AIOKafkaConsumer
import json
import logging
from src.database.db import insert_event
<<<<<<< HEAD
import os
from dotenv import load_dotenv
=======

import os
from dotenv import load_dotenv
from src.models.user_behavior import Event
>>>>>>> origin/final

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

load_dotenv()
<<<<<<< HEAD
KAFKA_HOST = os.getenv("KAFKA_HOST", "localhost")
=======
KAFKA_HOST = os.getenv("KAFKA_HOST", "kafka")
>>>>>>> origin/final
KAFKA_PORT = os.getenv("KAFKA_PORT", "9092")
KAFKA_BOOTSTRAP_SERVERS = f"{KAFKA_HOST}:{KAFKA_PORT}"

async def consume_events():
    logger.info("Initializing Kafka consumer...")
    try:
        consumer = AIOKafkaConsumer(
            'event_tracking_topic',
            bootstrap_servers=KAFKA_BOOTSTRAP_SERVERS,
            group_id="event_tracking_group",
            auto_offset_reset='earliest'
        )
<<<<<<< HEAD
        
        logger.info(f"Connecting to Kafka at {KAFKA_BOOTSTRAP_SERVERS}")
        await consumer.start()
        logger.info("Kafka consumer started successfully")
        
        logger.info("Listening for messages...")
        async for msg in consumer:
            try:
                event = json.loads(msg.value.decode('utf-8'))
                logger.info(f"Received event: {event['event_id']} from partition {msg.partition}")
                
                logger.debug(f"Event details: user={event['user_id']}, track={event['track_id']}, type={event['event_type']}")
                
                await insert_event(event)
                logger.info(f"Saved event {event['event_id']} to database")
            except Exception as e:
                logger.error(f"Error processing message: {str(e)}", exc_info=True)
    except Exception as e:
        logger.error(f"Kafka consumer error: {str(e)}", exc_info=True)
    finally:
        logger.info("Stopping Kafka consumer")
        await consumer.stop()
        logger.info("Kafka consumer stopped")
=======

        logger.info(f"Connecting to Kafka at {KAFKA_BOOTSTRAP_SERVERS}")
        await consumer.start()
        logger.info("Kafka consumer started successfully")

        logger.info("Listening for messages...")
        async for msg in consumer:
            try:
                # 1. Đọc raw JSON string
                raw = msg.value.decode('utf-8')
                data = json.loads(raw)

                # 2. Chuyển thành Pydantic Event (tự động parse timestamp => datetime, track_id => int)
                event_obj = Event(**data)

                logger.info(f"Received event: {event_obj.event_id} "
                            f"from partition {msg.partition}")

                logger.debug(f"Event details: user={event_obj.user_id}, "
                             f"track={event_obj.track_id}, "
                             f"type={event_obj.event_type}, "
                             f"timestamp={event_obj.timestamp}")

                # 3. Gọi insert_event với Event instance
                await insert_event(event_obj)
                logger.info(f"Saved event {event_obj.event_id} to database")

            except Exception as e:
                logger.error(f"Error processing message: {str(e)}", exc_info=True)

    except Exception as e:
        logger.error(f"Kafka consumer error: {str(e)}", exc_info=True)

    finally:
        logger.info("Stopping Kafka consumer")
        await consumer.stop()
        logger.info("Kafka consumer stopped")
>>>>>>> origin/final
