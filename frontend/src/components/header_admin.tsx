import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/admin.css";

type ProfileData = {
  name: string;
  birthYear: string;
  address: string;
  phone: string;
  email: string;
  username: string;
  password: string;
  confirmPassword: string;
  avatar?: string;
};

const Header_admin: React.FC = () => {
  const [profile, setProfile] = useState<ProfileData>({
    name: "",
    birthYear: "",
    address: "",
    phone: "",
    email: "",
    username: "",
    password: "",
    confirmPassword: "",
    avatar: "",
  });
  const [userId, setUserId] = useState<number | null>(null);
  const [editingField, setEditingField] = useState<keyof ProfileData | "">("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [passwordError, setPasswordError] = useState<string>("");
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  const formatBirth = (iso: string) => {
    const d = new Date(iso);
    return `${d.getDate()}-${d.getMonth() + 1}-${d.getFullYear()}`;
  };

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch("http://localhost:8080/api/users/me", {
          method: "GET",
          credentials: "include",
        });
        const json = await res.json();

        if (json.data) {
          const data = json.data;
          setUserId(data.id);
          setProfile({
            name: data.Name || "",
            birthYear: data.Birthday ? formatBirth(data.Birthday) : "",
            address: data.Address || "",
            phone: data.PhoneNumber || "",
            email: data.email || "",
            username: data.userName || "",
            password: "",
            confirmPassword: "",
            avatar: data.Avatar || "",
          });
        } else {
          console.error("Lỗi: Không có dữ liệu người dùng trong phản hồi", json);
        }
      } catch (err) {
        console.error("Lỗi fetchProfile:", err);
      }
    };
    fetchProfile();
  }, []);

  const handleSave = async () => {
    if (profile.password || profile.confirmPassword) {
      if (profile.password !== profile.confirmPassword) {
        setPasswordError("Mật khẩu xác nhận không khớp");
        return;
      }
    }

    if (userId === null) return;
    try {
      setPasswordError("");
      const [day, month, year] = profile.birthYear.split("-");
      const isoBirthday = profile.birthYear
        ? new Date(+year, +month - 1, +day).toISOString()
        : undefined;

      const payload: any = {
        userName: profile.username,
        email: profile.email,
        Name: profile.name,
        Birthday: isoBirthday,
        Address: profile.address,
        PhoneNumber: profile.phone,
      };
      if (profile.password) {
        payload.password = profile.password;
      }

      const res = await fetch(`http://localhost:8080/api/users/${userId}`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (res.ok) {
        setModalOpen(false);
      } else {
        console.error("Update failed:", json);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const toggleDropdown = () => setDropdownOpen((o) => !o);
  const openProfileModal = () => {
    setDropdownOpen(false);
    setModalOpen(true);
  };
  const handleLogout = () => navigate("/login");
  const startEditing = (field: keyof ProfileData) => setEditingField(field);
  const finishEditing = () => setEditingField("");
  const onChangeField = (field: keyof ProfileData, value: string) => {
    setProfile((p) => ({ ...p, [field]: value }));
    if ((field === "password" || field === "confirmPassword") && passwordError) {
      setPasswordError("");
    }
  };

  const renderRow = (
    label: string,
    field: keyof ProfileData,
    type: React.HTMLInputTypeAttribute = "text"
  ) => (
    <div className="profile_row_admin" key={field}>
      <span className="profile_label_admin">{label}</span>
      {editingField === field ? (
        <input
          autoFocus
          className="profile_input_admin"
          type={type}
          value={profile[field]}
          onChange={(e) => onChangeField(field, e.target.value)}
          onBlur={finishEditing}
          onKeyDown={(e) => e.key === "Enter" && finishEditing()}
        />
      ) : (
        <span className="profile_value_admin">
          {field === "password" || field === "confirmPassword"
            ? "••••••••••"
            : profile[field]}
        </span>
      )}
      <button className="icon_edit_admin" onClick={() => startEditing(field)}>
        ✎
      </button>
    </div>
  );

  return (
    <>
      <header className="header_admin">
        <div className="logo_admin">
          <span className="logo_icon_admin">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" fill="#3498db" />
              <text x="12" y="16" textAnchor="middle" fill="white" fontSize="12">
                G
              </text>
            </svg>
          </span>
          <span className="logo_text_admin">Graptify Admin</span>
        </div>
        <div className="header_actions_admin">
          <div className="user_profile_admin">
            <img
              src={
                profile.avatar
                  ? `http://localhost:8080${profile.avatar}`
                  : "/placeholder.svg"
              }
              alt="avatar"
              className="user_avatar_admin"
            />
          </div>
          <div className="settings_wrapper_admin" ref={dropdownRef}>
            <button onClick={toggleDropdown} className="settings_button_admin">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="3"></circle>
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33A1.65 1.65 0 0 0 14 19.4V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4c-.49.2-1.04.1-1.43-.29l-.06-.06a2 2 0 0 1 0-2.83l.06-.06c.39-.39.49-.94.29-1.43A1.65 1.65 0 0 0 9 14h.09A1.65 1.65 0 0 0 9.6 9.6 1.65 1.65 0 0 0 8.27 7.8l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06c.39.39.94.49 1.43.29A1.65 1.65 0 0 0 14 4h.09A1.65 1.65 0 0 0 15.6 4.6 1.65 1.65 0 0 0 17.8 8.27l.06.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 14 1.65 1.65 0 0 0 19 15.6V15z"/>
              </svg>
            </button>
            {dropdownOpen && (
              <ul className="settings_dropdown_admin">
                <li className="settings_dropdown_item_admin" onClick={openProfileModal}>
                  Hồ sơ
                </li>
                <li className="settings_dropdown_item_admin" onClick={handleLogout}>
                  Đăng xuất
                </li>
              </ul>
            )}
          </div>
        </div>
      </header>

      {/* MODAL */}
      {modalOpen && (
        <div className="modal_overlay_admin">
          <div className="modal_content_edit_profile">
            <button className="modal_close_admin" onClick={() => setModalOpen(false)}>
              &times;
            </button>
            <h5>Profile</h5>
            <div className="modal_body_admin">
              <div className="profile_left_admin">
                <img
                  src={
                    profile.avatar
                      ? `http://localhost:8080${profile.avatar}`
                      : "/placeholder.svg"
                  }
                  alt="Profile"
                  className="profile_image_admin"
                />
                <button className="btn_change_avatar_admin">CHANGE</button>
              </div>
              <div className="profile_right_admin">
                {renderRow("Name", "name")}
                {renderRow("Birthday", "birthYear")}
                {renderRow("Address", "address")}
                {renderRow("PhoneNumber", "phone", "tel")}
                {renderRow("Email", "email", "email")}
                {renderRow("Username", "username")}
                {renderRow("Change new password", "password", "password")}
                {renderRow("Confirm new password", "confirmPassword", "password")}
                {passwordError && <div className="error_text_admin">{passwordError}</div>}
              </div>
            </div>
            <div className="modal_footer_admin">
              <button className="btn_save_admin" onClick={handleSave} disabled={!!passwordError}>
                SAVE
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Header_admin;