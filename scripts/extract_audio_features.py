import os
import sys
import json
import soundfile as sf
import numpy as np
import ffmpeg
import io
import subprocess
import essentia_features as essentia_features
import openl3_embedding as openl3_embedding
from predict import predict

def convert_mp3_to_mov(file_path):
    if file_path.lower().endswith(".mp3"):
        mov_path = file_path[:-4] + ".mov"
        subprocess.run([
            "ffmpeg", "-y", "-i", file_path,
            "-c:v", "copy", "-c:a", "aac", mov_path
        ], check=True)
        return mov_path
    return file_path

def load_audio(file_path, target_sr=44100):
    out, _ = (
        ffmpeg
        .input(file_path)
        .output('pipe:', format='wav', acodec='pcm_s16le', ar=target_sr)
        .run(capture_stdout=True, capture_stderr=True)
    )
    audio_data, sr = sf.read(io.BytesIO(out))
    if audio_data.ndim == 2:
        audio_data = np.mean(audio_data, axis=1)
    return audio_data.astype(np.float32), sr

if __name__ == '__main__':
    if len(sys.argv) < 2:
        print("Vui lòng cung cấp đường dẫn đến file âm thanh (wav/mp3).")
        sys.exit(1)

    input_file = sys.argv[1]
    if not os.path.isfile(input_file):
        print(f"File không tồn tại: {input_file}")
        sys.exit(1)

    print(f"🎵 Đang xử lý file: {input_file}")

    try:
        # Nếu là mp3 thì chuyển sang mov
        input_file = convert_mp3_to_mov(input_file)

        audio_data, sr = load_audio(input_file)
        features = essentia_features.extract_features(audio_data)
        embedding, _ = openl3_embedding.extract_openl3(audio_data, sr)
        embedding_mean = embedding.mean(axis=0)

        predicted = predict(embedding_mean)

        output = {
            **features,
            "prediction": predicted
        }

        print(json.dumps(output, indent=2))
        print("Xử lý và dự đoán thành công.")

    except Exception as e:
        print(f"Lỗi khi xử lý file: {e}")