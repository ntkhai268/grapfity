import React, { useState } from "react";
import "../../styles/Edit_Playlist_Form.css";

const SongUploadForm: React.FC = () => {
  const [isPublic, setIsPublic] = useState(true);

  return (
    <div className="upload-form-overlay">
      <div className="upload-form">
        <h2 className="form-title">Basic info</h2>

        <div className="form-grid">
          {/* Image Upload */}
          <div className="form-image-upload">
            <div className="image-placeholder">
              <button className="upload-btn">Upload Image</button>
            </div>
          </div>

          {/* Form Fields */}
          <div className="form-fields">
          <label>
            <div className="label-row">
                Titles <span className="required">*</span>
            </div>
            <input type="text" placeholder="Enter title" />
            </label>

            <label>
            <div className="label-row">
                Permalink <span className="required">*</span>
            </div>
            <input type="text" placeholder="e.g. /my-song" />
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

        {/* Lyrics and Caption */}
        <label>
          Lyrics
          <textarea placeholder="Enter lyrics" />
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
                    <div className="privacy-desc">Anyone will be able to listen to this track.</div>
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
          <button className="cancel-btn">CANCEL</button>
        </div>
      </div>
    </div>
  );
};

export default SongUploadForm;
