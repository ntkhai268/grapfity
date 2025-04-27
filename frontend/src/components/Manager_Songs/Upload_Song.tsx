import React, { useRef, useState } from "react";
import "../../styles/Upload_Song_Form.css";

interface SongUploadFormProps {
  onCancel: () => void;
}

const UploadSong: React.FC<SongUploadFormProps> = ({ onCancel }) => {
  const [isPublic, setIsPublic] = useState(true);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [permalink, setPermalink] = useState("");
  const [genre, setGenre] = useState("");
  const [releaseDate, setReleaseDate] = useState("");
  const [lyrics, setLyrics] = useState("");
  const [caption, setCaption] = useState("");
  const [mainArtist, setMainArtist] = useState("");

  const imageInputRef = useRef<HTMLInputElement | null>(null);
  const audioInputRef = useRef<HTMLInputElement | null>(null);

  const handleImageUploadClick = () => {
    imageInputRef.current?.click();
  };

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAudioFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const fileName = file.name;
      const fileNameWithoutExt = fileName.replace(/\.[^/.]+$/, "");

      setPermalink(fileName);
      setTitle(fileNameWithoutExt);
    }
  };

  const handleSaveChanges = () => {
    const formData = {
      title,
      permalink,
      genre,
      releaseDate,
      lyrics,
      caption,
      isPublic,
      previewImage,
      mainArtist,
    };
    console.log("Dữ liệu gửi đi:", formData);
    onCancel();
  };

  return (
    <div className="upload-song-form-overlay">
      <div className="upload-song-form">
        <h2 className="upload-song-form-title">Upload Song</h2>

        <div className="upload-song-form-grid">
          {/* Upload Hình Ảnh */}
          <div className="upload-song-form-image-upload">
            <div className="upload-song-image-placeholder">
              {previewImage ? (
                <div className="upload-song-image-preview-wrapper">
                  <img
                    src={previewImage}
                    alt="Preview"
                    className="upload-song-preview-img"
                    onClick={handleImageUploadClick}
                  />
                  <button
                    className="upload-song-remove-img-btn"
                    onClick={() => setPreviewImage(null)}
                  >
                    ✕
                  </button>
                </div>
              ) : (
                <button
                  className="upload-song-upload-btn"
                  onClick={handleImageUploadClick}
                >
                  Upload Image
                </button>
              )}
              <input
                type="file"
                accept="image/*"
                ref={imageInputRef}
                style={{ display: "none" }}
                onChange={handleImageChange}
              />
            </div>
          </div>

          {/* Các Trường Form */}
          <div className="upload-song-form-fields">
            <label>
              <div className="upload-song-label-row">
                Track Title  <span className="upload-song-required">*</span>
              </div>
              <input
                type="text"
                placeholder="Enter title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </label>

            <label className="upload-song-tracklink-wrapper">
              <div className="upload-song-label-row">
                Track Link <span className="upload-song-required">*</span>
              </div>
              <div className="upload-song-tracklink-input-container">
                <input
                  type="text"
                  placeholder="e.g. /my-song or song.mp3"
                  value={permalink}
                  onChange={(e) => setPermalink(e.target.value)}
                />
                <button
                  type="button"
                  className="upload-song-choose-file-btn"
                  onClick={() => audioInputRef.current?.click()}
                >
                  Choose File
                </button>
                <input
                  type="file"
                  accept=".mp3"
                  ref={audioInputRef}
                  style={{ display: "none" }}
                  onChange={handleAudioFileChange}
                />
              </div>
            </label>

            <label>
              <div className="upload-song-label-row">
                Main Artist(s)   <span className="upload-song-required">*</span>
              </div>
              <input
                type="text"
                placeholder="Enter Main Artist(s)"
                value={mainArtist}
                onChange={(e) => setMainArtist(e.target.value)}
              />
            </label>

            <label>
              Genre
              <input
                type="text"
                placeholder="Genre"
                value={genre}
                onChange={(e) => setGenre(e.target.value)}
              />
            </label>

            <label>
              Release date
              <input
                type="date"
                value={releaseDate}
                onChange={(e) => setReleaseDate(e.target.value)}
              />
            </label>
          </div>
        </div>

        {/* Lyrics và Caption */}
        <label>
          Lyrics
          <textarea
            placeholder="Enter lyrics"
            value={lyrics}
            onChange={(e) => setLyrics(e.target.value)}
          />
        </label>

        <label>
          <div className="upload-song-label-row">
            Caption <span className="upload-song-caption-info">?</span>
          </div>
          <textarea
            placeholder="Enter caption"
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
          />
        </label>

        {/* Privacy */}
        <div className="upload-song-privacy-section">
          <span className="upload-song-privacy-title">Privacy:</span>

          <label className="upload-song-privacy-option">
            <div className="upload-song-privacy-label-wrapper">
              <div className="upload-song-privacy-header">
                <span className="upload-song-privacy-label">Public</span>
                <input
                  type="radio"
                  checked={isPublic}
                  onChange={() => setIsPublic(true)}
                />
              </div>
              <div className="upload-song-privacy-desc">
                Anyone will be able to listen to this track.
              </div>
            </div>
          </label>

          <label className="upload-song-privacy-option">
            <div className="upload-song-privacy-label-wrapper">
              <div className="upload-song-privacy-header">
                <span className="upload-song-privacy-label">Private</span>
                <input
                  type="radio"
                  checked={!isPublic}
                  onChange={() => setIsPublic(false)}
                />
              </div>
            </div>
          </label>
        </div>

        {/* Buttons */}
        <div className="upload-song-form-buttons">
          <button className="upload-song-save-btn" onClick={handleSaveChanges}>
            SAVE CHANGES
          </button>
          <button className="upload-song-cancel-btn" onClick={onCancel}>
            CANCEL
          </button>
        </div>
      </div>
    </div>
  );
};

export default UploadSong;
