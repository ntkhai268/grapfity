import numpy as np
from models.user_behavior import UserBehavior
from sqlalchemy.orm import Session
from database.db import SessionLocal
import json
from confluent_kafka import KafkaError

# Khởi tạo ma trận yếu tố P và Q
P = {}
Q = {}

def update_factors(P, Q, user_id, item_id, rating, learning_rate=0.01, reg_param=0.02):
    if user_id not in P:
        P[user_id] = np.random.rand(10)
    if item_id not in Q:
        Q[item_id] = np.random.rand(10)

    P_u = P[user_id]
    Q_i = Q[item_id]
    error = rating - np.dot(P_u, Q_i)
    P_u += learning_rate * (error * Q_i - reg_param * P_u)
    Q_i += learning_rate * (error * P_u - reg_param * Q_i)
    P[user_id] = P_u
    Q[item_id] = Q_i
    return P, Q

def get_recommendations(user_id, db: Session, top_n=10):
    if user_id not in P:
        return []  # Trả về rỗng nếu người dùng mới
    user_vector = P[user_id]
    scores = {item_id: np.dot(user_vector, Q[item_id]) for item_id in Q}
    sorted_items = sorted(scores.items(), key=lambda x: x[1], reverse=True)
    return [item_id for item_id, _ in sorted_items[:top_n]]

def process_events():
    from app.services.kafka_service import get_kafka_consumer
    consumer = get_kafka_consumer()
    db = SessionLocal()
    try:
        while True:
            msg = consumer.poll(1.0)
            if msg is None:
                continue
            if msg.error():
                if msg.error().code() == KafkaError._PARTITION_EOF:
                    continue
                else:
                    print(msg.error())
                    break
            event_data = json.loads(msg.value())
            user_id = event_data['user_id']
            item_id = event_data['event_id']
            track_id = event_data['track_id']
            timestamp = event_data['timestamp']
            event_type = event_data['event_type']
            rating = 1  # Giả sử tương tác là rating=1

            # Lưu vào PostgreSQL
            db_event = UserBehavior(
                user_id=user_id,
                event_id=item_id,
                track_id=track_id,
                timestamp=timestamp,
                event_type=event_type,
                rating=rating
            )
            db.add(db_event)
            db.commit()

            # Cập nhật mô hình matrix factorization
            global P, Q
            P, Q = update_factors(P, Q, user_id, item_id, rating)
    finally:
        db.close()