from pydantic import BaseModel
from datetime import datetime

class Event(BaseModel):
    event_id: str
    event_type: str
<<<<<<< HEAD
    track_id: str
=======
    track_id: int
>>>>>>> origin/final
    user_id: str
    timestamp: datetime