import React from "react";

interface ProfileSlideProps {}

const ProfileSlide: React.FC<ProfileSlideProps> = () => {
  return (
    <div className="top_section">
      <div className="avatar">
        <img src="assets/User_alt@3x.png" alt="avatar" />
      </div>
      <div className="profile_info">
        <span>Hồ Sơ</span>
        <h1>Hưng Nguyễn</h1>
      </div>
    </div>
  );
};

export default ProfileSlide;