FROM python:3.10-slim

# Cài các gói hệ thống cần thiết
RUN apt-get update && apt-get install -y ffmpeg libsndfile1 && apt-get clean

# Copy requirements và cài thư viện
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy toàn bộ mã nguồn và model vào image
WORKDIR /app
COPY ./scripts ./scripts
COPY ./model ./model

# Lệnh mặc định khi chạy container
CMD ["python", "scripts/extract_audio_features.py", "input/track.mp3"]
