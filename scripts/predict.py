import joblib
import numpy as np

# Load mô hình đã huấn luyện
model = joblib.load("model/extractor_model.pkl")

# Các nhãn đầu ra cần dự đoán
LABELS = [
    "explicit",
    "danceability",
    "speechiness",
    "acousticness",
    "instrumentalness",
    "liveness",
    "valence"
]

# Hàm dự đoán với đầu vào là 1 vector 512 chiều
def predict(embedding_vector):
    X = np.array(embedding_vector).reshape(1, -1)
    preds = model.predict(X)[0]
    return dict(zip(LABELS, preds))
