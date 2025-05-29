import joblib
import numpy as np
import pandas as pd
from sklearn.metrics.pairwise import cosine_similarity
from src.database.db import get_user_events, get_track_metadata
import os

###### Content-based ###########

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

# Biến toàn cục để lưu metadata của các bài hát dưới dạng DataFrame
track_metadata = None

# Biến toàn cục để lưu vector đặc trưng số học của các bài hát (dạng numpy array)
track_vectors = None

async def load_track_metadata():
    global track_metadata, track_vectors
    
    # Lấy dữ liệu bài hát từ database (cột: track_id + các numeric features)
    data = await get_track_metadata()
    
    # Chuyển dữ liệu về dạng bảng (DataFrame)
    track_metadata = pd.DataFrame(data)
    
    # Reset index để đảm bảo index liên tục
    track_metadata = track_metadata.reset_index(drop=True)
    
    # Xử lý dữ liệu thiếu: nếu có cột nào bị null, thay bằng 0
    track_metadata[NUMERIC_FEATURES] = track_metadata[NUMERIC_FEATURES].fillna(0)
    
    # Chuyển dữ liệu về dạng số thực (float), lưu thành ma trận numpy
    track_vectors = track_metadata[NUMERIC_FEATURES].astype(float).values

async def content_based_recommend(user_id: str, n: int = 10):
    # Nếu metadata chưa load thì gọi hàm khởi tạo
    if track_metadata is None or track_vectors is None:
        await load_track_metadata()

    # Lấy các sự kiện người dùng đã tương tác (click, play, etc.)
    events = await get_user_events(user_id)
    
    # Nếu user chưa từng tương tác, trả về ngẫu nhiên n bài hát
    if not events:
        return track_metadata['track_id'].sample(n).tolist()
    
    # Lấy danh sách các track_id đã tương tác, loại bỏ trùng lặp bằng set
    user_track_ids = list(set(event['track_id'] for event in events))

    # Tìm index trong DataFrame ứng với các track mà user đã nghe
    indices = track_metadata[track_metadata['track_id'].isin(user_track_ids)].index.tolist()
    
    # Nếu không tìm thấy track nào, trả về ngẫu nhiên n bài hát
    if not indices:
        return track_metadata['track_id'].sample(n).tolist()

    # Tính vector trung bình của các bài hát mà user đã tương tác
    user_vector = track_vectors[indices].mean(axis=0)
    
    # Tính độ tương đồng cosine giữa user_vector và toàn bộ bài hát
    similarities = cosine_similarity([user_vector], track_vectors).flatten()
    
    # Sắp xếp chỉ số theo thứ tự độ tương đồng giảm dần, lấy top-n
    top_n = similarities.argsort()[::-1][:n]
    
    return track_metadata['track_id'].iloc[top_n].tolist()

######### SVD ################

P = None
Q = None
user_ids = None
track_ids = None

def load_matrices():
    global P, Q, user_ids, track_ids
    matrix_folder = os.getenv("FASTAPI_MATRIX_FOLDER", "static/matrix/")
    P = joblib.load(os.path.join(matrix_folder, "P_matrix.pkl"))
    Q = joblib.load(os.path.join(matrix_folder, "Q_matrix.pkl"))
    user_ids = joblib.load(os.path.join(matrix_folder, "user_ids.pkl"))
    track_ids = joblib.load(os.path.join(matrix_folder, "track_ids.pkl"))

def svd_recommend(user_id: str, n: int = 10):
    global P, Q, user_ids, track_ids

    if P is None or Q is None or user_ids is None or track_ids is None:
        load_matrices()

    # Kiểm tra xem user_id có tồn tại trong user_ids không
    if user_id not in user_ids:
        raise ValueError("User ID not found in SVD model")

    # Lấy chỉ số của user_id từ danh sách user_ids
    user_idx = user_ids.index(user_id)

    # Tính dự đoán và gợi ý top-N track
    predictions = np.dot(P[user_idx], Q.T)

    top_n_indices = np.argsort(predictions)[::-1][:n]

    recommended_tracks = [track_ids[i] for i in top_n_indices]

    return recommended_tracks

async def get_recommendations(user_id: str, n: int = 10):
    global user_ids

    if user_ids is None:
        load_matrices()

    # Kiểm tra xem user_id có trong user_ids không
    if user_id in user_ids:
        # Nếu có, sử dụng SVD để gợi ý
        return svd_recommend(user_id, n)
    else:
        # Nếu không, fallback sang Content-based
        return await content_based_recommend(user_id, n)