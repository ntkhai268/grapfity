from pydantic import BaseModel
from datetime import datetime

class Event(BaseModel):
    event_id: str
    event_type: str
    track_id: int
    user_id: str
    timestamp: datetime