FROM python:3.9-slim

WORKDIR /app
COPY recommender/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY recommender/ .

CMD ["python", "main.py"]