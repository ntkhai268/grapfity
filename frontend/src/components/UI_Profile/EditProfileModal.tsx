import React, { useState, useEffect, useRef, ChangeEvent, FormEvent } from 'react';
import { UserData } from '../../services/userService';
import '../../styles/EditProfileModal.css';

interface EditProfileModalProps {
  user: UserData;
  onClose: () => void;
  onSave: (formData: FormData) => void;
}

const EditProfileModal: React.FC<EditProfileModalProps> = ({ user, onClose, onSave }) => {
  const [formData, setFormData] = useState<UserData>({ ...user, password: '' });
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
    } else if (value !== formData.password) {
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
    const dataToSend = new FormData();

    Object.entries(formData).forEach(([key, value]) => {
      if (key !== 'Avatar' && value) {
        dataToSend.append(key, value instanceof Date ? value.toISOString() : String(value));
      }
    });

    if (avatarFile) {
      dataToSend.append('userImage', avatarFile);
    }

      for (const [key, value] of dataToSend.entries()) {
    console.log('FormData:', key, value);
  }

    onSave(dataToSend);
    setIsEditing(false);
  };

  return (
    <div className="modal_overlay">
      <form className="modal_content" onSubmit={handleSave}>
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
            <input name="userName" value={formData.userName} onChange={handleChange} placeholder="Tên đăng nhập" readOnly={!isEditing} />
            <input name="email" value={formData.email} onChange={handleChange} placeholder="Email" readOnly={!isEditing} />

            {isEditing && (
              <>
                <input type="password" name="password" value={formData.password} onChange={handleChange} placeholder="Nhập mật khẩu mới" />
                <input type="password" value={confirmPassword} onChange={handleConfirmPasswordChange} placeholder="Xác nhận mật khẩu mới" />
                {passwordError && <div className="error_text">{passwordError}</div>}
              </>
            )}

            <input name="Name" value={formData.Name} onChange={handleChange} placeholder="Họ và tên" readOnly={!isEditing} />
            <input type="date" name="Birthday" value={formData.Birthday?.toString().split('T')[0] || ''} onChange={handleChange} readOnly={!isEditing} />
            <input name="Address" value={formData.Address ?? ''} onChange={handleChange} placeholder="Địa chỉ" readOnly={!isEditing} />
            <input name="PhoneNumber" value={formData.PhoneNumber ?? ''} onChange={handleChange} placeholder="Số điện thoại" readOnly={!isEditing} />
          </div>
        </div>

        <div className="modal_footer">
          {!isEditing ? (
            <button type="button" className="edit_button" onClick={() => setIsEditing(true)}>Chỉnh sửa</button>
          ) : (
            <>
              <button type="button" className="cancel_button" onClick={() => setIsEditing(false)}>Hủy</button>
              <button type="submit" className="save_button" disabled={!!passwordError}>Lưu</button>
            </>
          )}
        </div>
      </form>
    </div>
  );
};

export default EditProfileModal;
