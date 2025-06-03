<<<<<<< HEAD
import os
import joblib
import numpy as np
import logging

logger = logging.getLogger(__name__)
Model = None
LABELS = ["explicit", "danceability", "speechiness", "acousticness",
          "instrumentalness", "liveness", "valence"]

def load_model():
    global Model
    if Model is None:
        model_path = os.path.join(os.getenv("FASTAPI_MATRIX_FOLDER", "static/matrix/"), "extractor_model.pkl")
        logger.info("Loading prediction model from %s", model_path)
        try:
            Model = joblib.load(model_path)
            logger.info("Model loaded successfully")
        except Exception as e:
            logger.error("Failed to load model: %s", e, exc_info=True)
            raise
    return Model

def predict(embedding_vector):
    logger.info("Predicting with embedding vector length %d", len(embedding_vector))

    if Model is None:
        load_model()

    arr = np.array(embedding_vector)
    if arr.ndim > 1:
        arr = arr.flatten()
    if arr.shape[0] != Model.n_features_in_:
        msg = f"Embedding size mismatch: expected {Model.n_features_in_}, got {arr.shape[0]}"
        logger.error(msg)
        raise ValueError(msg)
    X = arr.reshape(1, -1)
    try:
        preds = Model.predict(X)
        result = preds[0] if preds.ndim > 1 else preds
        output = dict(zip(LABELS, result))
        logger.info("Prediction output: %s", output)
        return output
    except Exception as e:
        logger.error("Prediction failed: %s", e, exc_info=True)
        raise
=======
import os
import joblib
import numpy as np
import logging

logger = logging.getLogger(__name__)
Model = None
LABELS = ["explicit", "danceability", "speechiness", "acousticness",
          "instrumentalness", "liveness", "valence"]

def load_model():
    global Model
    if Model is None:
        model_path = os.path.join(os.getenv("FASTAPI_MATRIX_FOLDER", "static/matrix/"), "extractor_model.pkl")
        logger.info("Loading prediction model from %s", model_path)
        try:
            Model = joblib.load(model_path)
            logger.info("Model loaded successfully")
        except Exception as e:
            logger.error("Failed to load model: %s", e, exc_info=True)
            raise
    return Model

def predict(embedding_vector):
    logger.info("Predicting with embedding vector length %d", len(embedding_vector))

    if Model is None:
        load_model()

    arr = np.array(embedding_vector)
    if arr.ndim > 1:
        arr = arr.flatten()
    if arr.shape[0] != Model.n_features_in_:
        msg = f"Embedding size mismatch: expected {Model.n_features_in_}, got {arr.shape[0]}"
        logger.error(msg)
        raise ValueError(msg)
    X = arr.reshape(1, -1)
    try:
        preds = Model.predict(X)
        result = preds[0] if preds.ndim > 1 else preds
        output = dict(zip(LABELS, result))
        logger.info("Prediction output: %s", output)
        return output
    except Exception as e:
        logger.error("Prediction failed: %s", e, exc_info=True)
        raise
>>>>>>> 2b77211b7755c6af3e6a2445fd02be158c15e4a7
