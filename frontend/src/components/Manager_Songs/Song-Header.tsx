import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
// Bỏ useLocation nếu không còn dùng location.state để lấy currentSong nữa
// import { useLocation } from "react-router-dom"; 
import useImageColor from "../../hooks/useImageColor"; // Đảm bảo hook này tồn tại và đúng đường dẫn

// Import API service và kiểu dữ liệu TrackData
// Giả sử getTrackByIdAPI trả về TrackData, và TrackData có các trường cần thiết
import { getTrackByIdAPI, TrackData } from "../../services/trackServiceAPI"; // Điều chỉnh đường dẫn nếu cần

// Định nghĩa cấu trúc dữ liệu cho một bài hát (có thể giữ nguyên hoặc điều chỉnh)
interface Song {
  id: string | number; // Thêm ID để có thể dùng cho key hoặc các mục đích khác
  title: string;
  artist: string;
  cover: string;
  src: string; // Giữ lại nếu bạn vẫn dùng cho localStorage
  uploaderId?: string | number;
  year?: number | string;
  durationText?: string; // Ví dụ: "4:40"
  playCount?: string;    // Ví dụ: "1,344,940"
}

interface SongHeaderProps {
  onColorExtract?: (color: string) => void;
  currentTrackId?: string | number | null; // Nhận currentTrackId từ ManagerSongSection
}

const SongHeader: React.FC<SongHeaderProps> = ({ onColorExtract, currentTrackId }) => {
  // const location = useLocation(); // Không cần nếu không dùng location.state nữa
  const navigate = useNavigate();

  
  // State để lưu thông tin bài hát sẽ hiển thị
  const [displayedSong, setDisplayedSong] = useState<Song | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  // useEffect để fetch thông tin bài hát khi currentTrackId thay đổi
  useEffect(() => {
    if (currentTrackId) {
      const fetchSongDetails = async () => {
        setIsLoading(true);
        setError(null);
        try {
          const trackData: TrackData | null = await getTrackByIdAPI(currentTrackId);
          if (trackData) {
            // Ánh xạ TrackData sang interface Song của SongHeader
            // Bạn cần đảm bảo TrackData có đủ các trường cần thiết
            const songToDisplay: Song = {
              id: trackData.id,
              title: trackData.title || "Unknown Title",
              artist: trackData.artist || "Unknown Artist",
              cover: trackData.cover || "/assets/default_song_cover.png", // Cung cấp ảnh bìa mặc định
              src: trackData.src || "",
              uploaderId: trackData.uploaderId,
              // Ví dụ lấy thêm các trường khác nếu có trong TrackData (sau khi map từ Metadatum)
              // year: trackData.year, 
              // durationText: formatDuration(trackData.duration_ms), // Cần hàm formatDuration
              // playCount: formatPlayCount(trackData.playCount), // Cần hàm formatPlayCount
            };
            setDisplayedSong(songToDisplay);
          } else {
            setError("Không tìm thấy thông tin bài hát.");
            setDisplayedSong(null);
          }
        } catch (err) {
          console.error("Lỗi khi lấy thông tin bài hát cho SongHeader:", err);
          setError("Lỗi tải thông tin bài hát.");
          setDisplayedSong(null);
        } finally {
          setIsLoading(false);
        }
      };
      fetchSongDetails();
    } else {
      // Nếu không có currentTrackId, reset displayedSong
      setDisplayedSong(null);
      setIsLoading(false);
      setError(null);
    }
  }, [currentTrackId]); // Chạy lại khi currentTrackId thay đổi

  // Logic lấy màu nền dựa trên displayedSong.cover
  const bgColor = useImageColor(displayedSong?.cover || null);

  useEffect(() => {
    // Logic lưu vào localStorage và dispatch event vẫn dựa trên displayedSong
    if (displayedSong?.src) {
      localStorage.setItem("currentSongSrc", displayedSong.src); // Đổi key để tránh xung đột nếu cần
      window.dispatchEvent(new Event("storage")); // Event này có thể cần được lắng nghe ở đâu đó
    }
  }, [displayedSong]);

  useEffect(() => {
    if (bgColor && onColorExtract) {
      onColorExtract(bgColor);
    }
  }, [bgColor, onColorExtract]);

  if (isLoading) {
    return <div className="song-header">Đang tải thông tin bài hát...</div>;
  }

  if (error) {
    return <div className="song-header" style={{ color: 'red' }}>{error}</div>;
  }

  // Hiển thị thông báo nếu không có bài hát nào (khi currentTrackId là null hoặc fetch thất bại)
  if (!displayedSong) {
    return <div className="song-header">Vui lòng chọn một bài hát.</div>;
  }

  // Render thông tin bài hát từ displayedSong
  return (
    <div className="song-header">
      <img src={displayedSong.cover} alt={displayedSong.title} className="song-image" />
      <div className="song-details">
        <div className="song-type">Bài hát</div>
        <h1 className="song-title-track">{displayedSong.title}</h1>
        <div className="song-meta">
          <img src={displayedSong.cover} alt={displayedSong.artist} className="artist-image" />
          <span
            style={{ cursor: "pointer", color: "#1DB954", fontWeight: 500 }}
            onClick={() => {
              if (displayedSong.uploaderId) {
                navigate(`/profile/${displayedSong.uploaderId}`);
              }
            }}
          >
            {displayedSong.artist}
          </span>
          <span className="dot-separator">•</span>
          {/* Hiển thị title một lần nữa ở đây có vẻ thừa, có thể thay bằng năm hoặc thông tin khác */}
          <span>{displayedSong.title}</span> 
          {displayedSong.year && ( // Ví dụ hiển thị năm nếu có
            <>
              <span className="dot-separator">•</span>
              <span>{displayedSong.year}</span>
            </>
          )}
          {displayedSong.durationText && ( // Ví dụ hiển thị thời lượng nếu có
            <>
              <span className="dot-separator">•</span>
              <span>{displayedSong.durationText}</span>
            </>
          )}
          {displayedSong.playCount && ( // Ví dụ hiển thị lượt nghe nếu có
            <>
              <span className="dot-separator">•</span>
              <span>{displayedSong.playCount}</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default SongHeader;
