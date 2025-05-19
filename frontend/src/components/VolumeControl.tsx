import React, { useEffect, useRef, useState } from "react";

interface VolumeControlProps {
    audioRef: React.RefObject<HTMLAudioElement | null>;
    volume: number;
    setVolume: (val: number) => void;
}

const VolumeControl: React.FC<VolumeControlProps> = ({ audioRef, volume, setVolume }) => {
  const [isMuted, setIsMuted] = useState(false);
  const [prevVolume, setPrevVolume] = useState(1);
  const rangeRef = useRef<HTMLInputElement>(null);

  const toggleMute = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    if (nextMuted) {
        setPrevVolume(volume)
        setVolume(0); // Gửi volume = 0 cho parent (audioRef sẽ được cập nhật luôn)
    } else {
      setVolume(prevVolume);
    }
  };

  useEffect(() => {
    const percent = (isMuted ? 0 : volume) * 100;
    if (rangeRef.current) {
      rangeRef.current.style.background = `linear-gradient(to right, green ${percent}%, white ${percent}%)`;
    }
  }, [volume, isMuted]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  return (
    <div className="volume-control">
      <button onClick={toggleMute} className="volume-icon" title={isMuted ? "Unmute" : "Mute"}>
        <svg viewBox="0 0 16 16" width="18" height="18" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
          <path d="M9.741.85a.75.75 0 0 1 .375.65v13a.75.75 0 0 1-1.125.65l-6.925-4a3.642 3.642 0 0 1-1.33-4.967 3.639 3.639 0 0 1 1.33-1.332l6.925-4a.75.75 0 0 1 .75 0zm-6.924 5.3a2.139 2.139 0 0 0 0 3.7l5.8 3.35V2.8l-5.8 3.35zm8.683 4.29V5.56a2.75 2.75 0 0 1 0 4.88z"></path>
          {isMuted && (
            <path d="M13.86 5.47a.75.75 0 0 0-1.061 0l-1.47 1.47-1.47-1.47A.75.75 0 0 0 8.8 6.53L10.269 8l-1.47 1.47a.75.75 0 1 0 1.06 1.06l1.47-1.47 1.47 1.47a.75.75 0 0 0 1.06-1.06L12.39 8l1.47-1.47a.75.75 0 0 0 0-1.06z"></path>
          )}
        </svg>
      </button>
      <input
        ref={rangeRef}
        type="range"
        min="0"
        max="1"
        step="0.01"
        value={isMuted ? 0 : volume}
        onChange={(e) => {
          const val = parseFloat(e.target.value);
          setVolume(val);
          setIsMuted(val === 0);
        }}
      />
    </div>
  );
};

export default VolumeControl;
