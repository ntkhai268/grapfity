from fastapi import HTTPException
from typing import Dict
import pandas as pd
from src.database.db import get_all_event_data
import os
from surprise import SVD, Dataset, Reader
import joblib
from src.services.recommendation import load_matrices
import logging

logger = logging.getLogger(__name__)

SCORE_MAP: Dict[str, int] = {
    "click": 1,
    "play": 2
}

def process_data(data):
    logger.info("Processing event data...")
    try:

        # Đếm số lần xuất hiện của từng (user_id, track_id, event_type)
        count_dict = {}
        for row in data:
            user_id, track_id, event_type = row
            key = (user_id, track_id, event_type)
            count_dict[key] = count_dict.get(key, 0) + 1 # Nếu chưa tồn tại key trong count_dict, get(key, 0) trả về 0

        # Tính điểm tương tác
        score_dict = {}
        for (user_id, track_id, event_type), count in count_dict.items():
            score = count * SCORE_MAP.get(event_type, 0) # Nếu chưa tồn tại event_type trong SCORE_MAP, get(event_type, 0) trả về 0
            key = (user_id, track_id)
            score_dict[key] = score_dict.get(key, 0) + score
        
        logger.info(f"Processed {len(score_dict)} user-track interactions")
        return score_dict
    except Exception as e:
        logger.error(f"Data processing failed: {str(e)}", exc_info=True)
        raise

def create_dataframe(score_dict): # score_dict là một dict dạng {(user_id, track_id): score}
    try:
        df = pd.DataFrame(list(score_dict.items()), columns=["key", "score"])

        df[["user_id", "track_id"]] = pd.DataFrame(df["key"].tolist(), index=df.index)

        # Dùng pivot để tạo ma trận:

        # index="user_id" → mỗi dòng là một bài hát

        # columns="track_id" → mỗi cột là một người dùng

        # values="score" → giá trị là điểm tương tác

        # fillna(0) để thay giá trị thiếu bằng 0 (người dùng chưa tương tác)

        df = df.pivot(index="user_id", columns="track_id", values="score").fillna(0)
        
        logger.info(f"DataFrame created. Shape: {df.shape}")
        logger.debug(f"DataFrame columns: {df.columns.tolist()}")
        logger.debug(f"DataFrame index: {df.index.tolist()[:5]}...")
        
        return df
    except Exception as e:
        logger.error(f"DataFrame creation failed: {str(e)}", exc_info=True)
        raise

def train_svd_and_save_matrices(df, k=10):
    logger.info("Training SVD model...")
    try:
        reader = Reader(rating_scale=(0, df.values.max()))
        data = Dataset.load_from_df(df.stack().reset_index(), reader)
        trainset = data.build_full_trainset()
        
        logger.info(f"Training set: {trainset.n_users} users, {trainset.n_items} items, {trainset.n_ratings} ratings")
        
        svd = SVD(n_factors=k)
        svd.fit(trainset)
        logger.info("SVD model trained successfully")

        matrix_folder = os.getenv("FASTAPI_MATRIX_FOLDER", "static/matrix/")
        os.makedirs(matrix_folder, exist_ok=True)
        
        pu_path = os.path.join(matrix_folder, "P_matrix.pkl")
        qi_path = os.path.join(matrix_folder, "Q_matrix.pkl")
        user_ids_path = os.path.join(matrix_folder, "user_ids.pkl")
        track_ids_path = os.path.join(matrix_folder, "track_ids.pkl")
        
        joblib.dump(svd.pu, pu_path)
        joblib.dump(svd.qi, qi_path)

        user_ids = [trainset.to_raw_uid(i) for i in range(trainset.n_users)]
        track_ids = [trainset.to_raw_iid(i) for i in range(trainset.n_items)]
       
        joblib.dump(user_ids, user_ids_path)
        joblib.dump(track_ids, track_ids_path)

        logger.info(f"Model saved. User count: {len(user_ids)}, Track count: {len(track_ids)}")
        logger.info(f"Files saved to: {matrix_folder}")
        return svd
    except Exception as e:
        logger.error(f"SVD training failed: {str(e)}", exc_info=True)
        raise

async def update_svd_model():
    try:
        logger.info("Starting model update process...")
        
        logger.info("Fetching event data...")
        data = await get_all_event_data()
        logger.info(f"Retrieved {len(data)} events")
        
        logger.info("Processing data...")
        score_dict = process_data(data)
      
        logger.info("Creating DataFrame...")
        df = create_dataframe(score_dict)
        
        logger.info("Training new model...")
        train_svd_and_save_matrices(df)
        
        logger.info("Reloading matrices...")
        load_matrices()
        
        logger.info("Model update completed successfully")
        return {"status": "Model updated successfully"}
    except Exception as e:
        logger.error(f"Model update failed: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))