import React from "react";

const recommendations = [
  {
    id: 1,
    image: "assets/anhmau.png",
    title: "Chạm Khẽ Tim Anh Một Chút Thôi",
    artist: "Nguyễn Phúc Hậu",
    stats: "1,457,523",
    duration: "5:43",
  },
  {
    id: 2,
    image: "assets/anhmau.png",
    title: "Chiếc Khăn Gió Ấm (feat. Quân A.P)",
    artist: "Biển Của Hy Vọng, Quân A.P",
    stats: "909,813",
    duration: "3:33",
  },
  {
    id: 3,
    image: "assets/anhmau.png",
    title: "Những Ngày Mưa",
    artist: "Lê Gia Bảo, BMZ",
    stats: "1,654,599",
    duration: "4:52",
  },
  {
    id: 4,
    image: "assets/anhmau.png",
    title: "Sao lâu không thấy em cười?",
    artist: "Phạm Nguyên Ngọc, BMZ",
    stats: "677,653",
    duration: "4:32",
  },
  {
    id: 5,
    image: "assets/anhmau.png",
    title: "Hơn Cả Mây Trời",
    artist: "VIỆT.",
    stats: "577,747",
    duration: "3:19",
  },
];

const Recommendations = () => {
  return (
    <div className="recommendations">
      <h2>Đề xuất</h2>
      <div className="song-list">
        {recommendations.map((song) => (
          <div key={song.id} className="song-item">
            <div className="song-number">{song.id}</div>
            <img src={song.image} alt={song.title} className="rec-song-image" />
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