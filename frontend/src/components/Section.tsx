import { useNavigate } from "react-router-dom";
import GlobalAudioManager from "../hooks/GlobalAudioManager";
import bacphan from "../assets/BacPhanRapVersion-TuiHat-6184759.mp3";
import banhmikhong from "../assets/Bánh Mì Không.mp3";
import codangdeyeuthuong from "../assets/CoDangDeYeuThuong-DucAnhDuUyen-35764062.mp3";
import img1 from "../assets/bacphan.jpg";
import img2 from "../assets/banhmikhong.jpg";
import img3 from "../assets/anhmau.png";
import "../styles/Section.css";

const songs = [
  {
    id: 1,
    title: "Bạc phận",
    artist: "Jack",
    cover: img1,
    src: bacphan,
  },
  {
    id: 2,
    title: "Bánh mì không",
    artist: "Đạt G",
    cover: img2,
    src: banhmikhong,
  },
  {
    id: 3,
    title: "Có đáng để yêu thương",
    artist: "Du Uyên",
    cover: img3,
    src: codangdeyeuthuong,
  },
  {
    id: 3,
    title: "Quá Lâu",
    artist: "Vinh Khuất",
    cover: "/assets/qualau.png",
    src: "/assets/QuaLau.mp3",
  },
  
];

const Section = () => {
  const navigate = useNavigate();

  const handleClick = (index: number) => {
    const song = songs[index];

    // ✅ Cập nhật GlobalAudioManager
    GlobalAudioManager.setPlaylist(songs, index);
    GlobalAudioManager.playSongAt(index);

    // ✅ Điều hướng sang ManagerSong, truyền toàn bộ thông tin
    navigate("/ManagerSong", {
      state: {
        songs,
        currentIndex: index,
        currentSong: song,
      },
    });
  };

  return (
    <section className="song_side">
      <h1>Recommended for today</h1>
      <div className="song-list">
      {songs.map((song, index) => (
        <button key={song.id} className="song-item" onClick={() => handleClick(index)}>
          <img src={song.cover} alt={song.title} />
          <p className="title">{song.title}</p>
          <p className="artist">{song.artist}</p>
        </button>
      ))}
      </div>
    </section>
  );
};

export default Section;
