from fastapi import FastAPI, HTTPException
from models.user_behavior import Event
from services.kafka.kafka_producer import send_event_to_kafka
from services.kafka.kafka_consumer import consume_events
from services.recommendation import get_recommendations, update_model
import asyncio


app = FastAPI()

@app.on_event("startup")
async def startup_event():
    asyncio.create_task(consume_events())

@app.get("/api/re-test")
async def test():
    try:
        return {"status": "Event received and sent to Kafka"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/event_tracking")
async def track_event(event: Event):
    try:
        return {event}
        await send_event_to_kafka(event.dict())
        return {"status": "Event received and sent to Kafka"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/recommendation")
async def get_recommendation(user_id: str):
    try:
        recommendations = get_recommendations(user_id)
        return {"tracks": recommendations}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/update_model")
async def update_recommender_model():
    try:
        update_model()
        return {"status": "Model update triggered"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    import os
    host = os.getenv("FASTAPI_HOST", "0.0.0.0")
    port = int(os.getenv("FASTAPI_PORT", 8000))
    uvicorn.run(app, host=host, port=port)