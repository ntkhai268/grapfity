// D:\web_html\gop\grapfity\frontend\src\components\Manager_Playlists\PlaylistEditModal.tsx
import React, { useState, useEffect, useRef } from 'react'; // <-- Thêm lại useRef
import '../../styles/PlaylistEditModal.css';

// Định nghĩa kiểu dữ liệu cho playlist (giữ nguyên)
interface PlaylistData {
    id: number;
    title: string;
    cover: string | null; // Hoặc imageUrl tùy thuộc vào tên bạn thống nhất
    privacy?: 'public' | 'private';
}

// Định nghĩa kiểu Props cho component (Sửa lại onSave)
interface PlaylistEditModalProps {
    playlist: PlaylistData | null;
    onClose: () => void;
    // Quay lại: onSave nhận newImageFile (File object)
    onSave: (playlistId: number, newTitle: string, newImageFile?: File, privacy?: 'public' | 'private') => void;
    isSaving?: boolean;
}



// SVG Paths (Thêm lại icon Edit)
const svgIconMusicNote = "M6 3h15v15.167a3.5 3.5 0 1 1-3.5-3.5H19V5H8v13.167a3.5 3.5 0 1 1-3.5-3.5H6V3zm0 13.667H4.5a1.5 1.5 0 1 0 1.5 1.5v-1.5zm13 0h-1.5a1.5 1.5 0 1 0 1.5 1.5v-1.5z";
const svgIconEdit = "M17.318 1.975a3.329 3.329 0 1 1 4.707 4.707L8.451 20.256c-.49.49-1.082.867-1.735 1.103L2.34 22.94a1 1 0 0 1-1.28-1.28l1.581-4.376a4.726 4.726 0 0 1 1.103-1.735L17.318 1.975zm3.293 1.414a1.329 1.329 0 0 0-1.88 0L5.159 16.963c-.283.283-.5.624-.636 1l-.857 2.372 2.371-.857a2.726 2.726 0 0 0 1.001-.636L20.611 5.268a1.329 1.329 0 0 0 0-1.879z";


const PlaylistEditModal: React.FC<PlaylistEditModalProps> = ({ playlist, onClose, onSave, isSaving }) => {
    // State cho các trường input
    const [title, setTitle] = useState('');
    // const [description, setDescription] = useState(''); // Bỏ nếu không dùng
    const [imagePreview, setImagePreview] = useState<string | null>(null); // Xem trước ảnh mới
    const [imageFile, setImageFile] = useState<File | null>(null); // <-- Thêm lại state lưu File ảnh mới
    const [isHoveringImage, setIsHoveringImage] = useState(false); // <-- Thêm lại state hover ảnh
    const [privacy, setPrivacy] = useState<'public' | 'private'>('public');

    // Ref cho input file ẩn
    const fileInputRef = useRef<HTMLInputElement>(null); // <-- Thêm lại ref

    // useEffect để cập nhật state khi playlist prop thay đổi
    useEffect(() => {
        if (playlist) {
            setTitle(playlist.title);
            // Hiển thị ảnh hiện tại ban đầu
            setImagePreview(playlist.cover); // Sử dụng cover hoặc imageUrl tùy state cha
            setPrivacy(playlist.privacy || 'public');
        } else {
            // Reset state
            setTitle('');
            setImagePreview(null);
            setPrivacy('public'); 
        }
        // Reset các state liên quan đến file khi modal mở/đóng hoặc playlist thay đổi
        setImageFile(null);
        setIsHoveringImage(false);
    }, [playlist]);

    // Xử lý thay đổi tiêu đề (giữ nguyên)
    const handleTitleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setTitle(event.target.value);
    };

    // Xử lý khi nhấn vào vùng ảnh để chọn file
    const handleImageClick = () => { // <-- Thêm lại hàm này
        fileInputRef.current?.click(); // Kích hoạt input file ẩn
    };

    // Xử lý khi chọn file ảnh mới
    const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => { // <-- Thêm lại hàm này
        const file = event.target.files?.[0];
        if (file) {
            setImageFile(file); // Lưu file đã chọn vào state
            // Tạo URL tạm thời để xem trước ảnh
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string); // Cập nhật ảnh xem trước
            };
            reader.readAsDataURL(file);
        }
    };

    // Xử lý khi nhấn nút Lưu
    const handleSaveChanges = () => {
        if (playlist) {
            // Gọi hàm onSave từ props, truyền ID, title mới và imageFile (hoặc undefined)
            onSave(playlist.id, title, imageFile || undefined, privacy); // <-- Truyền imageFile
        }
    };

    // Nếu không có playlist, không render gì cả (giữ nguyên)
    if (!playlist) {
        return null;
    }

    // Xác định xem nên hiển thị ảnh thật, ảnh preview hay icon mặc định
    const displayImage = imagePreview; // Luôn ưu tiên ảnh preview (ảnh mới chọn) nếu có
    const showDefaultIcon = !displayImage;

    return (
    <div className="playlist-edit-modal__overlay" onClick={onClose}>
        <div className="playlist-edit-modal__container" onClick={e => e.stopPropagation()}>
            {/* Header */}
            <div className="playlist-edit-modal__header">
                <h2>Sửa thông tin chi tiết</h2>
                <button className="playlist-edit-modal__close-btn" onClick={onClose} aria-label="Đóng">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" width="20" height="20">
                        <path d="M.293.293a1 1 0 0 1 1.414 0L8 6.586 14.293.293a1 1 0 1 1 1.414 1.414L9.414 8l6.293 6.293a1 1 0 0 1-1.414 1.414L8 9.414l-6.293 6.293a1 1 0 0 1-1.414-1.414L6.586 8 .293 1.707a1 1 0 0 1 0-1.414z"></path>
                    </svg>
                </button>
            </div>

            {/* Body */}
            <div className="playlist-edit-modal__body">
                {/* Ảnh bìa */}
                <div
                    className="playlist-edit-modal__image-section"
                    onClick={handleImageClick}
                    onMouseEnter={() => setIsHoveringImage(true)}
                    onMouseLeave={() => setIsHoveringImage(false)}
                >
                    {showDefaultIcon ? (
                        <div className="playlist-edit-modal__default-icon">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#b3b3b3" width="80" height="80">
                                <path d={isHoveringImage ? svgIconEdit : svgIconMusicNote}></path>
                            </svg>
                            {isHoveringImage && <span className="playlist-edit-modal__edit-label">Chọn ảnh</span>}
                        </div>
                    ) : (
                        <>
                            <img
                                src={displayImage ?? ''}
                                alt="Playlist cover"
                                className="playlist-edit-modal__cover-image"
                            />
                        </>
                    )}
                    {displayImage && isHoveringImage && (
                        <div className="playlist-edit-modal__image-overlay">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#ffffff" width="60" height="60">
                                <path d={svgIconEdit}></path>
                            </svg>
                            <span className="playlist-edit-modal__edit-label">Chọn ảnh</span>
                        </div>
                    )}
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleImageChange}
                        accept="image/jpeg, image/png, image/gif"
                        style={{ display: 'none' }}
                    />
                </div>

                {/* Thông tin (Title + Privacy) */}
                <div className="playlist-edit-modal__info-wrap">
                    <input
                        type="text"
                        className="playlist-edit-modal__title-input"
                        value={title}
                        onChange={handleTitleChange}
                        placeholder="Nhập tên playlist"
                        maxLength={100}
                    />
                    <div className="playlist-edit-modal__privacy-section">
                        <label className="playlist-edit-modal__privacy-label" style={{ marginBottom: 6, fontWeight: 500 }}>
                            Privacy:
                        </label>
                        <div className="playlist-edit-modal__privacy-radio-group">
                            <label>
                                <input
                                    type="radio"
                                    name="privacy"
                                    value="public"
                                    checked={privacy === 'public'}
                                    onChange={() => setPrivacy('public')}
                                />
                                Public
                            </label>
                            <label>
                                <input
                                    type="radio"
                                    name="privacy"
                                    value="private"
                                    checked={privacy === 'private'}
                                    onChange={() => setPrivacy('private')}
                                />
                                Private
                            </label>
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div className="playlist-edit-modal__footer">
                <button
                    className="playlist-edit-modal__save-btn"
                    onClick={handleSaveChanges}
                    disabled={isSaving}
                >
                    {isSaving ? 'Đang lưu...' : 'Lưu'}
                </button>
            </div>
        </div>
    </div>
);

};

export default PlaylistEditModal;

