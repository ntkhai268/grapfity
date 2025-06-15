# audio_features/extractor.py

import essentia.standard as es
import numpy as np

def extract_features(audio, sample_rate=44100):
    if audio.ndim == 2:
        audio = np.mean(audio, axis=1)  # chuyển stereo → mono
    audio = audio.astype(np.float32)   # ép về đúng kiểu

    """
    Trích xuất các đặc trưng âm thanh từ dữ liệu audio (NumPy array).
    Trả về dict chứa các đặc trưng.
    """
    key_to_int = {
        'C': 0, 'C#': 1, 'D': 2, 'D#': 3, 'E': 4,
        'F': 5, 'F#': 6, 'G': 7, 'G#': 8, 'A': 9,
        'A#': 10, 'B': 11
    }

    # 1. Duration
    duration = len(audio) / sample_rate
    duration_ms = int(duration * 1000)

    # 2. RMS Energy
    rms = es.RMS()(audio)

    # 3. Loudness
    loudness = es.Loudness()(audio)

    # 4. Tempo
    rhythm_extractor = es.RhythmExtractor2013(method="multifeature")
    tempo, beat_confidence, _, _, _ = rhythm_extractor(audio)

    # 5. Key + Mode
    key, scale, strength = es.KeyExtractor()(audio)

    # Gộp kết quả
    return {
        "duration_ms": duration_ms,
        "energy": round(float(rms), 6),
        "loudness": round(float(loudness), 6),
        "tempo": round(float(tempo), 2),
        "key": key_to_int.get(key, -1),   # nếu key không hợp lệ → -1
        "mode": 1 if 'major' else 0
    }