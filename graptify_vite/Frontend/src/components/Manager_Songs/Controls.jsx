import React from "react";
import  useSongManager  from "../../js/Manager_song_play_pause";

const Controls = () => {
  const { audioRef, songUrl, isPlaying, togglePlay } = useSongManager();

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
