FROM python:3.9-slim

# Thiết lập thư mục làm việc
WORKDIR /app

# Cài các thư viện hệ thống cần thiết
RUN apt-get update && apt-get install -y \
    ffmpeg \
    libfftw3-dev \
    libsndfile1 \
    libtag1-dev \
    build-essential \
    libeigen3-dev \
    git \
    python3-distutils \
    && rm -rf /var/lib/apt/lists/*

# Sao chép requirements và cài Python packages
COPY requirements.txt ./
RUN pip install --upgrade pip && pip install -r requirements.txt

# Sao chép toàn bộ project vào container
COPY . .

# Khởi chạy app bằng uvicorn
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "5000"]
