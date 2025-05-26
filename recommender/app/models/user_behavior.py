from sqlalchemy import Column, Integer, String, Float, DateTime
from database.db import Base

class UserBehavior(Base):
    __tablename__ = "user_behavior"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String, index=True)
    event_id = Column(String)
    track_id = Column(String)
    timestamp = Column(DateTime)
    event_type = Column(String)
    rating = Column(Float, nullable=True)