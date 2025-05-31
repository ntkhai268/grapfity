FROM python:3.9-slim-bullseye

# Cài đặt các thư viện hệ thống cần thiết
RUN apt-get update && \
    apt-get install -y \
    ffmpeg \
    build-essential \
    cmake \
    libatlas-base-dev \
    gfortran \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY requirements.txt .

# Giải pháp fix lỗi scikit-surprise:
# 1. Cài đặt numpy phiên bản cũ trước
# 2. Cài Cython để build scikit-surprise
# 3. Cài scikit-surprise với --no-build-isolation
RUN pip install --upgrade pip && \
    pip install --no-cache-dir "numpy==1.24.4" "cython==3.0.10" && \
    pip install --no-cache-dir "scikit-surprise==1.1.3" --no-build-isolation

# Cài các package còn lại
RUN pip install --no-cache-dir -r requirements.txt

EXPOSE 8000
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]