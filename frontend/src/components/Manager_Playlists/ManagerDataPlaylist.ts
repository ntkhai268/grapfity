// // types
// export interface TrackItem {
//   title: string;
//   src: string;
//   artist: string;
//   cover: string;
// }

// export interface PlaylistData {
//   id: number;
//   title: string;
//   artist: string;
//   timeAgo: string;
//   cover: string;
//   tracks: TrackItem[];
// }

// // ✅ Danh sách playlist hiện có
// let playlists: PlaylistData[] = [
//   {
//     id: 1,
//     title: "MUSICAS PARA CHURRASCO 🔥",
//     artist: "Funk Trapstar",
//     timeAgo: "11 months ago",
//     cover: "/assets/blue.png",
//     tracks: [
//       {
//         title: "Em Gì Ơi (Jack)",
//         src: "assets/EmGiOi.mp3",
//         artist: "Jack",
//         cover: "/assets/anhmau.png",
//       },
//       {
//         title: "Hồng Nhan (K-ICM, Jack)",
//         src: "/assets/HongNhan.mp3",
//         artist: "K-ICM, Jack",
//         cover: "/assets/anhmau.png",
//       },
//       {
//         title: "Sóng Gió (K-ICM)",
//         src: "/assets/SongGio.mp3",
//         artist: "K-ICM",
//         cover: "/assets/anhmau.png",
//       },
//       {
//         title: "Lạc Trôi (Sơn Tùng M-TP)",
//         src: "/assets/LacTroi.mp3",
//         artist: "Sơn Tùng M-TP",
//         cover: "/assets/anhmau.png",
//       },
//       {
//         title: "Cô Thắm Không Về (Chưa Xác Định)",
//         src: "/assets/CoThamKhongVe.mp3",
//         artist: "Chưa Xác Định",
//         cover: "/assets/blue.png",
//       },
//       {
//         title: "Bạc Phận (version rap)",
//         src: "/assets/BacPhanRapVersion-TuiHat-6184759.mp3",
//         artist: "Jack, K-ICM",
//         cover: "/assets/anhmau.png",
//       },
//       {
//         title: "Bánh Mì Không (Du Uyên, Đạt G)",
//         src: "/assets/Bánh Mì Không.mp3",
//         artist: "Du Uyên, Đạt G",
//         cover: "/assets/anhmau.png",
//       },
//     ],
//   },
//   {
//     id: 2,
//     title: "Chill Vibes",
//     artist: "Lo-fi Beats",
//     timeAgo: "2 months ago",
//     cover: "/assets/blue.png",
//     tracks: [
//       {
//         title: "Sự Nghiệp Chướng (Pháo)",
//         src: "/assets/SuNghiepChuong.mp3",
//         artist: "Pháo",
//         cover: "/assets/anhmau.png",
//       },
//     ],
//   },
//   {
//     id: 3,
//     title: "Rap Việt Collection",
//     artist: "Various Artists",
//     timeAgo: "5 months ago",
//     cover: "/assets/anhmau.png",
//     tracks: [
//       {
//         title: "Mạnh Bà (Linh Hương Luz)",
//         src: "/assets/ManhBa.mp3",
//         artist: "Linh Hương Luz",
//         cover: "/assets/anhmau.png",
//       },
//       {
//         title: "Sự Nghiệp Chướng (Pháo)",
//         src: "/assets/SuNghiepChuong.mp3",
//         artist: "Pháo",
//         cover: "/assets/anhmau.png",
//       },
//     ],
//   },
// ];

// // ✅ Hàm truy cập danh sách playlist
// export const getPlaylists = (): PlaylistData[] => playlists;

// // ✅ Hàm tìm playlist theo ID
// export const getPlaylistById = (id: number): PlaylistData | undefined =>
//   playlists.find((p) => p.id === id);

// // ✅ Hàm tạo playlist mới
// export const addPlaylist = (): PlaylistData => {
//   const newPlaylist: PlaylistData = {
//     id: Math.max(...playlists.map((p) => p.id), 0) + 1,
//     title: "Playlist mới",
//     artist: "Chưa có nghệ sĩ",
//     timeAgo: "Vừa tạo",
//     cover: "/assets/anhmau.png",
//     tracks: [],
//   };

//   playlists.push(newPlaylist);
//   return newPlaylist;
// };


// types (Giữ nguyên các định nghĩa kiểu dữ liệu này,
// nhưng có thể cần điều chỉnh chúng sau này khi bạn biết chính xác
// cấu trúc dữ liệu JSON trả về từ API backend)
export interface TrackItem {
  id: number | string; // Thêm ID cho track có thể hữu ích
  title: string;
  src: string;         // Sẽ map với trackUrl từ API
  artist: string;      // Sẽ map với track.User.userName từ API
  cover: string;       // Sẽ map với track.imageUrl từ API
  uploaderId?: number | string;

}

export interface PlaylistData {
  id: number;          // ID từ database
  title: string;
  artist: string;      // Có thể lấy từ playlist.User.userName hoặc bỏ đi nếu không cần ở cấp playlist
  uploaderId?: number;     // 👈 ID của người tạo playlist 
  timeAgo: string;     // Sẽ được tính toán ở frontend từ createDate của API
  cover: string;       // Sẽ map với playlist.imageUrl từ API
  imageUrl?: string | null;
   privacy?: 'public' | 'private';
  tracks: TrackItem[];   // Danh sách các track lấy từ API
  // Có thể thêm các trường khác mà API trả về, ví dụ:
  // createDate?: string | Date;
  // user?: { userName: string }; // Nếu API trả về thông tin user tạo playlist
}

// ⛔️ Đã xóa bỏ: Danh sách playlist cứng (hardcoded array)
// let playlists: PlaylistData[] = [ ... ];

// ⛔️ Đã xóa bỏ: Hàm truy cập danh sách playlist cứng
// export const getPlaylists = (): PlaylistData[] => playlists;

// ⛔️ Đã xóa bỏ: Hàm tìm playlist theo ID trong danh sách cứng
// export const getPlaylistById = (id: number): PlaylistData | undefined =>
//   playlists.find((p) => p.id === id);

// ⛔️ Đã xóa bỏ: Hàm tạo playlist mới trong danh sách cứng
// export const addPlaylist = (): PlaylistData => { ... };


// ----- NƠI ĐỂ THÊM CÁC HÀM GỌI API MỚI -----
// Ví dụ:
/*
import { PlaylistData, TrackItem } from './interfaces'; // Đảm bảo đường dẫn đúng

const API_BASE_URL = 'YOUR_API_ENDPOINT'; // Thay bằng URL API backend của bạn

export const getPlaylistsForUserAPI = async (userId: string | number): Promise<PlaylistData[]> => {
    // ... code fetch API GET /api/playlists?userId=... ở đây
    // ... xử lý response, map dữ liệu JSON sang PlaylistData[]
    // ... xử lý lỗi
    console.log("Gọi API để lấy playlists cho user:", userId);
    // Placeholder:
    return [];
};

export const createPlaylistAPI = async (userId: string | number, trackId?: string | number | null): Promise<PlaylistData | null> => {
    // ... code fetch API POST /api/playlists với body { userId, trackId } ở đây
    // ... xử lý response, map dữ liệu JSON sang PlaylistData
    // ... xử lý lỗi
     console.log("Gọi API để tạo playlist cho user:", userId, "từ track:", trackId);
     // Placeholder:
    return null;
};

// ... Thêm các hàm gọi API khác (addTrack, removeTrack, update, delete...)
*/

// Nếu bạn muốn giữ lại file này chỉ để chứa type, bạn có thể xóa hết phần ví dụ API
// và di chuyển các hàm gọi API sang một file riêng (ví dụ: services/playlistService.ts)