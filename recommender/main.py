from fastapi import FastAPI, HTTPException, BackgroundTasks
from src.models.user_behavior import Event
from src.services.kafka.kafka_producer import send_event_to_kafka
from src.services.kafka.kafka_consumer import consume_events
from src.services.recommendation import get_recommendations
from src.services.update_model import update_svd_model
import asyncio
import logging
from logging.handlers import RotatingFileHandler

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
    logger.info("Application starting up...")
    asyncio.create_task(consume_events())
    logger.info("Kafka consumer background task started")

@app.get("/api/re-test")
async def test():
    logger.info("Test endpoint called")
    try:
        return {"status": "Event received and sent to Kafka !II test"}
    except Exception as e:
        logger.error(f"Test failed: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/event_tracking")
async def track_event(event: Event):
    logger.info(f"Tracking event: {event.event_id}")
    try:
        await send_event_to_kafka(event.dict())
        return {"status": "Event received and sent to Kafka"}
    except Exception as e:
        logger.error(f"Event tracking failed: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/recommendation")
async def get_recommendation(user_id: str):
    logger.info(f"Recommendation request for user: {user_id}")
    try:
        recommendations = await get_recommendations(user_id)
        logger.info(f"Returning {len(recommendations)} recommendations")
        return {"tracks": recommendations}
    except Exception as e:
        logger.error(f"Recommendation failed for user {user_id}: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))

# @app.post("/api/update_model")
# async def update_recommender_model(background_tasks: BackgroundTasks):
#     logger.info("Model update request received")
#     try:
#         background_tasks.add_task(update_svd_model)
#         logger.info("Model update task added to background")
#         return {"status": "Model update has been triggered and is running in the background."}
#     except Exception as e:
#         logger.error(f"Model update trigger failed: {str(e)}", exc_info=True)
#         raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/update_model")
async def update_recommender_model():
    logger.info("Model update request received")
    try:
        await update_svd_model()
        logger.info("Model update successfully!")
        return {"status": "Model update successfully!"}
    except Exception as e:
        logger.error(f"Model update trigger failed: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))