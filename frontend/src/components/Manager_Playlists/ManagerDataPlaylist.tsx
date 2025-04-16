export interface TrackItem {
  title: string;
  src: string;
  artist: string;
  cover: string;
}

export interface PlaylistData {
  id: number;
  title: string;
  artist: string;
  timeAgo: string;
  cover: string; // ✅ Thêm cover cho playlist
  tracks: TrackItem[];
}

export const playlists: PlaylistData[] = [
  {
    id: 1,
    title: "MUSICAS PARA CHURRASCO 🔥",
    artist: "Funk Trapstar",
    timeAgo: "11 months ago",
    cover: "/assets/anhmau.png", // ✅ Playlist cover
    tracks: [
      {
        title: "Em Gì Ơi (Jack)",
        src: "assets/EmGiOi.mp3",
        artist: "Jack",
        cover: "/assets/anhmau.png",
      },
      {
        title: "Hồng Nhan (K-ICM, Jack)",
        src: "/assets/HongNhan.mp3",
        artist: "K-ICM, Jack",
        cover: "/assets/anhmau.png",
      },
      {
        title: "Sóng Gió (K-ICM)",
        src: "/assets/SongGio.mp3",
        artist: "K-ICM",
        cover: "/assets/anhmau.png",
      },
      {
        title: "Lạc Trôi (Sơn Tùng M-TP)",
        src: "/assets/LacTroi.mp3",
        artist: "Sơn Tùng M-TP",
        cover: "/assets/anhmau.png",
      },
      {
        title: "Cô Thắm Không Về (Chưa Xác Định)",
        src: "/assets/CoThamKhongVe.mp3",
        artist: "Chưa Xác Định",
        cover: "/assets/anhmau.png",
      },
      {
        title: "Bạc Phận (version rap)",
        src: "/assets/BacPhanRapVersion-TuiHat-6184759.mp3",
        artist: "Jack, K-ICM",
        cover: "/assets/anhmau.png",
      },
      {
        title: "Bánh Mì Không (Du Uyên, Đạt G)",
        src: "/assets/Bánh Mì Không.mp3",
        artist: "Du Uyên, Đạt G",
        cover: "/assets/anhmau.png",
      },
    ],
  },
  {
    id: 2,
    title: "MUSICAS PARA CHURRASCO 🔥",
    artist: "Funk Trapstar",
    timeAgo: "11 months ago",
    cover: "/assets/anhmau.png", // ✅ Playlist cover
    tracks: [
      {
        title: "Sự Nghiệp Chướng (Pháo)",
        src: "/assets/SuNghiepChuong.mp3",
        artist: "Pháo",
        cover: "/assets/anhmau.png",
      },
    ],
  },
  {
    id: 3,
    title: "MUSICAS PARA CHURRASCO 🔥",
    artist: "Funk Trapstar",
    timeAgo: "11 months ago",
    cover: "/assets/anhmau.png", // ✅ Playlist cover
    tracks: [
      {
        title: "Mạnh Bà (Linh Hương Luz)",
        src: "/assets/ManhBa.mp3",
        artist: "Linh Hương Luz",
        cover: "/assets/anhmau.png",
      },
      {
        title: "Sự Nghiệp Chướng (Pháo)",
        src: "/assets/SuNghiepChuong.mp3",
        artist: "Pháo",
        cover: "/assets/anhmau.png",
      },
    ],
  },
];
