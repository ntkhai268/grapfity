import React, { useEffect, useState } from "react";
import { countLikesForTrackAPI, getLikedTracksByProfileAPI, unlikeTrackAPI} from "../../services/likeService";
import type { TrackData } from "../../services/trackServiceAPI";
import GlobalAudioManager, { Song, PlaylistContext } from "../../hooks/GlobalAudioManager";

const mapTrackDataToSong = (track: TrackData): Song => ({
  id: track.id,
  src: track.src || "",
  title: track.title || undefined,
  artist: track.artist || undefined,
  cover: track.cover || undefined,
});

interface SongProps {
  viewedUserId: string | number;
  currentUserId: string | number;
}

const SongRight: React.FC<SongProps> = ({ viewedUserId }) => {
  const [likedSongs, setLikedSongs] = useState<TrackData[]>([]);
  const [totalUserLikes, setTotalUserLikes] = useState<number>(0);
  const [likeCounts, setLikeCounts] = useState<Record<string | number, number>>({});

  const [currentPlayingId, setCurrentPlayingId] = useState<string | number | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const currentContext = GlobalAudioManager.getCurrentContext();

  useEffect(() => {
    const fetchLikedTracksAndCounts = async () => {
      try {
        const tracks = await getLikedTracksByProfileAPI(viewedUserId);
        // console.log("🧪 Tracks từ API /likes:", tracks);
        setLikedSongs(tracks);
        setTotalUserLikes(tracks.length);

        // Gọi song song countLikesForTrackAPI
        const counts = await Promise.all(
          tracks.map(async (track) => {
            const count = await countLikesForTrackAPI(track.id);
            return { trackId: track.id, count };
          })
        );

        // Biến về dạng object { [trackId]: count }
        const countMap: Record<string | number, number> = {};
        counts.forEach(({ trackId, count }) => {
          countMap[trackId] = count;
        });
        setLikeCounts(countMap);

      } catch (error) {
        console.error("Lỗi khi lấy danh sách bài hát hoặc số like:", error);
      }
    };

    fetchLikedTracksAndCounts();
  }, []);

  const handleUnlike = async (trackId: number | string) => {
    try {
      await unlikeTrackAPI(trackId);

      // Xoá khỏi danh sách liked
      setLikedSongs((prev) => prev.filter((song) => song.id !== trackId));

      // Giảm tổng số lượt like
      setTotalUserLikes((prev) => Math.max(prev - 1, 0));

      // Cập nhật lại bản đồ likeCounts
      setLikeCounts((prev) => {
        const newCounts = { ...prev };
        delete newCounts[trackId]; // hoặc set về 0 nếu bạn muốn giữ
        return newCounts;
      });
    } catch (error) {
      console.error("❌ Lỗi khi unlike:", error);
      alert("Đã xảy ra lỗi khi bỏ thích bài hát.");
    }
  };
  // phần xử lí phát nhạc:

  useEffect(() => {
    const unsubscribe = GlobalAudioManager.subscribe(() => {
      const current = GlobalAudioManager.getCurrentSong();
      setCurrentPlayingId(current?.id || null);
      setIsPlaying(GlobalAudioManager.getIsPlaying());
    });
    return () => unsubscribe();
  }, []);

const handlePlayButtonClick = (
  list: Song[],
  index: number,
  type: PlaylistContext['type'],
  contextId: string | number = type
) => {
  const clickedSong = list[index];
  const currentSong = GlobalAudioManager.getCurrentSong();
  const currentContext = GlobalAudioManager.getCurrentContext();
  const isCurrentlyPlaying = GlobalAudioManager.getIsPlaying();

  const context: PlaylistContext = {
    id: contextId,
    type: type,
  };

  const sameSong = currentSong?.id === clickedSong.id;
  const sameContext =
    currentContext?.id === context.id &&
    currentContext?.type === context.type;

  // Nếu là playlist mới hoặc bài khác → chuyển playlist và phát
  if (!sameSong || !sameContext) {
    GlobalAudioManager.setPlaylist(list, index, context);
    GlobalAudioManager.playSongAt(index);

 
    return;
  }

  // Nếu đang phát đúng bài đó → toggle play/pause
  if (isCurrentlyPlaying) {
    GlobalAudioManager.pausePlayback();
  } else {
    GlobalAudioManager.playAudio(
      GlobalAudioManager.getAudioElement()!,
      clickedSong,
      context
    );
  }
};

  return (
    <div className="right_section">
      <div className="top_right_bottom">
        <div className="top_right_bottom_left">
          <div className="Like_profile">
            <span>{totalUserLikes} Likes</span>
          </div>
        </div>
        <div className="top_right_bottom_right">
          <div className="view_profile">
            <span>View all</span>
          </div>
        </div>
        <div className="divider1"></div>
      </div>

      <div className="mid_right_bottom">
        {likedSongs.map((song, index) => (
          <div className="song_right" key={index}>
            <div className="song-image-wrapper">
            <img
              src={song.cover || "/assets/anhmau.png"}
              alt="Album Cover"
              className="album_cover_right"
            />
             <div
                className="play-button-like-profile"
                onClick={() => handlePlayButtonClick(likedSongs.map(mapTrackDataToSong), index,'profile', 'liked')}
              >
                <i
                  className={
                    currentPlayingId === song.id && isPlaying &&  currentContext?.type === 'profile' &&  currentContext?.id === 'liked'
                      ? "fas fa-pause"
                      : "fas fa-play"
                  }
                  style={{ color: "black" }}
                ></i>
              </div>
          </div>
            <div className="song_info_right">
              <p className="song_title_right">{song.title || "Unknown Title"}</p>
              <p className="artist_right">{song.artist || "Unknown Artist"}</p>
              <div className="share">
                {/* <span className="count_play">
                  <img src="/assets/play.png" alt="play" />
                </span>
                <span className="count_play_show">{song.playCount || 0}</span> */}
                <span
                  className="count_tym"
                  onClick={() => handleUnlike(song.id)}
                  style={{ cursor: "pointer" }}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    fill="red" 
                  >
                    <path d="M7.978 5c.653-1.334 1.644-2 2.972-2 1.992 0 3.405 1.657 2.971 4-.289 1.561-2.27 3.895-5.943 7C4.19 10.895 2.21 8.561 2.035 7c-.26-2.343.947-4 2.972-4 1.35 0 2.34.666 2.971 2z" />
                  </svg>
                </span>

                <span className="count_tym_show">
                  {likeCounts[song.id] ?? 0}
                </span>
                {/* <span className="count_repost">
                  <img src="/assets/Regroup.png" alt="repost" />
                </span>
                <span className="count_repost_show">{song.repostCount || 0}</span> */}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bottom_right_bottom"></div>
    </div>
  );
};

export default SongRight;
