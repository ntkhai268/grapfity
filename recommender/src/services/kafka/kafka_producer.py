
from aiokafka import AIOKafkaProducer
import json
import os


# Lấy cấu hình từ .env
KAFKA_HOST = os.getenv("KAFKA_HOST", "localhost")
KAFKA_PORT = os.getenv("KAFKA_PORT", "9092")
KAFKA_BOOTSTRAP_SERVERS = f"{KAFKA_HOST}:{KAFKA_PORT}"

async def send_event_to_kafka(event: dict, topic: str = "event_tracking_topic"):
    producer = AIOKafkaProducer(bootstrap_servers=KAFKA_BOOTSTRAP_SERVERS)
    await producer.start()
    try:
        event_data = json.dumps(event).encode('utf-8')
        await producer.send_and_wait(topic, event_data)
    finally:
        await producer.stop()
