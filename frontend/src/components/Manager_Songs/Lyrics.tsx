import React, { useState, useEffect } from 'react';
// Giả sử file './services/trackApiService' chứa định nghĩa getTrackByIdAPI và TrackData
// Bạn cần đảm bảo TrackData trong file đó đã được cập nhật để có trường 'lyrics'
import { getTrackByIdAPI, TrackData } from '../../services/trackServiceAPI'; 
// Hook useSongManager không còn cần thiết ở đây nếu trackId được truyền qua props
// import useSongManager from '../../hooks/Manager_Song_Play'; 

/*
QUAN TRỌNG: Định nghĩa interface TrackData (thường nằm trong file service, ví dụ: ../../services/trackServiceAPI.ts)
cần được cập nhật để bao gồm trường 'lyrics'. Ví dụ:

export interface TrackData {
  // ... các trường khác
  lyrics?: string | null; 
}
*/

// 1. Định nghĩa interface cho props của Lyrics
interface LyricsProps {
  trackId: string | number | null; // Lyrics sẽ nhận trackId từ component cha
}

// 2. Component Lyrics giờ đây nhận props
const Lyrics: React.FC<LyricsProps> = ({ trackId }) => { // Nhận trackId từ props
  const [expanded, setExpanded] = useState<boolean>(false);
  const [lyricsContent, setLyricsContent] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // currentTrackId giờ đây là prop 'trackId'
  // const { currentTrackId }: ISongManagerOutput = useSongManager(); // Không cần dòng này nữa

  useEffect(() => {
    // Sử dụng trackId từ props
    const trackIdToFetch = trackId; 

    if (trackIdToFetch) {
      const fetchLyrics = async () => {
        setIsLoading(true);
        setError(null);
        setLyricsContent(null);
        try {
          const trackData: TrackData | null = await getTrackByIdAPI(trackIdToFetch);

          if (trackData && typeof trackData.lyrics === 'string' && trackData.lyrics.trim() !== '') {
            setLyricsContent(trackData.lyrics);
          } else if (trackData) { // Track data có nhưng không có lyrics hoặc lyrics rỗng
            setLyricsContent("Không có lời cho bài hát này.");
          } else { // Không tìm thấy trackData
            setError("Không tìm thấy thông tin bài hát.");
            setLyricsContent(null); 
          }
        } catch (err: any) {
          console.error("Lỗi khi lấy lời bài hát:", err);
          setError(err.message || "Đã xảy ra lỗi khi tải lời bài hát.");
          setLyricsContent(null);
        } finally {
          setIsLoading(false);
        }
      };

      fetchLyrics();
    } else {
      // Nếu không có trackId (từ props), reset trạng thái
      setLyricsContent(null); 
      setIsLoading(false);
      setError(null);
      setExpanded(false); 
    }
  }, [trackId]); // useEffect sẽ chạy lại mỗi khi prop 'trackId' thay đổi

  // Tách lời bài hát động thành các dòng
  const dynamicLyricsLines = lyricsContent && lyricsContent !== "Không có lời cho bài hát này." 
                             ? lyricsContent.split('\n').filter(line => line.trim() !== '') 
                             : [];
  
  const initialLinesToShow = 4; 
  const linesToDisplay = expanded ? dynamicLyricsLines : dynamicLyricsLines.slice(0, initialLinesToShow);
  const canExpandDynamic = dynamicLyricsLines.length > initialLinesToShow;

  return (
    <div className="lyrics"> {/* Giữ nguyên className gốc */}
      <h3>Lời bài hát</h3>
      
      {isLoading && <p>Đang tải lời bài hát...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
      
      {!isLoading && !error && !trackId && ( // Kiểm tra prop trackId
        <p>Vui lòng chọn một bài hát để xem lời.</p>
      )}

      {!isLoading && !error && trackId && lyricsContent === "Không có lời cho bài hát này." && (
        <p>{lyricsContent}</p>
      )}
      
      {/* Hiển thị lời bài hát động */}
      {!isLoading && !error && trackId && lyricsContent && lyricsContent !== "Không có lời cho bài hát này." && (
        <>
          {linesToDisplay.map((line, index) => (
            <p key={`dyn-init-${index}`}>{line}</p>
          ))}
          {canExpandDynamic && (
            <p className="see-more" onClick={() => setExpanded(!expanded)} style={{ cursor: 'pointer' }}>
              {expanded ? "Thu gọn" : "...Xem thêm"}
            </p>
          )}
        </>
      )}
    </div>
  );
};

export default Lyrics;
