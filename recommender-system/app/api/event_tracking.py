from fastapi import APIRouter, BackgroundTasks
from pydantic import BaseModel
from app.services.kafka_service import produce_event

router = APIRouter()

class EventData(BaseModel):
    user_id: str
    event_id: str
    track_id: str
    timestamp: str
    event_type: str

@router.post("/api/v1/eventTracking")
def event_tracking(event_data: EventData, background_tasks: BackgroundTasks):
    background_tasks.add_task(produce_event, event_data.dict())
    return {"status": 200,
    "mess":"Event received"}