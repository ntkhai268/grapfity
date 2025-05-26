import os
from fastapi import FastAPI
from app.api import recommendation, event_tracking

app = FastAPI()

app.include_router(recommendation.router)
app.include_router(event_tracking.router)

if __name__ == "__main__":
    import uvicorn
    host = os.getenv("FASTAPI_HOST", "0.0.0.0")
    port = int(os.getenv("FASTAPI_PORT", 8000))
    uvicorn.run(app, host=host, port=port)