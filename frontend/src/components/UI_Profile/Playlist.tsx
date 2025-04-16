import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import handlePlayTrack, { initFirstWaveforms } from "../../hooks/Manager_Playlist";
import { playlists } from "../../components/Manager_Playlists/ManagerDataPlaylist";

const Playlist: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    setTimeout(() => {
      initFirstWaveforms();
    }, 300);
  }, []);

  return (
    <div className="content playlist">
      {playlists.map((playlist, index) => (
        <div
          className="player-container"
          key={index}
          data-playlist={JSON.stringify(playlist)}
        >
          <div className="track-info">
            <div className="album-art">
              <img
                src={playlist.cover}
                alt={`Cover of ${playlist.title}`}
                className="playlist-cover"
              />
            </div>

            <div className="track-details">
              <div className="artist-info">
                <span className="artist-name">{playlist.artist}</span>
                <span className="time-ago">{playlist.timeAgo}</span>
              </div>

              {/* ✅ Bấm vào tiêu đề sẽ điều hướng */}
              <h2
                className="track-title clickable"
                onClick={() => navigate(`/ManagerPlaylistLayout/${playlist.id}`)}
                style={{ cursor: "pointer", color: "#1db954" }} // Tuỳ chỉnh style
              >
                {playlist.title}
              </h2>

              <div className="waveform">
                <div className="audio-playlist"></div>
              </div>

              <div className="track-list">
                {playlist.tracks.map((track, i) => (
                  <div
                    className="track-item"
                    data-src={track.src}
                    data-title={track.title}
                    data-artist={track.artist}
                    data-cover={track.cover}
                    key={i}
                    onClick={handlePlayTrack}
                  >
                    <div className="track-number">{i + 1}</div>
                    <div className="track-content">
                      <div className="track-text">
                        <span>{track.title}</span>
                      </div>
                    </div>
                  </div>
                ))}

                <div className="view-more">
                  <span>View {playlist.tracks.length} tracks</span>
                </div>
              </div>
            </div>
          </div>

          <div className="action-buttons">
            <button className="btn-like">
              <i className="far fa-heart"></i> 12
            </button>
            <button className="btn-repost">
              <i className="fas fa-retweet"></i> 1
            </button>
            <button className="btn-share">
              <i className="fas fa-share-alt"></i> Share
            </button>
            <button className="btn-copy-link">
              <i className="fas fa-link"></i> Copy Link
            </button>
            <button className="btn-next-up">
              <i className="fas fa-list"></i> Add to Next up
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Playlist;
