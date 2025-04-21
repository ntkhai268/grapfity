// import React, {
//   createContext,
//   useContext,
//   useEffect,
//   useRef,
//   useState,
//   ReactNode,
// } from "react";

// export type Song = {
//   title: string;
//   artist: string;
//   image: string;
//   audio: string;
// };

// type PlayerContextType = {
//   playlist: Song[];
//   currentIndex: number;
//   currentSong: Song | null;
//   isPlaying: boolean;
//   currentTime: number;
//   duration: number;
//   progress: number;
//   togglePlay: () => void;
//   nextSong: () => void;
//   prevSong: () => void;
//   setPlaylist: React.Dispatch<React.SetStateAction<Song[]>>;
//   setCurrentIndex: React.Dispatch<React.SetStateAction<number>>;
// };

// const PlayerContext = createContext<PlayerContextType | undefined>(undefined);

// export const PlayerProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
//   const [playlist, setPlaylist] = useState<Song[]>([]);
//   const [currentIndex, setCurrentIndex] = useState<number>(0);
//   const [isPlaying, setIsPlaying] = useState<boolean>(false);

//   const [currentTime, setCurrentTime] = useState<number>(0);
//   const [duration, setDuration] = useState<number>(0);
//   const [progress, setProgress] = useState<number>(0);

//   const audioRef = useRef<HTMLAudioElement | null>(null);
//   const currentSong = playlist[currentIndex] || null;

//   // Tạo hoặc cập nhật audio khi bài hát thay đổi
//   useEffect(() => {
//     let newAudio: HTMLAudioElement | null = null;
  
//     if (currentSong) {
//       if (audioRef.current) {
//         // Ngắt sự kiện cũ và dừng
//         audioRef.current.ontimeupdate = null;
//         audioRef.current.onended = null;
//         audioRef.current.pause();
//       }
  
//       newAudio = new Audio(currentSong.audio);
//       audioRef.current = newAudio;
  
//       newAudio.ontimeupdate = () => {
//         setCurrentTime(newAudio!.currentTime);
//         setDuration(newAudio!.duration || 0);
//         if (newAudio!.duration) {
//           setProgress((newAudio!.currentTime / newAudio!.duration) * 100);
//         }
//       };
  
//       newAudio.onended = () => {
//         nextSong();
//       };
  
//       if (isPlaying) {
//         newAudio.play().catch((err) => console.error("Playback error:", err));
//       }
//     }
  
//     // Cleanup audio khi currentSong thay đổi
//     return () => {
//       if (newAudio) {
//         newAudio.ontimeupdate = null;
//         newAudio.onended = null;
//         newAudio.pause();
//         newAudio.src = "";
//       }
//     };
//   }, [currentSong]);
  

//   // Phát / tạm dừng khi isPlaying thay đổi
//   useEffect(() => {
//     if (audioRef.current) {
//       if (isPlaying) {
//         audioRef.current.play().catch((err) => console.error("Playback error:", err));
//       } else {
//         audioRef.current.pause();
//       }
//     }
//   }, [isPlaying]);

//   const togglePlay = () => {
//     setIsPlaying((prev) => !prev);
//   };

//   const nextSong = () => {
//     if (currentIndex < playlist.length - 1) {
//       setCurrentIndex((prev) => prev + 1);
//     } else {
//       // Lặp lại bài hiện tại nếu đang ở cuối danh sách
//       if (audioRef.current) {
//         audioRef.current.currentTime = 0;
//         audioRef.current.play();
//       }
//     }
//   };

//   const prevSong = () => {
//     if (currentIndex > 0) {
//       setCurrentIndex((prev) => prev - 1);
//     } else {
//       // Lặp lại bài hiện tại nếu đang ở đầu
//       if (audioRef.current) {
//         audioRef.current.currentTime = 0;
//         audioRef.current.play();
//       }
//     }
//   };

//   return (
//     <PlayerContext.Provider
//       value={{
//         playlist,
//         currentIndex,
//         currentSong,
//         isPlaying,
//         currentTime,
//         duration,
//         progress,
//         togglePlay,
//         nextSong,
//         prevSong,
//         setPlaylist,
//         setCurrentIndex,
//       }}
//     >
//       {children}
//     </PlayerContext.Provider>
//   );
// };

// export const usePlayer = () => {
//   const context = useContext(PlayerContext);
//   if (!context) throw new Error("usePlayer must be used inside PlayerProvider");
//   return context;
// };
