from fastapi import FastAPI
from app.api import recommendation, event_tracking

app = FastAPI()

app.include_router(recommendation.router)
app.include_router(event_tracking.router)