import React, { useEffect, useRef, useState, ChangeEvent, FormEvent, MouseEvent } from 'react';
import { updateTrackAPI, getTrackByIdAPI } from '../../services/trackServiceAPI';
import '../../styles/updateSongBasicInfo.css';

interface EditSongProps {
  trackId: string | number;
  onCancel: () => void;
  onSaveSuccess: () => void;
}

const UploadSongBasicInfo: React.FC<EditSongProps> = ({ trackId, onCancel, onSaveSuccess }) => {
  const [title, setTitle] = useState('');
  const [lyrics, setLyrics] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [previewImage, setPreviewImage] = useState<string>('');
  const imageInputRef = useRef<HTMLInputElement>(null);

  // useEffect(() => {
  //   return () => {
  //     if (previewImage) URL.revokeObjectURL(previewImage);
  //   };
  // }, [previewImage]);
  useEffect(() => {
    const fetchTrackDetails = async () => {
      try {
        const track = await getTrackByIdAPI(trackId);
        if (track) {
          setTitle(track.title || '');
          setLyrics(track.lyrics || '');
          setPreviewImage(track.cover || ''); // hoặc track.imageUrl nếu bạn dùng field đó
        }
      } catch (err: any) {
        console.error('Lỗi khi lấy thông tin bài hát:', err);
        alert('Không thể tải dữ liệu bài hát.');
      }
    };

    fetchTrackDetails();

    return () => {
      if (previewImage) URL.revokeObjectURL(previewImage);
    };
  }, [trackId]);


  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setPreviewImage(URL.createObjectURL(file));
    }
  };
  const handleRemoveImage = (event: MouseEvent<HTMLButtonElement>) => {
      event.stopPropagation();
      if (previewImage) { URL.revokeObjectURL(previewImage); }
      setImageFile(null);
      setPreviewImage('');
      if (imageInputRef.current) { imageInputRef.current.value = ''; }
  };

  const handleAudioChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setAudioFile(file);
  };

  const handleTriggerImageInput = () => {
    imageInputRef.current?.click();
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      alert('Vui lòng nhập tiêu đề bài hát.');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('title', title.trim());
      formData.append('lyrics', lyrics.trim());

      // Chỉ thêm nếu người dùng chọn file mới
      if (imageFile) {
        formData.append('image', imageFile);
      }

      if (audioFile) {
        formData.append('audio', audioFile);
      }

      await updateTrackAPI(trackId, formData);
      alert('Cập nhật thành công!');
      onSaveSuccess();
    } catch (err: any) {
      console.error("Lỗi khi cập nhật track:", err);
      alert(err.message || 'Có lỗi xảy ra khi cập nhật.');
    }
  };


  return (
    <div className="edit-song-overlay">
      <form className="edit-song-form" onSubmit={handleSubmit}>
        <h2>Chỉnh sửa bài nhạc</h2>

        <div className="edit-song-image-title-row">
          <div className="edit-song-thumbnail" onClick={handleTriggerImageInput}>
            {previewImage ? (
              <>
                <img
                  src={previewImage}
                  alt="Image song preview"
                  className="song-uploaded-image"
                />
                <button
                  type="button"
                  className="song-remove-image-button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemoveImage(e);
                  }}
                  aria-label="Remove selected image"
                  title="Remove image"
                >
                  &times;
                </button>
              </>
            ) : (
              <>
                
                <button type="button" className="song-upload-button">Upload Image</button>
              </>
            )}
          </div>

          <div className="edit-song-title-fields">
            <div className="edit-song-field">
              <label>Tiêu đề *</label>
              <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required />
            </div>

            <div className="edit-song-field">
              <label>File nhạc *</label>
              <input type="file" accept="audio/*" onChange={handleAudioChange} />
            </div>
          </div>

          <input type="file" accept="image/*" ref={imageInputRef} style={{ display: 'none' }} onChange={handleImageChange} />
        </div>


        
        <div className="edit-song-field">
          <label>Lời bài hát</label>
          <textarea value={lyrics} onChange={(e) => setLyrics(e.target.value)} placeholder="Nhập lyrics ở đây..." />
        </div>

        <div className="edit-song-buttons">
          <button type="button" onClick={onCancel}>Hủy</button>
          <button type="submit">Lưu thay đổi</button>
        </div>
      </form>
    </div>
  );
};

export default UploadSongBasicInfo;
