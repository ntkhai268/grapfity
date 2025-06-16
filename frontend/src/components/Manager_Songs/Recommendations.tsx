import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import GlobalAudioManager from "../../hooks/GlobalAudioManager";

import {getTrackRecommendationsAPI} from "../../services/listeningService";
import { mapTrackDataToSong } from "../Section"; // hoặc copy lại hàm nếu khác file
import { TrackData } from "../../services/trackServiceAPI";
import { encodeBase62WithPrefix  } from "../../hooks/base62";

interface RecomendProps {
  trackId: string | number; // Lyrics sẽ nhận trackId từ component cha
}

interface ISong {
  id: number | string;
  src: string;
  number?: number; // Tự động gán số thứ tự
  cover?: string;
  title?: string;
  artist?: string;
  stats?: string;
  duration?: string;
}
const Recommendations: React.FC<RecomendProps> = ({trackId}) => {
  const navigate = useNavigate();
  const [songs, setSongs] = useState<ISong[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    const fetchSongs = async () => {
      setLoading(true);
      try {
        const data: TrackData[] = await getTrackRecommendationsAPI(trackId);
        // Map sang ISong, bổ sung số thứ tự (number)
        const mappedSongs: ISong[] = data.map((track, idx) => ({
          ...mapTrackDataToSong(track),
          number: idx + 1,
       
        }));
        setSongs(mappedSongs);
      } catch (err) {
        setSongs([]);
        // Có thể hiện lỗi tùy ý
      } finally {
        setLoading(false);
      }
    };
    fetchSongs();
  }, []);

  const handleClick = (index: number) => {
    const song = songs[index];
     const context = {
      id: `managerSongrecommend-${song.id}`,
      type: "queue"
    };
    GlobalAudioManager.setPlaylist(songs, index, context);
    GlobalAudioManager.playSongAt(index);
    const encodedId = encodeBase62WithPrefix(Number(song.id), 22); 
    navigate(`/ManagerSong/${encodedId}`, {
      state: {
        songs,
        currentIndex: index,
        currentSong: song,
      },
    });
  };

  const displaySongs = expanded ? songs.slice(0, 10) : songs.slice(0, 4);
return (
    <div className="popular-songs">
      <h2>Đề xuất</h2>
      <div className="song-list-manager">
        {loading ? (
          <div>Đang tải...</div>
        ) : displaySongs.length === 0 ? (
          <div>Không có bài hát nào.</div>
        ) : (
          displaySongs.map((song, index) => (
            <div
              key={song.id}
              className="song-item-manager"
              onClick={() => handleClick(index)}
            >
              <div className="song-number">{song.number ?? index + 1}</div>
              <img src={song.cover || '/assets/anhmau.png'} alt={song.title} className="rec-song-image" />
              <div className="rec-song-info">
                <div className="rec-song-title">{song.title}</div>
                <div className="rec-song-artist">{song.artist}</div>
              </div>
              <div className="song-stats">{song.stats ?? ''}</div>
              <div className="song-duration">{song.duration ?? ''}</div>
            </div>
          ))
        )}
      </div>
      {/* Nút Xem thêm / Thu gọn */}
      {songs.length > 4 && (
        <button
          style={{ margin: "10px auto", display: "block", background: "none", border: "none", color: "rgba(255,255,255,0.7)", cursor: "pointer", fontWeight: 600 }}
          onClick={() => setExpanded((e) => !e)}
        >
          {expanded ? "Thu gọn" : "Xem thêm"}
        </button>
      )}
    </div>
  );
};

export default Recommendations;