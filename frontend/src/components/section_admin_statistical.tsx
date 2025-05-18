import { useState } from "react";
import { Edit2 } from "lucide-react";
// npm install lucide-react
import "../styles/admin.css";

type UserFields = {
  name: string;
  birthYear: string;
  address: string;
  phone: string;
  gmail: string;
  username: string;
  password: string;
  confirmPassword: string;
};

type EditingFields = Record<keyof UserFields, boolean>;

export default function UserProfile() {
  const [user, setUser] = useState<UserFields>({
    name: "Liza Doe",
    birthYear: "1990",
    address: "Hanoi, Vietnam",
    phone: "+84 123 456 789",
    gmail: "support@gmail.com",
    username: "dangkjhu",
    password: "••••••••••",
    confirmPassword: "••••••••••",
  });

  const [isEditing, setIsEditing] = useState<EditingFields>({
    name: false,
    birthYear: false,
    address: false,
    phone: false,
    gmail: false,
    username: false,
    password: false,
    confirmPassword: false,
  });

  const handleChange = (field: keyof UserFields, value: string) => {
    setUser((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const toggleEdit = (field: keyof EditingFields) => {
    setIsEditing((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  const handleSave = () => {
    console.log("Saving user data:", user);
    // Gửi lên backend ở đây...
  };

  const renderField = (
    label: string,
    field: keyof UserFields,
    type: React.HTMLInputTypeAttribute = "text"
  ) => (
    <div className="profile-field">
      <div className="field-label">{label}</div>
      {isEditing[field] ? (
        <input
          type={type}
          value={user[field]}
          onChange={(e) => handleChange(field, e.target.value)}
          onBlur={() => toggleEdit(field)}
          className="field-input-admin"
          autoFocus
        />
      ) : (
        <div className="field-value">{user[field] || "—"}</div>
      )}
      <div className="field-icon edit" onClick={() => toggleEdit(field)}>
        <Edit2 className="edit-icon" />
      </div>
    </div>
  );

  return (
    <div className="profile-container">
      <div className="profile-content">
        <div className="profile-left">
          <div className="profile-image">
            <img
              src="/placeholder.svg?height=200&width=200"
              alt="Profile"
            />
          </div>
          <button className="change-button">CHANGE</button>
        </div>

        <div className="profile-right">
          {renderField("TÊN", "name")}
          {renderField("NĂM SINH", "birthYear", "number")}
          {renderField("ĐỊA CHỈ", "address")}
          {renderField("SỐ ĐIỆN THOẠI", "phone", "tel")}
          {renderField("GMAIL", "gmail", "email")}
          {renderField("TÀI KHOẢN", "username")}
          {renderField("MẬT KHẨU", "password", "password")}
          {renderField(
            "XÁC NHẬN MẬT KHẨU",
            "confirmPassword",
            "password"
          )}

          <button className="save-button" onClick={handleSave}>
            SAVE
          </button>
        </div>
      </div>
    </div>
  );
}
