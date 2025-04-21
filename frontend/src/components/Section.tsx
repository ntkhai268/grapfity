// src/components/Section.tsx
import React, { useEffect, useState } from "react";
import { usePlayer } from "../context/PlayerContext";
import { fetchSongs } from "../services/songAPI";
import "../styles/Section.css";

type Song = {
  title: string;
  artist: string;
  image: string;
  audio: string;
};

const Section = () => {
  const [songs, setSongs] = useState<Song[]>([]);
  const { setPlaylist, setCurrentIndex } = usePlayer();

  useEffect(() => {
    const loadSongs = async () => {
      const data = await fetchSongs();
      setSongs(data as Song[]);
    };
    loadSongs();
  }, []);

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
    </section>
  );
};

export default Section;
