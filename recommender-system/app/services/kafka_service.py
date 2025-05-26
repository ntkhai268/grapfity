from confluent_kafka import Producer, Consumer, KafkaError
import json

def get_kafka_producer():
    return Producer({'bootstrap.servers': 'kafka:9092'})

def get_kafka_consumer():
    consumer = Consumer({
        'bootstrap.servers': 'kafka:9092',
        'group.id': 'event-tracking-group',
        'auto.offset.reset': 'earliest'
    })
    consumer.subscribe(['user-events'])
    return consumer

def produce_event(event_data):
    producer = get_kafka_producer()
    producer.produce('user-events', json.dumps(event_data))
    producer.flush()