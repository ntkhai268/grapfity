from fastapi import FastAPI, HTTPException,BackgroundTasks  
from src.models.user_behavior import Event
from src.services.kafka.kafka_producer import send_event_to_kafka
from src.services.kafka.kafka_consumer import consume_events
from src.services.recommendation import get_recommendations
from src.services.update_model import  update_svd_model
import asyncio
# Thêm vào main.py
import logging
from logging.handlers import RotatingFileHandler

# ... sau khi tạo app


app = FastAPI()


# Cấu hình logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    handlers=[
        RotatingFileHandler("app.log", maxBytes=10000000, backupCount=5),
        logging.StreamHandler()
    ]
)


logger = logging.getLogger(__name__)


@app.on_event("startup")
async def startup_event():
    asyncio.create_task(consume_events())
    # load_matrices



@app.get("/api/re-test")
async def test():
    try:
        return {"status": "Event received and sent to Kafka !II test"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/event_tracking")
async def track_event(event: Event):
    try:
        
        await send_event_to_kafka(event.dict())
        return {"status": "Event received and sent to Kafka"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/recommendation")
async def get_recommendation(user_id: str):
    try:
        recommendations = await get_recommendations(user_id)
        return {"tracks": recommendations}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/update_model")
async def update_recommender_model(background_tasks: BackgroundTasks):  # 👈 Thêm background_tasks
    try:
        # 👇 Thêm task vào background
        background_tasks.add_task(update_svd_model)
        logger.info("Model update task added to background")
        return {"status": "Model update has been triggered and is running in the background."}
    except Exception as e:
        logger.error(f"Error triggering model update: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# if __name__ == "__main__":
#     import uvicorn
#     import os
#     host = os.getenv("FASTAPI_HOST", "0.0.0.0")
#     port = int(os.getenv("FASTAPI_PORT", 8000))
#     uvicorn.run(app, host=host, port=port, reload=True)