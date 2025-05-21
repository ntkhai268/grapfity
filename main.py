from __future__ import unicode_literals
import yt_dlp
import ffmpeg
from youtubesearchpython import VideosSearch
import csv
import io
import soundfile as sf
import numpy as np
import essentia_features
import openl3_embedding
import json
import os

def search_youtube(song_title, artist):
    query = f"{song_title} {artist}"
    results = VideosSearch(query, limit=1).result()
    if results["result"]:
        video = results["result"][0]
        return video["link"]
    return None

def get_best_audio_url(youtube_url):
    ydl_opts = {
        'quiet': True,
        'skip_download': True,
        'format': 'bestaudio/best'
    }
    with yt_dlp.YoutubeDL(ydl_opts) as ydl:
        info = ydl.extract_info(youtube_url, download=False)
        return info['url']

def get_video_info(youtube_url):
    ydl_opts = {
        'quiet': True,
        'skip_download': True
    }
    with yt_dlp.YoutubeDL(ydl_opts) as ydl:
        return ydl.extract_info(youtube_url, download=False)

def load_wav_from_youtube(youtube_url):
    stream_url = get_best_audio_url(youtube_url)
    out, _ = (
        ffmpeg
        .input(stream_url)
        .output('pipe:', format='wav', acodec='pcm_s16le', ar=44100)
        .run(capture_stdout=True, capture_stderr=True)
    )
    audio_data, sample_rate = sf.read(io.BytesIO(out))
    return audio_data, sample_rate

if __name__ == '__main__':
    filepath = 'tracks.csv'
    outputfile = 'tracks_with_features.csv'
    write_header = not os.path.exists(outputfile)

    with open(filepath, newline='', encoding='utf-8') as csvfile:
        reader = csv.DictReader(csvfile)
        count = -1
        num = 6500  
        cur = 6244
        for row in reader:
            count += 1
            if (count <= cur):
                continue
            if (count > num):
                break

            id = row['id']
            song_title = row['name']
            artist = row['artists']
            print(f"⏳ Đang xử lý: {id}")

            url = search_youtube(song_title, artist)
            if not url:
                print(f"❌ Không tìm thấy video cho: {id}")
                continue

            try:
                info = get_video_info(url)
                title = info.get("title", "").lower()
                duration = info.get("duration", 0)

                if song_title.lower() not in title:
                    print(f"⚠️ Bỏ qua {id} vì tiêu đề không khớp")

                    empty_fields = {
                        "duration_ms": "",
                        "energy": "",
                        "loudness": "",
                        "tempo": "",
                        "key": "",
                        "mode": "",
                        "embedding": ""
                    }
                    combined = {**row, **empty_fields}

                    with open(outputfile, 'a', newline='', encoding='utf-8') as f_out:
                        writer = csv.DictWriter(f_out, fieldnames=combined.keys())
                        if write_header:
                            writer.writeheader()
                            write_header = False
                        writer.writerow(combined)
                    continue

                if duration > 420:
                    print(f"⚠️ Bỏ qua {id} vì video quá dài ({duration}s)")

                    empty_fields = {
                        "duration_ms": "",
                        "energy": "",
                        "loudness": "",
                        "tempo": "",
                        "key": "",
                        "mode": "",
                        "embedding": ""
                    }
                    combined = {**row, **empty_fields}

                    with open(outputfile, 'a', newline='', encoding='utf-8') as f_out:
                        writer = csv.DictWriter(f_out, fieldnames=combined.keys())
                        if write_header:
                            writer.writeheader()
                            write_header = False
                        writer.writerow(combined)
                    continue


                audio_data, sr = load_wav_from_youtube(url)
                features = essentia_features.extract_features(audio_data)
                embedding, _ = openl3_embedding.extract_openl3(audio_data, sr)
                embedding_mean = embedding.mean(axis=0)
                embedding_str = json.dumps(embedding_mean.tolist())

                combined = {**row, **features, "embedding": embedding_str}

                # Ghi ngay dòng vừa xử lý xong
                with open(outputfile, 'a', newline='', encoding='utf-8') as f_out:
                    writer = csv.DictWriter(f_out, fieldnames=combined.keys())
                    if write_header:
                        writer.writeheader()
                        write_header = False
                    writer.writerow(combined)

                print(f"✅ Đã xử lý xong {id}: {len(audio_data)} samples\n")

            except Exception as e:
                print(f"❌ Lỗi xử lý {id}: {e}")

                # Ghi dòng lỗi với giá trị rỗng
                empty_fields = {
                    "duration_ms": "",
                    "energy": "",
                    "loudness": "",
                    "tempo": "",
                    "key": "",
                    "mode": "",
                    "embedding": ""
                }

                combined = {**row, **empty_fields}

                with open(outputfile, 'a', newline='', encoding='utf-8') as f_out:
                    writer = csv.DictWriter(f_out, fieldnames=combined.keys())
                    if write_header:
                        writer.writeheader()
                        write_header = False
                    writer.writerow(combined)


