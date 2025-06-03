import React, { useState, useEffect } from "react";
import { initWaveSurfer } from "../../hooks/WaveForm";
import { Song } from "../../hooks/GlobalAudioManager";
import {  TrackData } from "../../services/trackServiceAPI"; 
import { getTop5TracksOfProfileAPI } from "../../services/listeningService";
import SongOptionOfUser from "./SongOptionOfUser";
import UpdateSongBasicInfo from "../Manager_Songs/updateSongBasicInfo";

interface SongProps {
  viewedUserId: string | number;
  currentUserId: string | number;
}

const BACKEND_URL = 'http://localhost:8080';
// Hàm map tạm thời từ TrackData sang Song (bạn có thể đặt ở nơi khác)
function normalizeUrl(url: string | undefined | null): string | undefined {
  if (!url) return undefined;
  if (url.startsWith('http://') || url.startsWith('https://')) return url; // đã chuẩn URL
  return `${BACKEND_URL}/${url.replace(/^\/+/, '')}`;
}

export const mapTrackDataToSong = (track: TrackData): Song => ({
  id: track.id,
  src: normalizeUrl(track.src) || '',   // chuẩn hóa URL nếu cần
  title: track.title === null ? undefined : track.title,
  artist: track.artist === null ? undefined : track.artist,
  cover: normalizeUrl(track.cover),
});
const PopularTrack: React.FC<SongProps> = ({ viewedUserId, currentUserId }) => {
  const [songs, setSongs] = useState<Song[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [editingSongId, setEditingSongId] = useState<number | null>(null);

  // Lấy top 5 bài hát từ API (luôn lấy chứ không phụ thuộc user)
  useEffect(() => {
    const fetchTracks = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const fetchedTracksData: TrackData[] = await getTop5TracksOfProfileAPI(viewedUserId);
        console.log("🧪 Top 5 track list:", fetchedTracksData);
        const fetchedSongs: Song[] = fetchedTracksData.map(mapTrackDataToSong);
        setSongs(fetchedSongs);
        console.log("[PopularTrack] Fetched tracks:", fetchedSongs);
      } catch (err: any) {
        console.error("[PopularTrack] Error fetching tracks:", err);
        setError("Không thể tải danh sách bài hát.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchTracks();
  }, []);

  // Khởi tạo waveform khi dữ liệu đã sẵn sàng
  useEffect(() => {
    if (!isLoading && !error) {
      const timer = setTimeout(() => {
        initWaveSurfer();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isLoading, error, songs]);

  // Nếu muốn xóa, bạn sẽ cần sửa hàm này hoặc có thể bỏ nếu không cần xóa trong top 5
  const handleDeleteTrack = async (songId: number) => {
    const confirmDelete = window.confirm("Bạn có chắc muốn xoá bài nhạc này không?");
    if (!confirmDelete) return;
    // Xử lý xóa thực tế nếu cần...
    alert("Tính năng xóa chỉ có tác dụng khi dùng API getMyUploadedTracksAPI hoặc getPublicTracksOfUserAPI.");
  };

  return (
    <div className="content popular">
      {isLoading && <p>Đang tải danh sách bài hát phổ biến...</p>}
      {error && <p style={{ color: 'red' }}>Lỗi: {error}</p>}

      {!isLoading && !error && songs.length === 0 && (
        <p>Chưa có bài hát nào.</p>
      )}

      {!isLoading && !error && songs.length > 0 && (
        songs.map((song) => (
          <div
            key={song.id}
            className="song"
            data-id={song.id}
            data-src={song.src}
            data-title={song.title || ''}
            data-artist={song.artist || ''}
            data-cover={song.cover || ''}
          >
            <div className="song_left">
              <img src={song.cover || '/assets/anhmau.png'} alt="Album Cover" className="album_cover" />
              <button className="play_button">
                <img src="/assets/play.png" alt="Play" />
              </button>
            </div>
            <div className="song_info">
              <p className="song_title">{song.title || 'Unknown Title'}</p>
              <p className="artist">{song.artist || 'Unknown Artist'}</p>
              <div className="audio"></div>
              {/* Nếu muốn có option chỉnh sửa/xóa, để nguyên, không thì có thể bỏ */}
              <SongOptionOfUser
                onEdit={() => setEditingSongId(Number(song.id))}
                onDelete={() => handleDeleteTrack(Number(song.id))}
                trackId={Number(song.id)}
                isOwner={false} // Top 5 bài này có thể không phải của user
              />
            </div>
            {editingSongId === Number(song.id) && (
              <UpdateSongBasicInfo
                trackId={song.id}
                onCancel={() => setEditingSongId(null)}
                onSaveSuccess={async () => {
                  setEditingSongId(null);
                  // Có thể reload lại list nếu muốn cập nhật thông tin bài hát đã chỉnh sửa
                  try {
                    const updatedTracks = await getTop5TracksOfProfileAPI(viewedUserId);
                    const mappedSongs = updatedTracks.map(mapTrackDataToSong);
                    setSongs(mappedSongs);
                  } catch (err) {
                    console.error("Lỗi khi reload danh sách bài hát:", err);
                  }
                }}
              />
            )}
          </div>
        ))
      )}
    </div>
  );
};

export default PopularTrack;
