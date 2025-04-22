// types
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
  cover: string;
  tracks: TrackItem[];
}

// ✅ Danh sách playlist hiện có
let playlists: PlaylistData[] = [
  {
    id: 1,
    title: "MUSICAS PARA CHURRASCO 🔥",
    artist: "Funk Trapstar",
    timeAgo: "11 months ago",
    cover: "/assets/anhmau.png",
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
    title: "Chill Vibes",
    artist: "Lo-fi Beats",
    timeAgo: "2 months ago",
    cover: "/assets/anhmau.png",
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
    title: "Rap Việt Collection",
    artist: "Various Artists",
    timeAgo: "5 months ago",
    cover: "/assets/anhmau.png",
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

// ✅ Hàm truy cập danh sách playlist
export const getPlaylists = (): PlaylistData[] => playlists;

// ✅ Hàm tìm playlist theo ID
export const getPlaylistById = (id: number): PlaylistData | undefined =>
  playlists.find((p) => p.id === id);

// ✅ Hàm tạo playlist mới
export const addPlaylist = (): PlaylistData => {
  const newPlaylist: PlaylistData = {
    id: Math.max(...playlists.map((p) => p.id), 0) + 1,
    title: "Playlist mới",
    artist: "Chưa có nghệ sĩ",
    timeAgo: "Vừa tạo",
    cover: "/assets/anhmau.png",
    tracks: [],
  };

  playlists.push(newPlaylist);
  return newPlaylist;
};
