import os
import json
import soundfile as sf
import numpy as np
import ffmpeg
import io
import requests
import logging
from src.services.extract_track_features.essentia_features import extract_features
from src.services.extract_track_features.predict import predict
from src.services.extract_track_features.openl3_embedding import extract_openl3

logger = logging.getLogger(__name__)


def load_audio(file_path, target_sr=44100):
    logger.info("Loading audio from %s", file_path)
    try:
        out, _ = (
            ffmpeg
            .input(file_path)
            .output('pipe:', format='wav', acodec='pcm_s16le', ar=target_sr)
            .run(capture_stdout=True, capture_stderr=True)
        )
        audio_data, sr = sf.read(io.BytesIO(out))
        if audio_data.ndim == 2:
            logger.debug("Mixing stereo channels")
            audio_data = np.mean(audio_data, axis=1)
        audio_data = audio_data.astype(np.float32)
        logger.info("Loaded audio: samples=%d, sr=%d", len(audio_data), sr)
        return audio_data, sr
    except Exception as e:
        logger.error("Audio loading failed: %s", str(e), exc_info=True)
        raise


def file_exists_at_url(url):
    logger.debug("Checking URL existence: %s", url)
    try:
        response = requests.head(url, allow_redirects=True, timeout=5)
        if response.status_code == 405:
            response = requests.get(url, stream=True, timeout=5)
        exists = response.status_code == 200
        logger.debug("URL %s exists: %s", url, exists)
        return exists
    except requests.RequestException as e:
        logger.error("Error checking URL %s: %s", url, e)
        return False


def extract(file_name):
    logger.info("Starting extract for file: %s", file_name)
    backend_host = os.getenv("FASTAPI_BACKEND_HOST", "localhost")
    backend_port = os.getenv("FASTAPI_BACKEND_PORT", "8001")
    url = f"http://{backend_host}:{backend_port}/assets/track_audio/{file_name}"

    if not file_exists_at_url(url):
        msg = f"Audio file not found: {url}"
        logger.error(msg)
        raise FileNotFoundError(msg)

    try:
        audio_data, sr = load_audio(url)
        features = extract_features(audio_data)
        embedding, _ = extract_openl3(audio_data, sr)
        embedding_mean = embedding.mean(axis=0)
        prediction = predict(embedding_mean)

        output = {**features, "prediction": prediction}
        logger.info("Extraction and prediction successful: %s", output)
        print(json.dumps(output, indent=2))
    except Exception as e:
        logger.error("Error in extract pipeline: %s", e, exc_info=True)
        print(f"Lỗi khi xử lý file: {e}")