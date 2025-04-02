import React, { useState, useEffect, useRef } from "react";

const Controls = () => {
  const [songUrl, setSongUrl] = useState(localStorage.getItem("currentSong") || "");
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef(null);

  useEffect(() => {
    const handleStorageChange = () => {
      const newSong = localStorage.getItem("currentSong") || "";
      setSongUrl(newSong);
      if (audioRef.current && newSong) {
        audioRef.current.load();
        
        setIsPlaying(false);
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  return (
    <div className="controls">
      <audio ref={audioRef} src={songUrl} />

      <div className="play-button" onClick={togglePlay}>
        <i className={isPlaying ? "fas fa-pause" : "fas fa-play"} style={{ color: "black" }}></i>
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
