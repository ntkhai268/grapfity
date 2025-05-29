from fastapi import HTTPException
from typing import Dict
import pandas as pd
from src.database.db import get_all_event_data
import os
from surprise import SVD, Dataset, Reader
import joblib
from src.services.recommendation import load_matrices
import logging  # 👈 Thêm logging

logger = logging.getLogger(__name__)

SCORE_MAP: Dict[str, int] = {
    "click": 1,
    "play": 2
}

def process_data(data):
    logger.info("Processing event data...")
    count_dict = {}
    for row in data:
        user_id, track_id, event_type = row
        key = (user_id, track_id, event_type)
        count_dict[key] = count_dict.get(key, 0) + 1

    score_dict = {}
    for (user_id, track_id, event_type), count in count_dict.items():
        score = count * SCORE_MAP.get(event_type, 0)
        key = (user_id, track_id)
        score_dict[key] = score_dict.get(key, 0) + score
    logger.info(f"Processed {len(score_dict)} user-track interactions.")
    return score_dict

def create_dataframe(score_dict):
    logger.info("Creating DataFrame...")
    df = pd.DataFrame(list(score_dict.items()), columns=["key", "score"])
    df[["user_id", "track_id"]] = pd.DataFrame(df["key"].tolist(), index=df.index)
    df = df.pivot(index="track_id", columns="user_id", values="score").fillna(0)
    logger.info(f"DataFrame shape: {df.shape}")
    return df

def train_svd_and_save_matrices(df, k=10):
    """Huấn luyện SVD và lưu ma trận P, Q, cùng danh sách user_id và track_id"""
    logger.info("Training SVD model...")
    reader = Reader(rating_scale=(0, df.values.max()))
    data = Dataset.load_from_df(df.stack().reset_index(), reader)
    trainset = data.build_full_trainset()
    svd = SVD(n_factors=k)
    svd.fit(trainset)

    # Lưu ma trận P và Q
    matrix_folder = os.getenv("FASTAPI_MATRIX_FOLDER", "static/matrix/")
    os.makedirs(matrix_folder, exist_ok=True)
    
    pu_path = os.path.join(matrix_folder, "P_matrix.pkl")
    qi_path = os.path.join(matrix_folder, "Q_matrix.pkl")
    user_ids_path = os.path.join(matrix_folder, "user_ids.pkl")
    track_ids_path = os.path.join(matrix_folder, "track_ids.pkl")
    
    joblib.dump(svd.pu, pu_path)
    joblib.dump(svd.qi, qi_path)

    # Lưu danh sách user_ids và track_ids
    user_ids = [trainset.to_raw_uid(i) for i in range(trainset.n_users)]
    track_ids = [trainset.to_raw_iid(i) for i in range(trainset.n_items)]
    joblib.dump(user_ids, user_ids_path)
    joblib.dump(track_ids, track_ids_path)

    logger.info(f"Model trained and saved. User count: {len(user_ids)}, Track count: {len(track_ids)}")
    logger.info(f"Matrix files saved in: {matrix_folder}")
    return svd

async def update_svd_model():
    try:
        logger.info("Starting model update process...")
        logger.info("Fetching event data from database...")
        data = await get_all_event_data()
        logger.info(f"Retrieved {len(data)} events from database")
        
        score_dict = process_data(data)
        df = create_dataframe(score_dict)
        
        logger.info("Training new SVD model...")
        train_svd_and_save_matrices(df)
        
        logger.info("Reloading matrices into memory...")
        load_matrices()
        
        logger.info("Model update completed successfully")
        return {"status": "Model updated successfully"}
    except Exception as e:
        logger.error(f"Model update failed: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))