from aiokafka import AIOKafkaProducer
<<<<<<< HEAD
import json
import os
import logging
=======
import os
import logging
from src.models.user_behavior import Event

>>>>>>> origin/final

logger = logging.getLogger(__name__)

KAFKA_HOST = os.getenv("KAFKA_HOST", "localhost")
KAFKA_PORT = os.getenv("KAFKA_PORT", "9092")
KAFKA_BOOTSTRAP_SERVERS = f"{KAFKA_HOST}:{KAFKA_PORT}"

<<<<<<< HEAD
async def send_event_to_kafka(event: dict, topic: str = "event_tracking_topic"):
    logger.info(f"Sending event {event['event_id']} to Kafka topic: {topic}")
=======
async def send_event_to_kafka(event: Event, topic: str = "event_tracking_topic"):
    logger.info(f"Sending event {event.event_id} to Kafka topic: {topic}")
>>>>>>> origin/final
    try:
        producer = AIOKafkaProducer(bootstrap_servers=KAFKA_BOOTSTRAP_SERVERS)
        logger.info("Starting Kafka producer...")
        await producer.start()
<<<<<<< HEAD
        
        event_data = json.dumps(event).encode('utf-8')
        logger.debug(f"Event data size: {len(event_data)} bytes")
        
        await producer.send_and_wait(topic, event_data)
        logger.info(f"Event {event['event_id']} sent successfully")
    except Exception as e:
        logger.error(f"Error sending event {event['event_id']}: {str(e)}", exc_info=True)
=======

        event_data = event.json().encode("utf-8")  # Pydantic tự serialize datetime
        logger.debug(f"Event data size: {len(event_data)} bytes")

        await producer.send_and_wait(topic, event_data)
        logger.info(f"Event {event.event_id} sent successfully")
    except Exception as e:
        logger.error(f"Error sending event {event.event_id}: {str(e)}", exc_info=True)
>>>>>>> origin/final
        raise
    finally:
        logger.info("Stopping Kafka producer")
        await producer.stop()
<<<<<<< HEAD
        logger.info("Kafka producer stopped")
=======
        logger.info("Kafka producer stopped")
>>>>>>> origin/final
