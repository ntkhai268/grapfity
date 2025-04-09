// src/context/PlayerContext.tsx
import React, { createContext, useContext, useState, ReactNode } from "react";

type Song = {
  title: string;
  artist: string;
  image: string;
  audio: string;
};

type PlayerContextType = {
  playlist: Song[];
  currentIndex: number;
  currentSong: Song | null;
  setPlaylist: React.Dispatch<React.SetStateAction<Song[]>>;
  setCurrentIndex: React.Dispatch<React.SetStateAction<number>>;
};

const PlayerContext = createContext<PlayerContextType | undefined>(undefined);

export const PlayerProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [playlist, setPlaylist] = useState<Song[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);

  const currentSong = playlist[currentIndex] || null;

  return (
    <PlayerContext.Provider
      value={{ playlist, currentIndex, currentSong, setPlaylist, setCurrentIndex }}
    >
      {children}
    </PlayerContext.Provider>
  );
};

export const usePlayer = () => {
  const context = useContext(PlayerContext);
  if (!context) throw new Error("usePlayer must be used inside PlayerProvider");
  return context;
};
