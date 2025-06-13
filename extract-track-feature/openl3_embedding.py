import openl3
import numpy as np

def extract_openl3(audio, sample_rate, content_type="music", embedding_size=512):
    if audio.ndim == 2:
        audio = np.mean(audio, axis=1)
    audio = audio.astype(np.float32)  

    embedding, timestamps = openl3.get_audio_embedding(
        audio, sample_rate,
        content_type=content_type,
        embedding_size=embedding_size
    )
    return embedding, timestamps