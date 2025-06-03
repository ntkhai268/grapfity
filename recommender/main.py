from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from src.models.user_behavior import Event
from src.services.kafka.kafka_producer import send_event_to_kafka
from src.services.kafka.kafka_consumer import consume_events
from src.services.recommendation import get_recommendations
from src.services.update_model import update_svd_model
from src.services.eventServices import delete_event_relative_track_id
import asyncio
import logging
from logging.handlers import RotatingFileHandler
from src.services.extract_track_features.extract import extract


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


@app.post("/api/event_tracking")
async def track_event(event: Event):
    logger.info(f"Tracking event: {event.event_id}")
    try:
        await send_event_to_kafka(event)
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

class TrackRequest(BaseModel):
    track_file_name: str
    track_id: str

@app.post("/api/add_track")
def add_track_feature(track_data: TrackRequest):

    res = extract(track_data.track_file_name)
    # track_file_name = track_data.track_file_name
    # track_id = track_data.track_id

    return {"res": {res}}
    # return {"res": {track_file_name,track_id}}

@app.delete("/api/delete_track/{id}")
async def delete_track_feature(id: int):
    try:
        logger.info(f"Received request to delete track with ID: {id}")

        result = await delete_event_relative_track_id(id)

        logger.info(f"Successfully deleted related data for track ID: {id}")
        return {
            "status": "success",
            "track_id": id,
            "message": result.get("message", "Track deleted successfully")
        }

    except Exception as e:
        logger.error(f"Error deleting track with ID {id}: {str(e)}", exc_info=True)
        return {
            "status_code": 500, "detail":"Internal Server Error during track deletion"
        }
