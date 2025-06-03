import openl3
import numpy as np
import logging

logger = logging.getLogger(__name__)

def extract_openl3(audio, sample_rate, content_type="music", embedding_size=512):
    logger.info("Extracting OpenL3 embedding; audio length=%d, sr=%d", len(audio), sample_rate)
    try:
        if audio.ndim == 2:
            logger.debug("Averaging stereo channels for embedding")
            audio = audio.mean(axis=1)
        audio = audio.astype(np.float32)
        embedding, timestamps = openl3.get_audio_embedding(
            audio, sample_rate,
            content_type=content_type,
            embedding_size=embedding_size
        )
        logger.info("Obtained embedding shape: %s", embedding.shape)
        return embedding, timestamps
    except Exception as e:
        logger.error("OpenL3 embedding failed: %s", str(e), exc_info=True)
        raise