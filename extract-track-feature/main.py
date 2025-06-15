from fastapi import FastAPI, UploadFile, File
import numpy as np
import librosa
import tempfile

from essentia_features import extract_features
from openl3_embedding import extract_openl3

app = FastAPI()

@app.post("/extract")
async def extract(file: UploadFile = File(...)):
    # Lưu file tạm để librosa có thể đọc
    with tempfile.NamedTemporaryFile(delete=False, suffix=".mp3") as tmp:
        tmp.write(await file.read())
        tmp_path = tmp.name

    # Đọc audio (MP3, WAV, v.v.)
    data, sr = librosa.load(tmp_path, sr=None, mono=True)

    # Trích xuất đặc trưng
    features = extract_features(data, sr)
    embedding, _ = extract_openl3(data, sr)
    embedding = embedding.mean(axis=0).tolist()
    features['embedding'] = embedding
    print(features)

    return features
