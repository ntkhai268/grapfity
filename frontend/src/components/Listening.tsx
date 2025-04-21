import React, { useState } from "react";
import "../styles/Recent_LnU.css"; // Import file CSS

const Recent_LnU = () => {
  const [Recent_LnUTracks] = useState([
    { title: "Song 1", artist: "Artist 1" },
    { title: "Song 2", artist: "Artist 2" },
    { title: "Song 3", artist: "Artist 3" },
    { title: "Song 2", artist: "Artist 2" },
    { title: "Song 3", artist: "Artist 3" },
  ]);

  return (
    <div className="Recent_LnU">
      <h1>Listening</h1>
      <h2>Recently Played</h2>
      <div className="Recent_LnU-tracks">
        {Recent_LnUTracks.map((track_LnU, index) => (
          <div key={index} className="track_LnU">
            <div className="track_LnU-image">
              {/* Placeholder for track image */}
            </div>
            <div className="track_LnU-info">
              <span>{track_LnU.title}</span>
              <span>{track_LnU.artist}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Recent_LnU;
  