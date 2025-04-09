// ProfileStat.jsx
import React from "react";


const ProfileStat = () => {
  return (
    <div className="stats_container">
      <div className="stats_top">
        <span className="label">Follower</span>
        <span className="label">Following</span>
        <span className="label">Tracks</span>
      </div>
      <div className="divider"></div>
      <div className="stats_bottom">
        <span className="value">0</span>
        <span className="value">3</span>
        <span className="value">5</span>
      </div>
    </div>
  );
};

export default ProfileStat;
