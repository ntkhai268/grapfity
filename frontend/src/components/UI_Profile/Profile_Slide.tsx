import React, { useEffect, useState } from "react";
import { getMyProfile, UserData,updateUser } from "../../services/userService";
import EditProfileModal from "../UI_Profile/EditProfileModal";
import useImageColor from "../../hooks/useImageColor"; 
interface ProfileSlideProps {
  onColorExtract?: (color: string) => void;
}

const ProfileSlide: React.FC<ProfileSlideProps> = ({ onColorExtract }) =>{
  const [user, setUser] = useState<UserData | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const profile = await getMyProfile();
        setUser(profile);
      } catch (err) {
        console.error("Không thể tải thông tin người dùng:", err);
      }
    };
    fetchUser();
  }, []);
  const bgColor = useImageColor(user?.Avatar || null);
  useEffect(() => {
    if (bgColor && onColorExtract) {
      onColorExtract(bgColor);
    }
  }, [bgColor, onColorExtract]);
  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleSave = async (formData: FormData) => {
  try {
    await updateUser(formData); // 🛠 gọi API cập nhật user

    const updated = await getMyProfile();   // 🧠 lấy lại dữ liệu sau cập nhật
    setUser(updated);
    setIsModalOpen(false);
  } catch (err) {
    console.error("Lỗi cập nhật người dùng:", err);
    alert("Không thể cập nhật thông tin.");
  }
};




  return (
    <div className="top_section">
      <div className="avatar">
        <img
          src={user?.Avatar || "assets/User_alt@3x.png"} // fallback nếu chưa có ảnh
          alt="avatar"
           style={user?.Avatar ? {} : { width: 24, height: 24 }}
        />
      </div>
      <div className="profile_info">
        <span>Hồ Sơ</span>
        <h1>{user?.userName || "Đang tải..."}</h1>
        {/* nếu đăng nhập thì nút này mới hiện */}
        {user && (
          <div  className="button_wrapper">
            <button className="edit_button" aria-label="Chỉnh sửa hồ sơ"  onClick={handleOpenModal} >
            <svg
              viewBox="0 0 16 16"
              fill="currentColor"
              xmlns="http://www.w3.org/2000/svg"
              className="edit_icon"
            >
              <path d="M11.838.714a2.438 2.438 0 0 1 3.448 3.448l-9.841 9.841c-.358.358-.79.633-1.267.806l-3.173 1.146a.75.75 0 0 1-.96-.96l1.146-3.173c.173-.476.448-.909.806-1.267l9.84-9.84zm2.387 1.06a.938.938 0 0 0-1.327 0l-9.84 9.842a1.953 1.953 0 0 0-.456.716L2 14.002l1.669-.604a1.95 1.95 0 0 0 .716-.455l9.841-9.841a.938.938 0 0 0 0-1.327z"></path>
            </svg>
          </button>
          </div>
        )}
      </div>
       
      {/* Gọi modal */}
      {isModalOpen && user && (
        <EditProfileModal
          user={user}
          onClose={handleCloseModal}
          onSave={handleSave}
        />
      )}
    </div>
  );
};

export default ProfileSlide;
