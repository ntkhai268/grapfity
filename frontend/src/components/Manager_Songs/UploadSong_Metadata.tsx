// D:/web_html/Grabtify/frontend/src/components/Manager_Songs/UploadSong_Metadata.tsx

import React, { useState, useRef, useEffect, ChangeEvent, MouseEvent } from 'react';
// Import component Metadata (Đảm bảo đường dẫn đúng)
import Metadata from '../Manager_Songs/MetaData'; // <<< Đảm bảo đúng đường dẫn
// Import/Định nghĩa interface AudioFeaturesData (quan trọng)
import { AudioFeaturesData } from '../Manager_Songs/MetaData';
/* // Hoặc định nghĩa lại:
interface AudioFeaturesData {
  explicit: boolean; key: string; danceability: number | null; energy: number | null;
  loudness: number | null; tempo: number | null; time_signature: string | null;
  acousticness: number | null; instrumentalness: number | null; liveness: number | null;
  speechiness: number | null; valence: number | null;
} */
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
  const [playlistType, setPlaylistType] = useState('Playlist');
  const [genre, setGenre] = useState('None');
  const [tags, setTags] = useState('');
  // --- BỎ STATE metaSongValue ĐI ---
  // const [metaSongValue, setMetaSongValue] = useState('');
  const [description, setDescription] = useState('');
  // --- State cho ô textarea riêng biệt ---
  const [notes, setNotes] = useState(''); // Dùng cho textarea Notes
  const [privacy, setPrivacy] = useState('Public');
  const [releaseDate, setReleaseDate] = useState(''); // String format YYYY-MM-DD
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [selectedAudioFile, setSelectedAudioFile] = useState<File | null>(null);
  const [activeTab, setActiveTab] = useState<ActiveTab>('basic');
  // State lưu dữ liệu object gốc từ Metadata tab
  const [audioFeatures, setAudioFeatures] = useState<AudioFeaturesData | null>(null);

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

  // Hàm nhận dữ liệu khi nhấn OK từ Metadata component
  const handleMetadataOk = (data: AudioFeaturesData) => {
      console.log("Received metadata:", data);
      setAudioFeatures(data); // Chỉ cập nhật state này
      setActiveTab('basic');   // Quay về tab basic
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

    // Tạo FormData
    const formData = new FormData();
    formData.append('title', title.trim());
    formData.append('permalink', permalink);
    formData.append('playlistType', playlistType);
    formData.append('genre', genre);
    formData.append('tags', tags.trim());
    formData.append('description', description.trim());
    // --- Gửi giá trị từ ô TEXTAREA NOTES ---
    formData.append('notes', notes.trim());
    formData.append('privacy', privacy);
    formData.append('releaseDate', releaseDate);
    if (selectedImageFile) { formData.append('image', selectedImageFile, selectedImageFile.name); }
    if (selectedAudioFile) { formData.append('audio', selectedAudioFile, selectedAudioFile.name); }
    // --- Gửi cả object audioFeatures (JSON string) ---
    if (audioFeatures) {
        formData.append('audioFeatures', JSON.stringify(audioFeatures));
    }
    // Gửi request
    try {
      console.log("FormData to send:", Object.fromEntries(formData.entries()));
      const apiUrl = "http://localhost:8080/api/create-track"; // <<< THAY THẾ API
      const response = await fetch(apiUrl, {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      if (!response.ok) {
          let errorData = { message: `Server responded with status ${response.status}` };
          try { errorData = await response.json(); } catch (jsonError) {}
          console.error("❌ Lỗi từ server:", response.status, errorData);
          alert(`Lỗi khi lưu dữ liệu: ${errorData.message || response.statusText}`);
          return;
      }
      const result = await response.json();
      console.log("✅ Lưu thành công:", result);
      alert("Lưu thông tin và file thành công!");
      onCancel();
    } catch (error) {
        console.error("❌ Lỗi khi gửi request:", error);
        alert("Đã xảy ra lỗi mạng hoặc lỗi không xác định. Vui lòng thử lại.");
    }
  };

  // --- Render Functions ---

  const renderTabs = () => (
    <div className="meta-tabs-container">
      <button className={`meta-tab-button ${activeTab === 'basic' ? 'meta-active' : ''}`} onClick={() => setActiveTab('basic')}> Basic info </button>
      <button className={`meta-tab-button ${activeTab === 'metadata' ? 'meta-active' : ''}`} onClick={() => setActiveTab('metadata')}> Metadata </button>
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
        <label className="meta-form-label">
          <div className="meta-label-content">Playlist type</div>
          <div className="meta-select-wrapper">
            <select value={playlistType} onChange={(e) => setPlaylistType(e.target.value)} className="meta-form-select" aria-label="Playlist type selection">
              <option value="Playlist">Playlist</option> <option value="Album">Album</option> <option value="Single">Single</option>
            </select>
            <span className="meta-select-arrow" aria-hidden="true">▼</span>
          </div>
        </label>
        {/* Release date */}
        <label className="meta-form-label">
          <div className="meta-label-content">Release date</div>
          <input type="date" value={releaseDate} onChange={(e) => setReleaseDate(e.target.value)} className="meta-form-input" aria-label="Release date"/>
        </label>
      </div>
      {/* Genre */}
      <label className="meta-form-label">
        <div className="meta-label-content">Genre</div>
        <div className="meta-select-wrapper">
          <select value={genre} onChange={(e) => setGenre(e.target.value)} className="meta-form-select" aria-label="Genre selection">
            <option value="None">None</option> <option value="Electronic">Electronic</option> <option value="Rock">Rock</option> <option value="Pop">Pop</option>
          </select>
           <span className="meta-select-arrow" aria-hidden="true">▼</span>
        </div>
      </label>

      {/* --- Ô INPUT METASONG (HIỂN THỊ DỮ LIỆU TỪ TAB METADATA, READONLY) --- */}
      <label className="meta-form-label">
          <div className="meta-label-content">MetaDataSong (Collected)</div> {/* Đổi label cho rõ */}
          <input
              type="text"
              className="meta-form-input"
              // Hiển thị object audioFeatures thành chuỗi JSON
              value={audioFeatures ? JSON.stringify(audioFeatures) : ''}
              readOnly // Chỉ đọc
              placeholder="Data from Metadata tab appears here"
              aria-label="Collected data from Metadata tab"
          />
      </label>
      {/* --- KẾT THÚC Ô METASONG --- */}

      {/* Additional tags */}
      <label className="meta-form-label">
        <div className="meta-label-content">Additional tags</div>
        <input type="text" value={tags} onChange={(e) => setTags(e.target.value)} placeholder="Separate tags with commas" className="meta-form-input" aria-label="Additional tags" />
      </label>
      {/* Description */}
      <label className="meta-form-label">
        <div className="meta-label-content">Description</div>
        <textarea rows={3} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Describe your track or playlist" className="meta-form-textarea" aria-label="Description"></textarea>
      </label>

      {/* --- TEXTAREA ĐỂ NGƯỜI DÙNG NHẬP LIỆU RIÊNG --- */}
      <label className="meta-form-label">
          <div className="meta-label-content">Notes</div> {/* Label mới */}
          <textarea
              className="meta-form-textarea" // Dùng class textarea
              rows={4} // Số dòng tùy chỉnh
              value={notes} // Kết nối state notes
              onChange={(e) => setNotes(e.target.value)} // Cho phép nhập liệu
              placeholder="Enter any additional notes here..." // Placeholder
              aria-label="Additional Notes"
          />
      </label>
      {/* --- KẾT THÚC TEXTAREA --- */}

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
              value="Public"     // Giá trị khi chọn
              checked={privacy === 'Public'} // Kiểm tra với state 'privacy'
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
              value="Private"    // Giá trị khi chọn
              checked={privacy === 'Private'} // Kiểm tra với state 'privacy'
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
      {activeTab === 'metadata' && (
         <Metadata onCancel={onCancel} onOk={handleMetadataOk} />
      )}
      {renderFooter()}
    </div>
  );
};

export default UploadSongMetadata;