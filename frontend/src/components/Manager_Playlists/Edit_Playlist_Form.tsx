import React, { useRef, useState } from "react";
import "../../styles/Edit_Playlist_Form.css";

interface EditPlaylistFormProps {
  onCancel: () => void;
}

const EditPlaylistForm: React.FC<EditPlaylistFormProps> = ({ onCancel }) => {
  const [isPublic, setIsPublic] = useState(true);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="upload-form-overlay">
      <div className="upload-form">
        <h2 className="form-title">Edit Playlist</h2>

        <div className="form-grid">
          {/* Image Upload */}
          <div className="form-image-upload">
            <div className="image-placeholder">
              {previewImage ? (
                <div className="image-preview-wrapper">
                  <img
                    src={previewImage}
                    alt="Preview"
                    className="preview-img"
                    onClick={handleUploadClick}
                  />
                  <button
                    className="remove-img-btn"
                    onClick={() => setPreviewImage(null)}
                  >
                    ✕
                  </button>
                </div>
              ) : (
                <button className="upload-btn" onClick={handleUploadClick}>
                  Upload Playlist Cover
                </button>
              )}
              <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                style={{ display: "none" }}
                onChange={handleFileChange}
              />
            </div>
          </div>

          {/* Form Fields */}
          <div className="form-fields">
            <label>
              <div className="label-row">
                Playlist Title <span className="required">*</span>
              </div>
              <input type="text" placeholder="Enter playlist title" />
            </label>

            <label>
              <div className="label-row">
                Permalink <span className="required">*</span>
              </div>
              <input type="text" placeholder="e.g. /my-playlist" />
            </label>

            <label>
              Genre
              <input type="text" placeholder="Genre" />
            </label>

            <label>
              Release date
              <input type="date" />
            </label>
          </div>
        </div>

        {/* Description and Caption */}
        <label>
          Description
          <textarea placeholder="Enter playlist description" />
        </label>

        <label>
          <div className="label-row">
            Caption <span className="caption-info">?</span>
          </div>
          <textarea placeholder="Enter caption" />
        </label>

        {/* Privacy */}
        <div className="privacy-section">
          <span className="privacy-title">Privacy:</span>

          <label className="privacy-option">
            <div className="privacy-label-wrapper">
              <div className="privacy-header">
                <span className="privacy-label">Public</span>
                <input
                  type="radio"
                  checked={isPublic}
                  onChange={() => setIsPublic(true)}
                />
              </div>
              <div className="privacy-desc">
                Anyone will be able to view this playlist.
              </div>
            </div>
          </label>

          <label className="privacy-option">
            <div className="privacy-label-wrapper">
              <div className="privacy-header">
                <span className="privacy-label">Private</span>
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
        <div className="form-buttons">
          <button className="save-btn">SAVE CHANGES</button>
          <button className="cancel-btn" onClick={onCancel}>
            CANCEL
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditPlaylistForm;
