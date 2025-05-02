import React, { useState, useEffect, useRef } from 'react';
import '../../styles/PlaylistEditModal.css'; // <-- Import file CSS mới

// Định nghĩa kiểu dữ liệu cho playlist (có thể import từ nơi khác)
interface PlaylistData {
    id: number;
    title: string;
    cover: string | null;
    // Thêm các trường khác nếu cần
}

// Định nghĩa kiểu Props cho component
interface PlaylistEditModalProps {
    playlist: PlaylistData | null; // Playlist cần sửa, hoặc null nếu không có
    onClose: () => void; // Hàm để đóng modal
    onSave: (playlistId: number, newTitle: string, newImageFile?: File) => void; // Hàm lưu thay đổi
}

// SVG Path cho icon mặc định và icon edit (có thể import từ file khác)
const svgIconMusicNote = "M6 3h15v15.167a3.5 3.5 0 1 1-3.5-3.5H19V5H8v13.167a3.5 3.5 0 1 1-3.5-3.5H6V3zm0 13.667H4.5a1.5 1.5 0 1 0 1.5 1.5v-1.5zm13 0h-1.5a1.5 1.5 0 1 0 1.5 1.5v-1.5z";
const svgIconEdit = "M17.318 1.975a3.329 3.329 0 1 1 4.707 4.707L8.451 20.256c-.49.49-1.082.867-1.735 1.103L2.34 22.94a1 1 0 0 1-1.28-1.28l1.581-4.376a4.726 4.726 0 0 1 1.103-1.735L17.318 1.975zm3.293 1.414a1.329 1.329 0 0 0-1.88 0L5.159 16.963c-.283.283-.5.624-.636 1l-.857 2.372 2.371-.857a2.726 2.726 0 0 0 1.001-.636L20.611 5.268a1.329 1.329 0 0 0 0-1.879z";

const PlaylistEditModal: React.FC<PlaylistEditModalProps> = ({ playlist, onClose, onSave }) => {
    // State cho các trường input
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState(''); // Thêm state cho mô tả
    const [imagePreview, setImagePreview] = useState<string | null>(null); // Xem trước ảnh mới
    const [imageFile, setImageFile] = useState<File | null>(null); // File ảnh mới được chọn
    const [isHoveringImage, setIsHoveringImage] = useState(false); // Trạng thái hover ảnh

    // Ref cho input file ẩn
    const fileInputRef = useRef<HTMLInputElement>(null);

    // useEffect để cập nhật state khi playlist prop thay đổi
    useEffect(() => {
        if (playlist) {
            setTitle(playlist.title);
            setImagePreview(playlist.cover); // Hiển thị ảnh hiện tại ban đầu
            // setDescription(playlist.description || ''); // Lấy mô tả nếu có
        } else {
            // Reset state nếu không có playlist (ví dụ: khi modal đóng và mở lại)
            setTitle('');
            setDescription('');
            setImagePreview(null);
            setImageFile(null);
        }
        setIsHoveringImage(false); // Reset hover
    }, [playlist]); // Chạy lại khi playlist thay đổi

    // Xử lý thay đổi tiêu đề
    const handleTitleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setTitle(event.target.value);
    };

    // Xử lý thay đổi mô tả
    const handleDescriptionChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
        setDescription(event.target.value);
    };

    // Xử lý khi nhấn vào vùng ảnh để chọn file
    const handleImageClick = () => {
        fileInputRef.current?.click(); // Kích hoạt input file ẩn
    };

    // Xử lý khi chọn file ảnh mới
    const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setImageFile(file); // Lưu file đã chọn
            // Tạo URL tạm thời để xem trước ảnh
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    // Xử lý khi nhấn nút Lưu
    const handleSaveChanges = () => {
        if (playlist) {
            // Gọi hàm onSave từ props, truyền ID, title mới và file ảnh mới (nếu có)
            onSave(playlist.id, title, imageFile || undefined);
        }
    };

    // Nếu không có playlist, không render gì cả (hoặc có thể render thông báo lỗi)
    if (!playlist) {
        return null;
    }

    // Xác định xem nên hiển thị ảnh thật, ảnh preview hay icon mặc định
    const displayImage = imagePreview || playlist.cover; // Ưu tiên ảnh preview, rồi đến ảnh gốc
    const showDefaultIcon = !displayImage; // Chỉ hiện icon nếu không có ảnh nào

    return (
        // Lớp overlay bao phủ toàn màn hình
        <div className="playlist-edit-modal__overlay" onClick={onClose}>
            {/* Container của modal, ngăn chặn sự kiện click lan ra overlay */}
            <div className="playlist-edit-modal__container" onClick={(e) => e.stopPropagation()}>
                {/* Header của modal */}
                <div className="playlist-edit-modal__header">
                    <h2>Sửa thông tin chi tiết</h2>
                    <button className="playlist-edit-modal__close-btn" onClick={onClose} aria-label="Đóng">
                        {/* SVG cho nút đóng (X) */}
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" width="20" height="20">
                            <path d="M.293.293a1 1 0 0 1 1.414 0L8 6.586 14.293.293a1 1 0 1 1 1.414 1.414L9.414 8l6.293 6.293a1 1 0 0 1-1.414 1.414L8 9.414l-6.293 6.293a1 1 0 0 1-1.414-1.414L6.586 8 .293 1.707a1 1 0 0 1 0-1.414z"></path>
                        </svg>
                    </button>
                </div>

                {/* Body của modal */}
                <div className="playlist-edit-modal__body">
                    {/* Phần ảnh bìa */}
                    <div
                        className="playlist-edit-modal__image-section"
                        onClick={handleImageClick}
                        onMouseEnter={() => setIsHoveringImage(true)}
                        onMouseLeave={() => setIsHoveringImage(false)}
                    >
                        {/* Hiển thị ảnh hoặc icon mặc định */}
                        {showDefaultIcon ? (
                            <div className="playlist-edit-modal__default-icon">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#b3b3b3" width="80" height="80">
                                    {/* Hiển thị icon edit khi hover hoặc icon nhạc mặc định */}
                                    <path d={isHoveringImage ? svgIconEdit : svgIconMusicNote}></path>
                                </svg>
                                {isHoveringImage && <span className="playlist-edit-modal__edit-label">Chọn ảnh</span>}
                            </div>
                        ) : (
                            <img
                                src={displayImage ?? ''} // Sử dụng ảnh preview hoặc ảnh gốc
                                alt="Playlist cover"
                                className="playlist-edit-modal__cover-image"
                            />
                        )}
                        {/* Lớp phủ và icon edit khi hover ảnh thật */}
                        {displayImage && isHoveringImage && (
                            <div className="playlist-edit-modal__image-overlay">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#ffffff" width="60" height="60">
                                    <path d={svgIconEdit}></path>
                                </svg>
                                <span className="playlist-edit-modal__edit-label">Chọn ảnh</span>
                            </div>
                        )}
                        {/* Input file ẩn */}
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleImageChange}
                            accept="image/jpeg, image/png, image/gif" // Chỉ chấp nhận các định dạng ảnh phổ biến
                            style={{ display: 'none' }}
                        />
                    </div>

                    {/* Phần thông tin text */}
                    <div className="playlist-edit-modal__info-section">
                        <input
                            type="text"
                            className="playlist-edit-modal__title-input"
                            value={title}
                            onChange={handleTitleChange}
                            placeholder="Nhập tên playlist"
                            maxLength={100} // Giới hạn độ dài tiêu đề
                        />
                        <textarea
                            className="playlist-edit-modal__desc-input"
                            value={description}
                            onChange={handleDescriptionChange}
                            placeholder="Thêm phần mô tả không bắt buộc"
                            rows={4} // Số dòng hiển thị ban đầu
                            maxLength={300} // Giới hạn độ dài mô tả
                        />
                    </div>
                </div>

                {/* Footer của modal */}
                <div className="playlist-edit-modal__footer">
                    <button className="playlist-edit-modal__save-btn" onClick={handleSaveChanges}>
                        Lưu
                    </button>
                </div>

            </div>
             {/* Khối <style> đã được xóa */}
        </div>
    );
};

export default PlaylistEditModal;