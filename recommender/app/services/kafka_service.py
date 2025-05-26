import os
from confluent_kafka import Producer, Consumer

KAFKA_BOOTSTRAP_SERVERS = f"{os.getenv('KAFKA_HOST')}:{os.getenv('KAFKA_PORT')}"

def get_kafka_producer():
    conf = {
        'bootstrap.servers': KAFKA_BOOTSTRAP_SERVERS,
        'client.id': 'recommender-producer'
    }
    return Producer(conf)

def get_kafka_consumer():
    conf = {
        'bootstrap.servers': KAFKA_BOOTSTRAP_SERVERS,
        'group.id': 'recommender-group',
        'auto.offset.reset': 'earliest'
    }
    return Consumer(conf)

def produce_event(event_data):
    producer = get_kafka_producer()
    topic = 'user-events'
    producer.produce(topic, value=event_data)
    producer.flush()