// src/components/Section.tsx
import { usePlayer } from "../context/PlayerContext";
import bacphan from "/Users/dangkhoii/Documents/Graptify/frontend/src/assets/BacPhanRapVersion-TuiHat-6184759.mp3";
import banhmikhong from "/Users/dangkhoii/Documents/Graptify/frontend/src/assets/Bánh Mì Không.mp3";
import codangdeyeuthuong from "/Users/dangkhoii/Documents/Graptify/frontend/src/assets/CoDangDeYeuThuong-DucAnhDuUyen-35764062.mp3";
import img1 from "../assets/bacphan.jpg";
import img2 from "../assets/banhmikhong.jpg";
import img3 from "../assets/anhmau.png";
import "../styles/Section.css";

const songs = [
  { title: "Bạc phận", artist: "Jack", image: img1, audio: bacphan },
  { title: "Bánh mì không", artist: "Đạt G", image: img2, audio: banhmikhong },
  { title: "Có đáng để yêu thương", artist: "Du Uyên", image: img3, audio: codangdeyeuthuong },
];

const Section = () => {
  const { setPlaylist, setCurrentIndex } = usePlayer();

  const handleClick = (index: number) => {
    setPlaylist(songs);
    setCurrentIndex(index);
  };

  return (
    <section className="song_side">
      <h1>Recommended for today</h1>
      <div className="song-list">
        {songs.map((song, index) => (
          <button key={index} className="song-item" onClick={() => handleClick(index)}>
            <img src={song.image} alt={song.title} />
            <p className="title">{song.title}</p>
            <p className="artist">{song.artist}</p>
          </button>
        ))}
      </div>
      <h1>Recommended for today</h1>
      <h1>Recommended for today</h1>
      <h1>Recommended for today</h1>
      <h1>Recommended for today</h1>
      <h1>Recommended for today</h1>
      <h1>Recommended for today</h1>
    </section>
  );
};

export default Section;
