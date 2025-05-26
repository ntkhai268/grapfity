from fastapi import APIRouter, Depends
from app.services.recommendation_service import get_recommendations
from app.database.db import get_db
from sqlalchemy.orm import Session

router = APIRouter()

@router.get("/api/v1/recommendation")
def recommendation(user_id: str, db: Session = Depends(get_db)):
    recommendations = get_recommendations(user_id, db)
    return {"recommendations": recommendations}