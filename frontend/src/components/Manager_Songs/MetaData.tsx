// src/components/Manager_Songs/Metadata.tsx (Ví dụ)
import React, { useState, ChangeEvent } from 'react';
import '../../styles/MetaData.css'; // CSS riêng của Metadata

// Kiểu dữ liệu trả về
export interface AudioFeaturesData {
  explicit: boolean; key: number; danceability: number | null; energy: number | null;
  loudness: number | null;mode: number |null; tempo: number | null; timeSignature: number | null;
  acousticness: number | null; instrumentalness: number | null; liveness: number | null;
  speechiness: number | null; valence: number | null;
  lyrics: string | null;
}

// Props interface
interface MetadataProps {
  onCancel?: () => void;
  onOk: (data: AudioFeaturesData) => void; // Bắt buộc phải có onOk
  // trackId?: string;
}

const Metadata: React.FC<MetadataProps> = ({ onCancel, onOk }) => {
  // State cho các trường audio features...
  const [isExplicit, setIsExplicit] = useState<boolean>(false);
  const [keyValue, setKeyValue] = useState<string>('C');
  const [danceability, setDanceability] = useState<string>('');
  const [energy, setEnergy] = useState<string>('');
  const [loudness, setLoudness] = useState<string>('');
  const [mode, setMode] = useState<number>(1); // 1 = Major mặc định
  const [tempo, setTempo] = useState<string>('');
  const [timeSignature, setTimeSignature] = useState<string>('4/4');
  const [acousticness, setAcousticness] = useState<string>('');
  const [instrumentalness, setInstrumentalness] = useState<string>('');
  const [liveness, setLiveness] = useState<string>('');
  const [speechiness, setSpeechiness] = useState<string>('');
  const [valence, setValence] = useState<string>('');
  const [lyrics, setLyrics] = useState<string>('');

  const parseNumericInput = (value: string): number | null => {
      const trimmed = value.trim();
      if (trimmed === '') return null;
      const num = parseFloat(trimmed);
      return isNaN(num) ? null : num;
  };

  const handleOkClick = () => {
  const keyToIntMap: Record<string, number> = {
    C: 0, "C#": 1, D: 2, "D#": 3, E: 4, F: 5,
    "F#": 6, G: 7, "G#": 8, A: 9, "A#": 10, B: 11
  };

  const metadataPayload: AudioFeaturesData = {
    explicit: isExplicit, // đổi tên field cho đúng với DB (bit)
    key: keyToIntMap[keyValue], // map từ "C" → 0
    mode: mode, // nên có state mode: number (0 | 1), nếu chưa có thì thêm
    danceability: parseNumericInput(danceability),
    energy: parseNumericInput(energy),
    loudness: parseNumericInput(loudness),
    tempo: parseNumericInput(tempo),
    timeSignature: parseInt(timeSignature.split('/')[0]) || 4, // "4/4" → 4
    acousticness: parseNumericInput(acousticness),
    instrumentalness: parseNumericInput(instrumentalness),
    liveness: parseNumericInput(liveness),
    speechiness: parseNumericInput(speechiness),
    valence: parseNumericInput(valence),
    lyrics: lyrics.trim() || null
  };

  onOk(metadataPayload); // Gửi dữ liệu lên component cha
};


  const renderMetadataForm = () => (
    <div className="metadata-form-container metadata-two-columns">
      {/* Explicit */}
      <div className="metadata-field-group">
        <div className="metadata-checkbox-label-group">
           <input type="checkbox" id="isExplicit" checked={isExplicit} onChange={(e: ChangeEvent<HTMLInputElement>) => setIsExplicit(e.target.checked)} className="metadata-form-checkbox"/>
           <label htmlFor="isExplicit" className="metadata-field-label">Explicit</label>
        </div>
        <input type="text" className="metadata-form-input" value={isExplicit ? "Có nội dung nhạy cảm" : "Không có nội dung nhạy cảm"} readOnly />
      </div>
      {/* Key */}
      <div className="metadata-field-group">
        <label htmlFor="key" className="metadata-field-label">Key</label>
         <div className="metadata-select-wrapper">
            <select id="key" value={keyValue} onChange={(e) => setKeyValue(e.target.value)} className="metadata-form-select">
                <option value="C">C</option><option value="C#">C#</option><option value="D">D</option><option value="D#">D#</option><option value="E">E</option><option value="F">F</option><option value="F#">F#</option><option value="G">G</option><option value="G#">G#</option><option value="A">A</option><option value="A#">A#</option><option value="B">B</option>
            </select>
             <span className="metadata-select-arrow" aria-hidden="true">▼</span>
        </div>
      </div>
       {/* Các trường còn lại */}
       <div className="metadata-field-group"><label htmlFor="danceability" className="metadata-field-label">Danceability</label><input type="number" min="0" max="1" step="0.01" id="danceability" value={danceability} onChange={(e) => setDanceability(e.target.value)} className="metadata-form-input" placeholder="0-1" /></div>
       <div className="metadata-field-group"><label htmlFor="loudness" className="metadata-field-label">Loudness (dB)</label><input type="number" step="0.1" id="loudness" value={loudness} onChange={(e) => setLoudness(e.target.value)} className="metadata-form-input" placeholder="—" /></div>
       <label className="metadata-field-group">
          <span className="metadata-field-label">Mode</span>
          <select value={mode} onChange={(e) => setMode(Number(e.target.value))} className="metadata-form-select">
            <option value={1}>Major</option>
            <option value={0}>Minor</option>
          </select>
        </label>
       <div className="metadata-field-group"><label htmlFor="energy" className="metadata-field-label">Energy</label><input type="number" min="0" max="1" step="0.01" id="energy" value={energy} onChange={(e) => setEnergy(e.target.value)} className="metadata-form-input" placeholder="0-1" /></div>
       <div className="metadata-field-group"><label htmlFor="tempo" className="metadata-field-label">Tempo</label><input type="number" step="0.1" id="tempo" value={tempo} onChange={(e) => setTempo(e.target.value)} className="metadata-form-input" placeholder="(BPM)" /></div>
       <div className="metadata-field-group"><label htmlFor="timeSignature" className="metadata-field-label">Time Signature</label><input type="text" id="timeSignature" value={timeSignature} onChange={(e) => setTimeSignature(e.target.value)} className="metadata-form-input" placeholder='e.g. 4/4'/></div>
       <div className="metadata-field-group"><label htmlFor="acousticness" className="metadata-field-label">Acousticness</label><input type="number" min="0" max="1" step="0.01" id="acousticness" value={acousticness} onChange={(e) => setAcousticness(e.target.value)} className="metadata-form-input" placeholder="0-1" /></div>
       <div className="metadata-field-group"><label htmlFor="instrumentalness" className="metadata-field-label">Instrumentalness</label><input type="number" min="0" max="1" step="0.01" id="instrumentalness" value={instrumentalness} onChange={(e) => setInstrumentalness(e.target.value)} className="metadata-form-input" placeholder="0-1" /></div>
       <div className="metadata-field-group"><label htmlFor="liveness" className="metadata-field-label">Liveness</label><input type="number" min="0" max="1" step="0.01" id="liveness" value={liveness} onChange={(e) => setLiveness(e.target.value)} className="metadata-form-input" placeholder="0-1" /></div>
       <div className="metadata-field-group"><label htmlFor="speechiness" className="metadata-field-label">Speechiness</label><input type="number" min="0" max="1" step="0.01" id="speechiness" value={speechiness} onChange={(e) => setSpeechiness(e.target.value)} className="metadata-form-input" placeholder="0-1" /></div>
       <div className="metadata-field-group"><label htmlFor="valence" className="metadata-field-label">Valence</label><input type="number" min="0" max="1" step="0.01" id="valence" value={valence} onChange={(e) => setValence(e.target.value)} className="metadata-form-input" placeholder="0-1" /></div>
       
       <div className="metadata-field-group full-width">
          <label htmlFor="lyrics" className="metadata-field-label">Lyrics</label>
          <textarea
            id="lyrics"
            value={lyrics}
            onChange={(e) => setLyrics(e.target.value)}
            className="metadata-form-textarea"
            placeholder="Enter lyrics here..."
            rows={4}
          />
        </div>
    </div>
    
  );

  const renderFooter = () => (
     <div className="metadata-form-footer">
        <div></div>
        <div className="metadata-footer-buttons">
            {/* Nút Cancel nếu cần */}
            { onCancel && <button type="button" className="metadata-form-button metadata-form-button-cancel" onClick={onCancel}>Cancel</button> }
            <button type="button" className="metadata-form-button metadata-form-button-ok" onClick={handleOkClick}>OK</button>
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