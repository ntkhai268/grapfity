// import React, { useState} from "react";
// import ControlPlaylist from "./Manager_Playlists/ControlPlaylist";
// import PlaylistHeader from "./Manager_Playlists/HeaderPlaylist";
// import DataPlaylist from "./Manager_Playlists/DataPlaylist";
// import { getPlaylists } from "../components/Manager_Playlists/ManagerDataPlaylist";

// import "../styles/ManagerSongLayout.css";

// interface ManagerPlaylistSectionProps {
//   playlistId: number;
// }

// interface TrackItem {
//   title: string;
//   src: string;
//   artist: string;
//   cover: string;
// }

// interface PlaylistData {
//   id: number;
//   title: string;
//   artist: string;
//   timeAgo: string;
//   cover: string;
//   tracks: TrackItem[];
// }

// const ManagerPlaylistSection: React.FC<ManagerPlaylistSectionProps> = ({ playlistId }) => {
//   const [bgColor, setBgColor] = useState("#7D3218");

//   const playlists = getPlaylists();
//   const playlist = playlists.find((pl: PlaylistData) => pl.id === playlistId);

//   if (!playlist) {
//     return <div>Không tìm thấy playlist với id {playlistId}</div>;
//   }
  

//   return (
//     <div className="container">
//       <div className="song_side_playlist"
//          style={{
//           background: `linear-gradient(to bottom, ${bgColor}, var(--spotify-black) 70%)`,
//         }}
//       >
//         <div
//           className="Management_playlist"
//         >
//           <PlaylistHeader onColorExtract={setBgColor} />
//           <ControlPlaylist />
//           <DataPlaylist />
//         </div>
//       </div>
//     </div>
//   );
// };

// export default ManagerPlaylistSection;



import React, { useState } from "react";
import ControlPlaylist from "./Manager_Playlists/ControlPlaylist"; // Component điều khiển
import PlaylistHeader from "./Manager_Playlists/HeaderPlaylist";   // Component Header
import DataPlaylist from "./Manager_Playlists/DataPlaylist";     // Component hiển thị danh sách bài hát
// 1. Xóa import getPlaylists không còn tồn tại

// 2. Import Interfaces từ file chung (đảm bảo đường dẫn đúng)
import { PlaylistData, TrackItem } from "../components/Manager_Playlists/ManagerDataPlaylist";

import "../styles/ManagerSongLayout.css"; // Import CSS

// 3. (Tùy chọn) Xóa playlistId khỏi props nếu không cần thiết trực tiếp ở đây
// interface ManagerPlaylistSectionProps {
//  playlistId: number; // Prop này có thể không cần nữa
// }

// Bỏ định nghĩa interface cục bộ
// interface TrackItem { ... }
// interface PlaylistData { ... }

// Sử dụng props rỗng hoặc props cần thiết khác nếu có
const ManagerPlaylistSection: React.FC<{/* ManagerPlaylistSectionProps */}> = (/*{ playlistId }*/) => {
  // State quản lý màu nền, được cập nhật bởi PlaylistHeader
  const [bgColor, setBgColor] = useState("#7D3218"); // Màu mặc định ban đầu

  // 4. Xóa logic lấy và tìm playlist từ danh sách cứng
  // const playlists = getPlaylists();
  // const playlist = playlists.find((pl: PlaylistData) => pl.id === playlistId);

  // 5. Xóa khối kiểm tra playlist không còn cần thiết
  // if (!playlist) {
  //   return <div>Không tìm thấy playlist với id {playlistId}</div>;
  // }

  // Component này chỉ render layout và các thành phần con.
  // Các thành phần con (Header, Data) sẽ tự fetch dữ liệu dựa trên ID từ URL.
  return (
    <div className="container">
      <div className="song_side_playlist"
           style={{
             // Áp dụng gradient với màu nền được cập nhật từ Header
             background: `linear-gradient(to bottom, ${bgColor}, var(--spotify-black) 70%)`,
           }}
      >
        <div
          className="Management_playlist"
        >
          {/* PlaylistHeader sẽ fetch dữ liệu và gọi onColorExtract để cập nhật bgColor */}
          <PlaylistHeader onColorExtract={setBgColor} />
          {/* ControlPlaylist có thể cũng lấy ID từ URL hoặc nhận props khác */}
          <ControlPlaylist />
          {/* DataPlaylist sẽ fetch dữ liệu và hiển thị danh sách tracks */}
          <DataPlaylist />
        </div>
      </div>
    </div>
  );
};

export default ManagerPlaylistSection;
