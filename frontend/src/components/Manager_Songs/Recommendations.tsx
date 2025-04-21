import React from "react";
import { useNavigate } from "react-router-dom";
import GlobalAudioManager from "../../hooks/GlobalAudioManager";

// Định nghĩa cấu trúc dữ liệu cho một mục đề xuất (bài hát)
interface IRecommendation {
  id: number;
  src: string;
  cover: string;
  title: string;
  artist: string;
  stats: string;
  duration: string;
}

const Recommendations: React.FC = () => {
  const navigate = useNavigate();

  const recommendations: IRecommendation[] = [
    {
      id: 1,
      src: "/assets/ChamKheTimAnh.mp3",
      cover: "assets/anhmau.png",
      title: "Chạm Khẽ Tim Anh Một Chút Thôi",
      artist: "Nguyễn Phúc Hậu",
      stats: "1,457,523",
      duration: "5:43",
    },
    {
      id: 2,
      src: "assets/ChiecKhanGioAm.mp3",
      cover: "assets/anhmau.png",
      title: "Chiếc Khăn Gió Ấm (feat. Quân A.P)",
      artist: "Biển Của Hy Vọng, Quân A.P",
      stats: "909,813",
      duration: "3:33",
    },
    {
      id: 3,
      src: "/assets/MyEverything.mp3",
      cover: "assets/anhmau.png",
      title: " My Everything",
      artist: "Tiên Tiên",
      stats: "1,654,599",
      duration: "4:52",
    },
    {
      id: 4,
      src: "assets/HonCaMayTroi.mp3",
      cover: "assets/anhmau.png",
      title: "Hơn Cả Mây Trời",
      artist: "VIỆT.",
      stats: "577,747",
      duration: "3:19",
    },
  ];

  const handleClick = (index: number) => {
    
    const song = recommendations[index];

    // ✅ Phát nhạc qua GlobalAudioManager
    GlobalAudioManager.setPlaylist(recommendations, index);
    GlobalAudioManager.playSongAt(index);

    // ✅ Điều hướng đến trang ManagerSong nếu cần
    console.log("Navigating to /ManagerSong...");
    navigate("/ManagerSong", {
      state: {
        songs: recommendations,
        currentIndex: index,
        currentSong: song,
      },
    });
  };
  

  return (
    <div className="recommendations">
      <h2>Đề xuất</h2>
      <div className="song-list-manager">
        {recommendations.map((song, index) => (
          <div
            key={song.id}
            className="song-item-manager"
            onClick={() => handleClick(index)}
          >
            <div className="song-number">{song.id}</div>
            <img src={song.cover} alt={song.title} className="rec-song-image" />
            <div className="rec-song-info">
              <div className="rec-song-title">{song.title}</div>
              <div className="rec-song-artist">{song.artist}</div>
            </div>
            <div className="song-stats">{song.stats}</div>
            <div className="song-duration">{song.duration}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Recommendations;
