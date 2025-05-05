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
import { useParams,useNavigate } from 'react-router-dom'; // Import thêm useNavigate nếu cần điều hướng sau khi xóa
import ControlPlaylist from "./Manager_Playlists/ControlPlaylist"; // Component điều khiển
import PlaylistHeader from "./Manager_Playlists/HeaderPlaylist";   // Component Header
import DataPlaylist from "./Manager_Playlists/DataPlaylist";     // Component hiển thị danh sách bài hát

import "../styles/ManagerSongLayout.css"; // Import CSS

// Component ManagerPlaylistSection
const ManagerPlaylistSection: React.FC = () => {
  // State quản lý màu nền, được cập nhật bởi PlaylistHeader
 
  const [bgColor, setBgColor] = useState("#7D3218");

  // Lấy playlistId từ tham số URL bằng useParams
  // Kiểu dữ liệu là string | undefined vì tham số có thể không tồn tại
  const { playlistId } = useParams<{ playlistId: string }>();

  // Sử dụng useNavigate để có thể điều hướng sau khi xóa (tùy chọn)
  const navigate = useNavigate();

  // Hàm callback để xử lý sau khi xóa playlist thành công
  const handlePlaylistDeleted = () => {
      console.log("Playlist đã được xóa thành công trong ManagerPlaylistSection.");
      // Ví dụ: Điều hướng người dùng về trang danh sách playlist hoặc trang chủ
      // navigate('/your-playlists-page'); // Thay đổi đường dẫn này cho phù hợp
      
      navigate("/profile");
  };


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
          {/* PlaylistHeader có thể cũng dùng useParams để lấy ID và fetch dữ liệu */}
          <PlaylistHeader onColorExtract={setBgColor} />

          {/* === SỬA ĐỔI QUAN TRỌNG === */}
          {/* Chỉ render ControlPlaylist nếu playlistId có giá trị (không phải undefined) */}
          {playlistId ? (
            <ControlPlaylist
              playlistId={playlistId} // Truyền playlistId (giờ chắc chắn là string)
              onDeleteSuccess={handlePlaylistDeleted} // Truyền hàm callback xử lý xóa thành công
            />
          ) : (
            // Hiển thị một thông báo hoặc trạng thái loading nếu ID không có
            // Ví dụ:
            <div className="controls controls-playlist">
                {/* Có thể hiển thị các nút bị vô hiệu hóa hoặc thông báo */}
                <p>Đang tải hoặc ID playlist không hợp lệ...</p>
            </div>
          )}
          {/* ========================== */}

          {/* DataPlaylist có thể cũng dùng useParams để lấy ID và fetch dữ liệu */}
          <DataPlaylist />
        </div>
      </div>
    </div>
  );
};

export default ManagerPlaylistSection;
