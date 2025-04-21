import React from "react"; // Import useRef if useSongManager doesn't provide it directly typed
import useSongManager from "../../hooks/Manager_Song_Play"; // Giữ nguyên import, TS có thể import từ JS

// (Tuỳ chọn nhưng khuyến nghị) Định nghĩa kiểu dữ liệu trả về của hook useSongManager
// Nếu file hook cũng được chuyển sang TS, bạn nên export kiểu này từ đó.
interface ISongManagerOutput {
  // Giả sử audioRef được trả về từ hook và có kiểu này
  // Nếu bạn tạo ref trong component này, hãy dùng useRef<HTMLAudioElement>(null)
  audioRef: React.RefObject<HTMLAudioElement | null> ; 
  songUrl: string | undefined; // Có thể là string hoặc undefined nếu chưa có bài hát
  isPlaying: boolean;
  togglePlay: () => void; // Hàm không nhận tham số và không trả về gì
}

// Định nghĩa component với kiểu React.FC (Functional Component)
const Controls: React.FC = () => {
  // Áp kiểu cho dữ liệu trả về từ hook
  const { audioRef, songUrl, isPlaying, togglePlay }: ISongManagerOutput = useSongManager();

  return (
    // Không cần thay đổi JSX structure
    <div className="controls">
      {/* Thẻ audio vẫn giữ nguyên, ref và src đã được định kiểu thông qua hook */}
      <audio ref={audioRef} src={songUrl} />

      <div className="play-button" onClick={togglePlay}>
        {/* Sử dụng isPlaying để chọn class icon */}
        <i 
          className={isPlaying ? "fas fa-pause" : "fas fa-play"} 
          style={{ color: "black" }}
        ></i>
      </div>
      <div className="control-icon">
        <i className="far fa-heart" style={{ color: "white" }}></i>
      </div>
      <div className="control-icon">
        <i className="fas fa-arrow-down" style={{ color: "white" }}></i>
      </div>
      <div className="control-icon">
        <i className="fas fa-ellipsis-h" style={{ color: "white" }}></i>
        <div className="dropdown">
          <div className="dropdown-content">
            {/* Các thẻ a giữ nguyên */}
            <a href="#">Like</a>
            <a href="#">Add To Playlist</a>
            <a href="#">Delete Track</a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Controls;