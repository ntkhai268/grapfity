import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.multioutput import MultiOutputRegressor
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_squared_error, r2_score
import joblib

# Đọc dữ liệu đã xử lý
df = pd.read_csv("music_features.csv")

# Tách X (embedding) và Y (features cần dự đoán)
X = df[[col for col in df.columns if col.startswith("emb_")]].values
Y = df[[
    "explicit", "danceability", "speechiness", "acousticness",
    "instrumentalness", "liveness", "valence"
]].values

# Chia train/test
X_train, X_test, Y_train, Y_test = train_test_split(X, Y, test_size=0.2, random_state=42)

# Huấn luyện mô hình Random Forest đa đầu ra
model = MultiOutputRegressor(RandomForestRegressor(n_estimators=500, random_state=42))
model.fit(X_train, Y_train)

# Dự đoán và đánh giá
Y_pred = model.predict(X_test)
print("MSE:", mean_squared_error(Y_test, Y_pred))
print("R^2:", r2_score(Y_test, Y_pred))

# Lưu mô hình
joblib.dump(model, "random_forest_model.pkl")
print("✅ Đã lưu mô hình vào random_forest_model.pkl")
