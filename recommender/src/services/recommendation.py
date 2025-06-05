import joblib
import numpy as np
import pandas as pd
from sklearn.metrics.pairwise import cosine_similarity
from src.database.db import get_user_events, get_track_metadata
import os
import logging

logger = logging.getLogger(__name__)

NUMERIC_FEATURES = [
    'explicit',
    'danceability',
    'energy',
    'key',
    'loudness',
    'mode',
    'speechiness',
    'acousticness',
    'instrumentalness',
    'liveness',
    'valence',
    'tempo',
    'duration_ms',
    'time_signature'
]

track_metadata = None
track_vectors = None

async def load_track_metadata():
    global track_metadata, track_vectors
    logger.info("Loading track metadata...")
    
    try:
        data = await get_track_metadata()

        # Convert SQLAlchemy Row/Record objects to dicts
        if data and not isinstance(data[0], dict):
           data = [dict(row) for row in data]
            
        logger.info(f"Retrieved {len(data)} tracks from database")

        
        track_metadata = pd.DataFrame(data)
        track_metadata = track_metadata.reset_index(drop=True)
        
        track_metadata[NUMERIC_FEATURES] = track_metadata[NUMERIC_FEATURES].fillna(0)
        track_vectors = track_metadata[NUMERIC_FEATURES].astype(float).values
        
        logger.info("Track metadata loaded successfully")
        logger.debug(f"Metadata shape: {track_metadata.shape}")
    except Exception as e:
        logger.error(f"Failed to load track metadata: {str(e)}", exc_info=True)
        raise

async def content_based_recommend(user_id: str, n: int = 10):
    logger.info(f"Starting content-based recommendation for user: {user_id}")
    
    try:
        if track_metadata is None or track_vectors is None:
            logger.info("Track metadata not loaded, loading now...")
            await load_track_metadata()

        # If the model is not updated
        events = await get_user_events(user_id)
        logger.info(f"User {user_id} has {len(events)} events")
        random_state = int(os.getenv("FASTAPI_RANDOM_STATE", 42))
        if not events:
            logger.info(f"User {user_id} has no events, returning random tracks")
            
            return track_metadata['track_id'].sample(n,random_state =random_state).tolist()
        
        user_track_ids = list(set(event['track_id'] for event in events))
        logger.info(f"User {user_id} has interacted with {len(user_track_ids)} unique tracks")

        indices = track_metadata[track_metadata['track_id'].isin(user_track_ids)].index.tolist()

        # Find the position (index) of records in track_metadata whose track_id is in the user_track_ids list to get metadata for cosine simi.
        if not indices:
            logger.info(f"No matching tracks in metadata for user {user_id}, returning random tracks")
            return track_metadata['track_id'].sample(n,random_state =random_state).tolist()

        user_vector = track_vectors[indices].mean(axis=0)
        logger.info("Computed user vector")
        
        similarities = cosine_similarity([user_vector], track_vectors).flatten()
        logger.info("Computed cosine similarities")
        
        top_n = similarities.argsort()[::-1][:n]
        logger.info(f"Generated {n} recommendations")
        
        return track_metadata['track_id'].iloc[top_n].tolist()
    except Exception as e:
        logger.error(f"Content-based recommendation failed for user {user_id}: {str(e)}", exc_info=True)
        raise

P = None
Q = None
user_ids = None
track_ids = None

def load_matrices():
    global P, Q, user_ids, track_ids
    logger.info("Loading SVD matrices...")
    
    try:
        matrix_folder = os.getenv("FASTAPI_MATRIX_FOLDER", "static/matrix/")
        P = joblib.load(os.path.join(matrix_folder, "P_matrix.pkl"))
        Q = joblib.load(os.path.join(matrix_folder, "Q_matrix.pkl"))
        user_ids = joblib.load(os.path.join(matrix_folder, "user_ids.pkl"))
        track_ids = joblib.load(os.path.join(matrix_folder, "track_ids.pkl"))
        
        logger.info(f"Loaded matrices: P shape {P.shape}, Q shape {Q.shape}")
        logger.info(f"User count: {len(user_ids)}, Track count: {len(track_ids)}")
    except Exception as e:
        logger.error(f"Failed to load matrices: {str(e)}", exc_info=True)
        raise

def svd_recommend(user_id: str, n: int = 10):
    global P, Q, user_ids, track_ids
    logger.info(f"Generating SVD recommendations for user: {user_id}")
    
    try:
        if P is None or Q is None or user_ids is None or track_ids is None:
            logger.info("Matrices not loaded, loading now...")
            load_matrices()

        if user_id not in user_ids:
            logger.warning(f"User ID {user_id} not found in SVD model")
            raise ValueError("User ID not found in SVD model")

        user_idx = user_ids.index(user_id)
        logger.info(f"User index: {user_idx}")

        predictions = np.dot(P[user_idx], Q.T)
        logger.info("Computed predictions")
        
        top_n_indices = np.argsort(predictions)[::-1][:n]
        logger.info(f"Selected top {n} indices")
        
        recommended_tracks = [track_ids[i] for i in top_n_indices]
        logger.info(f"Recommended tracks: {recommended_tracks}")
        
        return recommended_tracks
    except Exception as e:
        logger.error(f"SVD recommendation failed for user {user_id}: {str(e)}", exc_info=True)
        raise

async def get_recommendations(user_id: str, n: int = 10):
    logger.info(f"Getting recommendations for user: {user_id}")
    
    try:
        if user_ids is None:
            logger.info("User IDs not loaded, loading matrices...")
            load_matrices()

        if user_id in user_ids:
            logger.info(f"Using SVD for user {user_id}")
            return svd_recommend(user_id, n)
        else:
            logger.info(f"Using content-based for new user {user_id}")
            return await content_based_recommend(user_id, n)
    except Exception as e:
        logger.error(f"Recommendation failed for user {user_id}: {str(e)}", exc_info=True)
        raise