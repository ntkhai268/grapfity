// src/components/Manager_Songs/Metadata.tsx (Ví dụ)
import React, { useState, ChangeEvent } from "react";
import "../../styles/MetaData.css"; // CSS riêng của Metadata

// Kiểu dữ liệu trả về
export interface AudioFeaturesData {
  explicit: boolean;
  key: number | null;
  danceability: number | null;
  energy: number | null;
  loudness: number | null;
  tempo: number | null;
  time_signature: number | null;
  acousticness: number | null;
  instrumentalness: number | null;
  liveness: number | null;
  speechiness: number | null;
  valence: number | null;
  mode: number;
}

// Props interface
interface MetadataProps {
  onCancel?: () => void;
  onOk: (data: AudioFeaturesData) => void; // Bắt buộc phải có onOk
  // trackId?: string;
}

const Metadata: React.FC<MetadataProps> = ({ onCancel, onOk }) => {
  // State cho các trường audio features...
  const [explicit, setExplicit] = useState<boolean>(false);
  const [keyValue, setKeyValue] = useState<string>("");
  const [danceability, setDanceability] = useState<string>("");
  const [energy, setEnergy] = useState<string>("");
  const [loudness, setLoudness] = useState<string>("");
  const [tempo, setTempo] = useState<string>("");
  const [time_signature, setTimeSignature] = useState<string>("");
  const [acousticness, setAcousticness] = useState<string>("");
  const [instrumentalness, setInstrumentalness] = useState<string>("");
  const [liveness, setLiveness] = useState<string>("");
  const [speechiness, setSpeechiness] = useState<string>("");
  const [valence, setValence] = useState<string>("");
  const [mode, setMode] = useState<number>(0);

  const parseNumericInput = (value: string): number | null => {
    const trimmed = value.trim();
    if (trimmed === "") return null;
    const num = parseFloat(trimmed);
    return isNaN(num) ? null : num;
  };

  const handleOkClick = () => {
    const metadataPayload: AudioFeaturesData = {
      explicit,
      key: parseNumericInput(keyValue),
      danceability: parseNumericInput(danceability),
      energy: parseNumericInput(energy),
      loudness: parseNumericInput(loudness),
      tempo: parseNumericInput(tempo),
      time_signature: parseNumericInput(time_signature),
      acousticness: parseNumericInput(acousticness),
      instrumentalness: parseNumericInput(instrumentalness),
      liveness: parseNumericInput(liveness),
      speechiness: parseNumericInput(speechiness),
      valence: parseNumericInput(valence),
      mode: mode ? 1 : 0, // nếu backend yêu cầu kiểu number
    };
    onOk(metadataPayload); // Gọi prop onOk để gửi dữ liệu về cha
  };

  const renderMetadataForm = () => (
    <div className="metadata-form-container metadata-two-columns">
      {/* Explicit */}
      <div className="metadata-field-group">
        <div className="metadata-checkbox-label-group">
          <input
            type="checkbox"
            id="explicit"
            checked={explicit}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              setExplicit(e.target.checked)
            }
            className="metadata-form-checkbox"
          />
          <label htmlFor="explicit" className="metadata-field-label">
            Explicit
          </label>
        </div>
        <input
          type="text"
          className="metadata-form-input"
          value={
            explicit ? "Có nội dung nhạy cảm" : "Không có nội dung nhạy cảm"
          }
          readOnly
        />
      </div>
      {/* Key */}
      <div className="metadata-field-group">
        <label htmlFor="key" className="metadata-field-label">
          Key
        </label>
        <div className="metadata-select-wrapper">
          <select
            id="key"
            value={keyValue}
            onChange={(e) => setKeyValue(e.target.value)}
            className="metadata-form-select"
          >
            <option value="0">0</option>
            <option value="1">1</option>
            <option value="2">2</option>
            <option value="3">3</option>
            <option value="4">4</option>
            <option value="5">5</option>
            <option value="6">6</option>
            <option value="7">7</option>
            <option value="8">8</option>
            <option value="9">9</option>
            <option value="10">10</option>
            <option value="11">11</option>
          </select>
          <span className="metadata-select-arrow" aria-hidden="true">
            ▼
          </span>
        </div>
      </div>
      {/* Các trường còn lại */}
      <div className="metadata-field-group">
        <label htmlFor="danceability" className="metadata-field-label">
          Danceability
        </label>
        <input
          type="number"
          min="0"
          max="1"
          step="0.01"
          id="danceability"
          value={danceability}
          onChange={(e) => setDanceability(e.target.value)}
          className="metadata-form-input"
          placeholder="0-1"
        />
      </div>
      <div className="metadata-field-group">
        <label htmlFor="loudness" className="metadata-field-label">
          Loudness (dB)
        </label>
        <input
          type="number"
          step="0.1"
          min="0"
          max="1"
          id="loudness"
          value={loudness}
          onChange={(e) => setLoudness(e.target.value)}
          className="metadata-form-input"
          placeholder="—"
        />
      </div>
      <div className="metadata-field-group">
        <label htmlFor="energy" className="metadata-field-label">
          Energy
        </label>
        <input
          type="number"
          min="0"
          max="1"
          step="0.01"
          id="energy"
          value={energy}
          onChange={(e) => setEnergy(e.target.value)}
          className="metadata-form-input"
          placeholder="0-1"
        />
      </div>
      <div className="metadata-field-group">
        <label htmlFor="tempo" className="metadata-field-label">
          Tempo
        </label>
        <input
          type="number"
          step="0.1"
          min="0"
          max="249"
          id="tempo"
          value={tempo}
          onChange={(e) => setTempo(e.target.value)}
          className="metadata-form-input"
          placeholder="(BPM)"
        />
      </div>
      <div className="metadata-field-group">
        <label htmlFor="time_signature" className="metadata-field-label">
          Time Signature
        </label>
        <input
          type="number"
          step="1"
          min="0"
          max="5"
          id="time_signature"
          value={time_signature}
          onChange={(e) => setTimeSignature(e.target.value)}
          className="metadata-form-input"
          placeholder="e.g. 4/4"
        />
      </div>
      <div className="metadata-field-group">
        <label htmlFor="acousticness" className="metadata-field-label">
          Acousticness
        </label>
        <input
          type="number"
          min="0"
          max="1"
          step="0.01"
          id="acousticness"
          value={acousticness}
          onChange={(e) => setAcousticness(e.target.value)}
          className="metadata-form-input"
          placeholder="0-1"
        />
      </div>
      <div className="metadata-field-group">
        <label htmlFor="instrumentalness" className="metadata-field-label">
          Instrumentalness
        </label>
        <input
          type="number"
          min="0"
          max="1"
          step="0.01"
          id="instrumentalness"
          value={instrumentalness}
          onChange={(e) => setInstrumentalness(e.target.value)}
          className="metadata-form-input"
          placeholder="0-1"
        />
      </div>
      <div className="metadata-field-group">
        <label htmlFor="liveness" className="metadata-field-label">
          Liveness
        </label>
        <input
          type="number"
          min="0"
          max="1"
          step="0.01"
          id="liveness"
          value={liveness}
          onChange={(e) => setLiveness(e.target.value)}
          className="metadata-form-input"
          placeholder="0-1"
        />
      </div>
      <div className="metadata-field-group">
        <label htmlFor="speechiness" className="metadata-field-label">
          Speechiness
        </label>
        <input
          type="number"
          min="0"
          max="1"
          step="0.01"
          id="speechiness"
          value={speechiness}
          onChange={(e) => setSpeechiness(e.target.value)}
          className="metadata-form-input"
          placeholder="0-1"
        />
      </div>
      <div className="metadata-field-group">
        <label htmlFor="valence" className="metadata-field-label">
          Valence
        </label>
        <input
          type="number"
          min="0"
          max="1"
          step="0.01"
          id="valence"
          value={valence}
          onChange={(e) => setValence(e.target.value)}
          className="metadata-form-input"
          placeholder="0-1"
        />
      </div>
      <div className="metadata-checkbox-label-group">
        <input
          type="checkbox"
          id="mode"
          checked={mode === 1}
          onChange={(e: ChangeEvent<HTMLInputElement>) =>
            setMode(e.target.checked ? 1 : 0)
          }
          className="metadata-form-checkbox"
        />
        <label htmlFor="mode" className="metadata-field-label">
          Mode (Major / Minor)
        </label>
      </div>
      <input
        type="text"
        className="metadata-form-input"
        value={mode === 1 ? "Major (1)" : "Minor (0)"}
        readOnly
      />
    </div>
  );

  const renderFooter = () => (
    <div className="metadata-form-footer">
      <div></div>
      <div className="metadata-footer-buttons">
        {/* Nút Cancel nếu cần */}
        {onCancel && (
          <button
            type="button"
            className="metadata-form-button metadata-form-button-cancel"
            onClick={onCancel}
          >
            Cancel
          </button>
        )}
        <button
          type="button"
          className="metadata-form-button metadata-form-button-ok"
          onClick={handleOkClick}
        >
          OK
        </button>
      </div>
    </div>
  );

  return (
    <div className="metadata-container">
      <h2 className="metadata-section-title">Metadata</h2>
      {renderMetadataForm()}
      {renderFooter()}
    </div>
  );
};

export default Metadata;
