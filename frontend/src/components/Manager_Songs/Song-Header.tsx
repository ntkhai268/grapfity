import React, { useEffect } from "react";

// Định nghĩa component với kiểu React.FC
const SongHeader: React.FC = () => {
  // Định kiểu rõ ràng cho biến songUrl là string
  const songUrl: string = "assets/SuNghiepChuong.mp3"; // Thay bằng URL bài hát thật

  // useEffect không cần thay đổi về kiểu trong trường hợp này
  useEffect(() => {
    // localStorage và window là các đối tượng global, TypeScript nhận biết được
    localStorage.setItem("currentSong", songUrl);
    window.dispatchEvent(new Event("storage")); // Gửi sự kiện để thông báo cho Controls
  }, []); // Mảng dependency rỗng đảm bảo effect chỉ chạy một lần khi mount

  return (
    // JSX không thay đổi
    <div className="song-header">
      <img src="assets/anhmau.png" alt="Hoa Vô Sắc" className="song-image" />
      <div className="song-details">
        <div className="song-type">Bài hát</div>
        <h1 className="song-title-track">Hoa Vô Sắc</h1>
        <div className="song-meta">
          <img src="assets/anhmau.png" alt="ICM" className="artist-image" />
          <span>ICM</span>
          <span className="dot-separator">•</span>
          <span>Hoa Vô Sắc</span>
          <span className="dot-separator">•</span>
          <span>2023</span>
          <span className="dot-separator">•</span>
          <span>4:40</span>
          <span className="dot-separator">•</span>
          <span>1,344,940</span>
        </div>
      </div>
    </div>
  );
};

export default SongHeader;