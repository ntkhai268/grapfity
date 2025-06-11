// D:/web_html/Grabtify/frontend/src/components/Manager_Songs/UploadSong_Metadata.tsx

import React, { useState, useRef, useEffect, ChangeEvent, MouseEvent } from 'react';
// Import component Metadata (Đảm bảo đường dẫn đúng)


import { createTrackAPI } from '../../services/trackServiceAPI';

import '../../styles/UploadSongMeta.css'; // Đường dẫn tới file CSS của bạn

// Định nghĩa kiểu cho các tab
type ActiveTab = 'basic' | 'metadata';

// Định nghĩa kiểu cho props
interface UploadSongMetadataProps {
  onCancel: () => void;
}

// --- Component Chính ---
const UploadSongMetadata: React.FC<UploadSongMetadataProps> = ({ onCancel }) => {
  // --- State Variables ---
  const [title, setTitle] = useState('');
  const [permalink, setPermalink] = useState('');

 

  // --- BỎ STATE metaSongValue ĐI ---
  // const [metaSongValue, setMetaSongValue] = useState('');

  // --- State cho ô textarea riêng biệt ---
 
  const [privacy, setPrivacy] = useState('public');
  const [releaseDate, setReleaseDate] = useState(''); // String format YYYY-MM-DD
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [selectedAudioFile, setSelectedAudioFile] = useState<File | null>(null);
  const [lyrics, setLyrics] = useState('');
  const [activeTab, setActiveTab] = useState<ActiveTab>('basic');
  // State lưu dữ liệu object gốc từ Metadata tab
 

  // --- Refs ---
  const imageInputRef = useRef<HTMLInputElement>(null);
  const audioInputRef = useRef<HTMLInputElement>(null);

  // --- Effects ---
  // Cleanup Object URL ảnh
  useEffect(() => {
    return () => {
      if (imagePreviewUrl) { URL.revokeObjectURL(imagePreviewUrl); }
    };
  }, [imagePreviewUrl]);

  // --- Event Handlers ---
  const handleTriggerImageInput = () => { imageInputRef.current?.click(); };
  const handleImageChange = (event: ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      setSelectedImageFile(file);
      if (imagePreviewUrl) { URL.revokeObjectURL(imagePreviewUrl); }
      const newPreviewUrl = URL.createObjectURL(file);
      setImagePreviewUrl(newPreviewUrl);
    }
    if (event.target) { event.target.value = ''; }
  };
  const handleRemoveImage = (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    if (imagePreviewUrl) { URL.revokeObjectURL(imagePreviewUrl); }
    setSelectedImageFile(null);
    setImagePreviewUrl(null);
    if (imageInputRef.current) { imageInputRef.current.value = ''; }
  };
  const handleChooseAudioClick = () => { audioInputRef.current?.click(); };
  const handleAudioFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      setSelectedAudioFile(file);
      setPermalink(file.name);
    }
    if (event.target) { event.target.value = ''; }
  };



  // Hàm Save Changes (Gửi Notes và AudioFeatures, không gửi MetaSong nữa)
  const handleSaveChanges = async () => {
    if (activeTab !== 'basic') {
      alert("Nút 'Save changes' hiện chỉ lưu dữ liệu từ tab 'Basic info'.");
      return;
    }
    // Validation
    if (!title.trim()) { alert("Vui lòng nhập Title."); return; }
    if (!selectedAudioFile) { alert("Vui lòng chọn file nhạc (MP3)."); return; }
    if (!selectedImageFile) { alert("Vui lòng chọn ảnh."); return; }
    

   

    // Gửi request
    try {
    // console.log("Gửi tới createTrackAPI:", { title, audioFeatures, lyrics: audioFeatures.lyrics });
    console.log("Form to backend:");
    const result = await createTrackAPI(
      selectedAudioFile,
      selectedImageFile,
      title,
      privacy ,// hoặc bạn filter các field cần thiết
      lyrics,
      releaseDate
    );

    console.log("Lưu thành công:", result);
    alert("Lưu thông tin và file thành công!");
    alert("Nhạc đang được kiểm duyệt, xin vui lòng chờ.");
    onCancel();
  } catch (error: any) {
    console.error("Lỗi khi tạo track:", error);
    alert(error.message || "Đã xảy ra lỗi khi tạo track.");
    
  }
  };

  // --- Render Functions ---

  const renderTabs = () => (
    <div className="meta-tabs-container">
      <button className={`meta-tab-button ${activeTab === 'basic' ? 'meta-active' : ''}`} onClick={() => setActiveTab('basic')}> Basic info </button>
     
    </div>
  );

  const renderImageUpload = () => (
    <div className="meta-image-upload-container">
      <input type="file" accept="image/*" ref={imageInputRef} onChange={handleImageChange} style={{ display: 'none' }} aria-hidden="true" />
      {imagePreviewUrl ? (
        <>
          <img src={imagePreviewUrl} alt="Image preview" className="meta-uploaded-image" onClick={handleTriggerImageInput} title="Click to change image" />
          <button type="button" className="meta-remove-image-button" onClick={handleRemoveImage} aria-label="Remove selected image" title="Remove image">&times;</button>
        </>
      ) : (
        <>
          <div className="meta-image-placeholder" aria-hidden="true"></div>
          <button type="button" className="meta-upload-button" onClick={handleTriggerImageInput}>Upload Image</button>
        </>
      )}
    </div>
  );

  /** Render Form Fields (Input MetaSong readonly + Textarea Notes editable) */
  const renderFormFields = () => (
    <div className="meta-form-fields-container">
      {/* Title */}
      <label className="meta-form-label">
        <div className="meta-label-content">Title <span className="meta-required-indicator">*</span></div>
        <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="meta-form-input" placeholder="Enter track title" required />
      </label>
      {/* Permalink */}
      <label className="meta-form-label">
        <div className="meta-label-content">Permalink (from audio file) <span className="meta-required-indicator">*</span></div>
        <input type="file" accept="audio/mpeg,.mp3" ref={audioInputRef} onChange={handleAudioFileChange} style={{ display: 'none' }} aria-hidden="true" />
        <div className="meta-permalink-input-wrapper">
           <input type="text" value={permalink} className="meta-form-input" readOnly placeholder="<-- Choose MP3 file" aria-label="Permalink (generated from audio file name)" />
           <button type="button" className="meta-choose-file-button" onClick={handleChooseAudioClick} title="Select MP3 audio file">Choose File</button>
        </div>
      </label>
      {/* Grid Layout */}
      <div className="meta-form-grid">
        {/* Playlist type */}
        {/* <label className="meta-form-label">
          <div className="meta-label-content">Playlist type</div>
          <div className="meta-select-wrapper">
            <select value={playlistType} onChange={(e) => setPlaylistType(e.target.value)} className="meta-form-select" aria-label="Playlist type selection">
              <option value="Playlist">Playlist</option> <option value="Album">Album</option> <option value="Single">Single</option>
            </select>
            <span className="meta-select-arrow" aria-hidden="true">▼</span>
          </div>
        </label> */}
        {/* Release date */}
        <label className="meta-form-label">
          <div className="meta-label-content">Release date</div>
          <input type="date" value={releaseDate} onChange={(e) => setReleaseDate(e.target.value)} className="meta-form-input" aria-label="Release date"/>
        </label>
      </div>
      


      
      {/* Lyrics */}
      <label className="meta-form-label">
        <div className="meta-label-content">Lyrics</div>
        <textarea rows={3} value={lyrics} onChange={(e) => setLyrics(e.target.value)} placeholder="Nhập lời bài hát tại đây" className="meta-form-textarea" aria-label="Lyrics"></textarea>
      </label>


      {/* Privacy */}
      <fieldset className="meta-form-group">
        <legend className="meta-form-label">Privacy</legend>
        <div className="meta-radio-group">
          {/* --- Lựa chọn Public --- */}
          <div className="meta-radio-option">
            <input
              id="privacyPublic" // ID cho label htmlFor
              name="privacy"     // Cần cùng name để nhóm radio
              type="radio"
              value="public"     // Giá trị khi chọn
              checked={privacy === 'public'} // Kiểm tra với state 'privacy'
              onChange={(e) => setPrivacy(e.target.value)} // <<< Gọi setPrivacy
              className="meta-form-radio"
            />
            <div className="meta-radio-label-group">
               <label htmlFor="privacyPublic" className="meta-radio-label-main">Public</label>
               <p className="meta-radio-label-description">Anyone will be able to listen to this.</p>
            </div>
          </div>
          {/* --- Lựa chọn Private --- */}
          <div className="meta-radio-option">
            <input
              id="privacyPrivate" // ID cho label htmlFor
              name="privacy"      // Cần cùng name
              type="radio"
              value="private"    // Giá trị khi chọn
              checked={privacy === 'private'} // Kiểm tra với state 'privacy'
              onChange={(e) => setPrivacy(e.target.value)} // <<< Gọi setPrivacy
              className="meta-form-radio"
            />
             <div className="meta-radio-label-group">
                <label htmlFor="privacyPrivate" className="meta-radio-label-main">Private</label>
             </div>
          </div>
        </div>
      </fieldset>
    </div>
  );

  const renderFooter = () => (
    <div className="meta-form-footer">
      <p className="meta-required-note"><span className="meta-required-indicator">*</span> Required fields</p>
      <div className="meta-footer-buttons">
        <button type="button" className="meta-form-button meta-form-button-cancel" onClick={onCancel}>Cancel</button>
        <button type="button" className="meta-form-button meta-form-button-save" onClick={handleSaveChanges}>Save changes</button>
      </div>
    </div>
  );

  // --- Render Component Chính ---
  return (
    <div className="meta-upload-metadata-container">
      {renderTabs()}
      {/* Render nội dung chính dựa vào activeTab */}
      {activeTab === 'basic' && (
        <div className="meta-main-content-area">
          {renderImageUpload()}
          {renderFormFields()}
        </div>
      )}
      
      {/* --- Chỉ render Footer khi tab 'basic' đang active --- */}
     {activeTab === 'basic' && renderFooter()}
     {/* --- Footer sẽ không hiển thị khi activeTab là 'metadata' --- */}
    </div>
  );
};

export default UploadSongMetadata;