import pandas as pd
import json

# Đường dẫn đến 2 file đầu vào
features_file = "features.csv"       # chứa valence, energy, tempo, v.v.
embedding_file = "embeddings.csv"    # chứa id và embedding (dạng chuỗi JSON hoặc 512 cột)

# Đọc file features, chỉ lấy các cột cần thiết
selected_columns = [
    "id", "explicit", "danceability", "speechiness",
    "acousticness", "instrumentalness", "liveness", "valence"
]
features_df = pd.read_csv(features_file, usecols=selected_columns)

# Đọc file embeddings
embedding_df = pd.read_csv(embedding_file)

# Nếu embedding đang ở dạng 1 cột chuỗi JSON (ví dụ cột "embedding")
if 'embedding' in embedding_df.columns:
    # Bỏ những dòng không có embedding hoặc bị lỗi định dạng
    embedding_df = embedding_df[embedding_df['embedding'].notnull()]
    embedding_df = embedding_df[embedding_df['embedding'].apply(lambda x: isinstance(x, str) and x.strip().startswith('['))]

    # Chuyển từ chuỗi JSON sang các cột riêng biệt
    embedding_expanded = embedding_df['embedding'].apply(json.loads)
    embedding_df = pd.concat([
        embedding_df[['id']].reset_index(drop=True),
        pd.DataFrame(embedding_expanded.tolist()).add_prefix("emb_")
    ], axis=1)

# Gộp 2 file dựa trên cột "id"
merged_df = pd.merge(features_df, embedding_df, on="id", how="inner")

# Xuất ra file csv hoàn chỉnh
merged_df.to_csv("music_features.csv", index=False)

print("✅ Đã tạo file music_features.csv với đầy đủ features được chọn + embedding.")
