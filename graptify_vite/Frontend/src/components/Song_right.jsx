import React from "react";

const songs_right = [
  {
    title: "Sóng Gió",
    artist: "Jack, K-ICM",
    playCount: 1000,
    likeCount: 2000,
    repostCount: 3000,
    cover: "assets/anhmau.png",
  },
  {
    title: "Sóng Gió",
    artist: "Jack, K-ICM",
    playCount: 1000,
    likeCount: 2000,
    repostCount: 3000,
    cover: "assets/anhmau.png",
  },
  {
    title: "Sóng Gió",
    artist: "Jack, K-ICM",
    playCount: 1000,
    likeCount: 2000,
    repostCount: 3000,
    cover: "assets/anhmau.png",
  },
];

const SongRight = () => {
  return (
    <div className="right_section">
      <div className="top_right_bottom">
        <div className="top_right_bottom_left">
          <div className="Like_profile">
            <span>4 Likes</span>
          </div>
        </div>
        <div className="top_right_bottom_right">
          <div className="view_profile">
            <span>View all</span>
          </div>
        </div>
        <div className="divider1"></div>
      </div>

      <div className="mid_right_bottom">
        {songs_right.map((song, index) => (
          <div className="song_right" key={index}>
            <img src={song.cover} alt="Album Cover" className="album_cover_right" />
            <div className="song_info_right">
              <p className="song_title_right">{song.title}</p>
              <p className="artist_right">{song.artist}</p>
              <div className="share">
                <span className="count_play">
                  <img src="assets/play.png" alt="play" />
                </span>
                <span className="count_play_show">{song.playCount}</span>
                <span className="count_tym">
                  <img src="assets/Heart_Fill_XS.png" alt="tym" />
                </span>
                <span className="count_tym_show">{song.likeCount}</span>
                <span className="count_repost">
                  <img src="assets/Regroup.png" alt="repost" />
                </span>
                <span className="count_repost_show">{song.repostCount}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bottom_right_bottom"></div>
    </div>
  );
};

export default SongRight;
