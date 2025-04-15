import React from "react";

interface ProfileStatProps {}

const ProfileStat: React.FC<ProfileStatProps> = () => {
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