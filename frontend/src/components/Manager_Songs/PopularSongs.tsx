import React from "react";

// Định nghĩa cấu trúc dữ liệu cho một bài hát
interface ISong {
    src: string;           // Đường dẫn file nhạc
    number: number;
    cover: string;         // Đổi từ image → cover
    title: string;
    stats: string;
    duration: string;
}

// Định nghĩa component với kiểu React.FC
const PopularSongs: React.FC = () => {
  // Định kiểu rõ ràng cho mảng songs sử dụng interface ISong
  const songs: ISong[] = [
    {
      src: "assets/BacPhanRapVersion-TuiHat-6184759.mp3",
      number: 1,
      cover: "assets/anhmau.png",
      title: "Bạc Phận",
      stats: "2,767,771",
      duration: "4:09"
    },
    {
      src: "assets/SaoEmVoTinh.mp3",
      number: 2,
      cover: "assets/anhmau.png",
      title: "Sao Em Vô Tình",
      stats: "2,261,921",
      duration: "5:35"
    },
    {
      src: "assets/AiMangCoDonDi.mp3",
      number: 3,
      cover: "assets/anhmau.png",
      title: "Ai Mang Cô Đơn Đi",
      stats: "3,863,396",
      duration: "3:41"
    }
  ];
  

  return (
    // JSX không thay đổi
    <div className="popular-songs">
      <h2>Các bản nhạc thịnh hành của</h2>
      <h2>ICM</h2>
      <div className="song-list-manager">
        {/* TypeScript sẽ tự suy luận kiểu cho 'song' (là ISong) và 'index' (là number) 
            từ kiểu của mảng 'songs' */}
        {songs.map((song, index) => (
          <div className="song-item-manager" key={index}> 
            <div className="song-number">{song.number}</div>
            <img src={song.cover} alt={song.title} className="rec-song-image" />
            <div className="rec-song-info">
              <div className="rec-song-title">{song.title}</div>
            </div>
            <div className="song-stats">{song.stats}</div>
            <div className="song-duration">{song.duration}</div>
            {/* Nút phát nhạc */}
            <button onClick={() => new Audio(song.src).play()}>Phát</button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PopularSongs;