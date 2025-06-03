<<<<<<< HEAD
import essentia.standard as es
import numpy as np
import logging

logger = logging.getLogger(__name__)

key_to_int = {
    'C': 0, 'C#': 1, 'D': 2, 'D#': 3, 'E': 4,
    'F': 5, 'F#': 6, 'G': 7, 'G#': 8, 'A': 9,
    'A#': 10, 'B': 11
}

def extract_features(audio, sample_rate=44100):
    logger.info("Starting feature extraction; audio shape: %s", audio.shape)
    try:
        if audio.ndim == 2:
            logger.debug("Converting stereo to mono")
            audio = np.mean(audio, axis=1)
        audio = audio.astype(np.float32)

        duration_ms = int(len(audio) / sample_rate * 1000)
        rms = es.RMS()(audio)
        loudness = es.Loudness()(audio)
        tempo, _, _, _, _ = es.RhythmExtractor2013(method="multifeature")(audio)
        key, scale, strength = es.KeyExtractor()(audio)
        mode = 1 if scale.lower() == 'major' else 0

        features = {
            "duration_ms": duration_ms,
            "energy": round(float(rms), 6),
            "loudness": round(float(loudness), 6),
            "tempo": round(float(tempo), 2),
            "key": key_to_int.get(key, -1),
            "mode": mode
        }
        logger.info("Extracted features: %s", features)
        return features
    except Exception as e:
        logger.error("Feature extraction failed: %s", str(e), exc_info=True)
=======
import essentia.standard as es
import numpy as np
import logging

logger = logging.getLogger(__name__)

key_to_int = {
    'C': 0, 'C#': 1, 'D': 2, 'D#': 3, 'E': 4,
    'F': 5, 'F#': 6, 'G': 7, 'G#': 8, 'A': 9,
    'A#': 10, 'B': 11
}

def extract_features(audio, sample_rate=44100):
    logger.info("Starting feature extraction; audio shape: %s", audio.shape)
    try:
        if audio.ndim == 2:
            logger.debug("Converting stereo to mono")
            audio = np.mean(audio, axis=1)
        audio = audio.astype(np.float32)

        duration_ms = int(len(audio) / sample_rate * 1000)
        rms = es.RMS()(audio)
        loudness = es.Loudness()(audio)
        tempo, _, _, _, _ = es.RhythmExtractor2013(method="multifeature")(audio)
        key, scale, strength = es.KeyExtractor()(audio)
        mode = 1 if scale.lower() == 'major' else 0

        features = {
            "duration_ms": duration_ms,
            "energy": round(float(rms), 6),
            "loudness": round(float(loudness), 6),
            "tempo": round(float(tempo), 2),
            "key": key_to_int.get(key, -1),
            "mode": mode
        }
        logger.info("Extracted features: %s", features)
        return features
    except Exception as e:
        logger.error("Feature extraction failed: %s", str(e), exc_info=True)
>>>>>>> 2b77211b7755c6af3e6a2445fd02be158c15e4a7
        raise