import React, { useState, useEffect, useRef, ChangeEvent, FormEvent } from 'react';
import { UserType } from '../../services/userService';
import '../../styles/EditProfileModal.css';
import { verifyPassword } from '../../services/authService';
import { deleteUser } from '../../services/userService';
import { useNavigate } from "react-router-dom";

interface EditProfileModalProps {
  user: UserType; 
  onClose: () => void;
  onSave: (formData: FormData) => void;
}

const EditProfileModal: React.FC<EditProfileModalProps> = ({ user, onClose, onSave }) => {
  const [formData, setFormData] = useState<UserType>({ ...user, password: '' });
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const navigate = useNavigate();


  useEffect(() => {
    setFormData({ ...user, password: '' });
    setConfirmPassword('');
    setPasswordError(null);
  }, [user]);

  const handleImageClick = () => {
    if (isEditing && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleAvatarChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      const imageUrl = URL.createObjectURL(file);
      setFormData(prev => ({ ...prev, Avatar: imageUrl }));
    }
  };

  const handleConfirmPasswordChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setConfirmPassword(value);

    if (value.includes('<') || value.includes('>')) {
      setPasswordError('Mật khẩu không được chứa ký tự không an toàn.');
    } else if (value !== newPassword) {
      setPasswordError('Mật khẩu xác nhận không khớp.');
    } else {
      setPasswordError(null);
    }
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (!isEditing) return;
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e: FormEvent) => {
    e.preventDefault();

    // 🔒 Nếu người dùng nhập mật khẩu mới → kiểm tra mật khẩu cũ
    if (newPassword) {
      if (!oldPassword) {
        alert("Vui lòng nhập mật khẩu hiện tại.");
        return;
      }

      const isValid = await verifyPassword(oldPassword);
      if (!isValid) {
        alert("❌ Mật khẩu hiện tại không đúng.");
        return;
      }
    }

    const dataToSend = new FormData();

    Object.entries(formData).forEach(([key, value]) => {
      if (key !== 'Avatar' && value) {
        dataToSend.append(key, value instanceof Date ? value.toISOString() : String(value));
      }
    });

    if (avatarFile) {
      dataToSend.append('userImage', avatarFile);
    }

    if (newPassword) {
      dataToSend.append('password', newPassword);
    }

    // 🧪 Debug log
    // for (const [key, value] of dataToSend.entries()) {
    //   console.log('FormData:', key, value);
    // }

    onSave(dataToSend);
    setIsEditing(false);
  };


const handleDeleteAccount = async (e: FormEvent) => {
  e.preventDefault();
  if (!oldPassword) {
    alert("Vui lòng nhập mật khẩu để xác nhận xoá tài khoản.");
    return;
  }

  const isValid = await verifyPassword(oldPassword);
  if (!isValid) {
    alert("❌ Mật khẩu không đúng.");
    return;
  }
  
  const confirmed = window.confirm("⚠️ Bạn có chắc chắn muốn xóa tài khoản này không?");
  if (confirmed) {
    await deleteUser();
    alert("✅ Tài khoản đã được xoá.");
    localStorage.clear();
    navigate('/login');
    onClose(); // hoặc redirect logout
  }
};
  return (
  <div className="modal_overlay">
    <form className="modal_content" onSubmit={isDeleting ? handleDeleteAccount : handleSave}>
      <div className="modal_header">
        <h2>Thông tin người dùng</h2>
        <button type="button" onClick={onClose} className="modal_close">&times;</button>
      </div>

      <div className="modal_body">
        <div className="avatar_section" onClick={handleImageClick}>
          <img
            src={formData.Avatar || 'assets/User_alt@3x.png'}
            alt="avatar"
            className="avatar_preview"
            style={{ cursor: isEditing ? 'pointer' : 'default' }}
          />
          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            onChange={handleAvatarChange}
            style={{ display: 'none' }}
          />
        </div>

        <div className="input_section">
          {!isDeleting && (
            <>
              <input name="userName" value={formData.userName} onChange={handleChange} placeholder="Tên đăng nhập" readOnly={!isEditing} />
              <input name="email" value={formData.email} onChange={handleChange} placeholder="Email" readOnly={!isEditing} />
            </>
          )}

          {(isEditing || isDeleting) && (
            <>
              <input
                type="password"
                name="password"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                placeholder="Nhập mật khẩu hiện tại"
              />
              {!isDeleting && (
                <>
                  <input
                    type="password"
                    name="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Nhập mật khẩu mới"
                  />
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={handleConfirmPasswordChange}
                    placeholder="Xác nhận mật khẩu mới"
                  />
                  {passwordError && <div className="error_text">{passwordError}</div>}
                </>
              )}
            </>
          )}

          {!isDeleting && (
            <>
              <input name="Name" value={formData.Name} onChange={handleChange} placeholder="Họ và tên" readOnly={!isEditing} />
              <input type="date" name="Birthday" value={formData.Birthday?.toString().split('T')[0] || ''} onChange={handleChange} readOnly={!isEditing} />
              <input name="Address" value={formData.Address ?? ''} onChange={handleChange} placeholder="Địa chỉ" readOnly={!isEditing} />
              <input name="PhoneNumber" value={formData.PhoneNumber ?? ''} onChange={handleChange} placeholder="Số điện thoại" readOnly={!isEditing} />
            </>
          )}
        </div>
      </div>

      <div className="modal_footer">
        {!isEditing ? (
          <button type="button" className="edit_button_profile" onClick={() => setIsEditing(true)}>Edit</button>
        ) : isDeleting ? (
          <>
            <button type="button" className="cancel_button" onClick={() => setIsDeleting(false)}>Cancel</button>
            <button type="submit" className="delete_button">Confirm Delete</button>
          </>
        ) : (
          <>
            <button type="button" className="delete_button" onClick={() => setIsDeleting(true)} disabled={!!passwordError}>Delete Account</button>
            <button type="button" className="cancel_button" onClick={() => setIsEditing(false)}>Cancel</button>
            <button type="submit" className="save_button" disabled={!!passwordError}>Save</button>
          </>
        )}
      </div>
    </form>
  </div>
);

};

export default EditProfileModal;
