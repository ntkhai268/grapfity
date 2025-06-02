import React, { useEffect, useRef, useState, ChangeEvent, FormEvent, MouseEvent } from 'react';
import { updateTrackAPI, getTrackByIdAPI } from '../../services/trackServiceAPI';
import '../../styles/updateSongBasicInfo.css';

interface EditSongProps {
  trackId: string | number;
  onCancel: () => void;
  onSaveSuccess: () => void;
}

const UpdateSongBasicInfo: React.FC<EditSongProps> = ({ trackId, onCancel, onSaveSuccess }) => {
  const [title, setTitle] = useState('');
  const [lyrics, setLyrics] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [privacy, setPrivacy] = useState<'public' | 'private'>('public');
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
           setPrivacy(track.privacy || 'public'); 
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
      formData.append('privacy', privacy);

      // Chỉ thêm nếu người dùng chọn file mới
      if (imageFile) {
        formData.append('trackImage', imageFile);
      }

      

      await updateTrackAPI(trackId, formData);
      const updatedTrack = await getTrackByIdAPI(trackId);
      setPreviewImage(updatedTrack?.cover || '');
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
              <label>Title</label>
              <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required />
            </div>
            {/* chua fetch privacy để set cho nút hiển thị lúc update */}
            <fieldset className="meta-form-group">
                <legend className="meta-form-label">Privacy</legend>
                <div className="meta-radio-group">
                  <div className="meta-radio-option">
                    <input
                      id="privacyPublic"
                      name="privacy"
                      type="radio"
                      value="public"
                      checked={privacy === 'public'}
                      onChange={(e) => setPrivacy(e.target.value as 'public' | 'private')}
                      className="meta-form-radio"
                    />
                    <div className="meta-radio-label-group">
                      <label htmlFor="privacyPublic" className="meta-radio-label-main">Public</label>
                      <p className="meta-radio-label-description">Anyone will be able to listen to this.</p>
                    </div>
                  </div>

                  <div className="meta-radio-option">
                    <input
                      id="privacyPrivate"
                      name="privacy"
                      type="radio"
                      value="private"
                      checked={privacy === 'private'}
                      onChange={(e) => setPrivacy(e.target.value as 'public' | 'private')}
                      className="meta-form-radio"
                    />
                    <div className="meta-radio-label-group">
                      <label htmlFor="privacyPrivate" className="meta-radio-label-main">Private</label>
                    </div>
                  </div>
                </div>
              </fieldset>


            
          </div>

          <input type="file" accept="image/*" ref={imageInputRef} style={{ display: 'none' }} onChange={handleImageChange} />
        </div>


        
        <div className="edit-song-field">
          <label>Lyrics</label>
          <textarea value={lyrics} onChange={(e) => setLyrics(e.target.value)} placeholder="Nhập lyrics ở đây..." />
        </div>

        <div className="edit-song-buttons">
          <button type="button" onClick={onCancel}>Cancel</button>
          <button type="submit">Save change</button>
        </div>
      </form>
    </div>
  );
};

export default UpdateSongBasicInfo;
