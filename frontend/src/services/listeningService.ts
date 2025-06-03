// src/services/listeningService.ts
import axios from 'axios';


// Cấu hình Axios chung cho toàn project
axios.defaults.baseURL = 'http://localhost:8080/api';
axios.defaults.withCredentials = true;

export interface ListeningHistoryRecord {
  listenCount: number;
  createdAt: string;
  metadata: {
    trackname: string | null;
  } | null;
  track: {
    id: number;
    trackUrl: string;
    imageUrl: string;
    uploaderId: number;
    status: string;
    createdAt: string;
    User: {
      id: number;
      UploaderName: string;
    };
  };
  listener: {
    id: number;
    Name: string;
  };
}

export interface HistoryRecord {
  id: number;
  userId: number;
  trackId: number;
  listenCount: number;
  createdAt: string;
}

export interface TrackRecord {
  id: number;
  trackUrl: string;
  imageUrl: string;   // ví dụ: '/assets/images/bacphan.jpg'
  uploaderId: number;
}

/**
 * Lấy lịch sử nghe với đầy đủ thông tin track, metadata, và người nghe
 */
export async function fetchListeningHistory(): Promise<ListeningHistoryRecord[]> {
  const res = await axios.get<{ data: any[] }>('/api/listening-history');

  // map từ response về đúng với ListeningHistoryRecord
  const normalized = res.data.data.map(item => ({
    listenCount: item.listenCount,
    createdAt: item.createdAt,
    metadata: item.Track?.Metadatum ?? null,
    track: {
      ...item.Track,
      User: item.Track?.User ?? { id: 0, UploaderName: 'Unknown' }
    },
    listener: item.User ?? { id: 0, Name: 'Unknown' }
  }));

  return normalized;
}


/**
 * Lấy về danh sách tất cả tracks
 */
export async function fetchAllTracks(): Promise<TrackRecord[]> {
  const res = await axios.get<{ data: TrackRecord[] }>('/tracks');
  return res.data.data;
}
// Ghi nhận lượt nghe mới cho một track (trackId)
export const trackingListeningHistoryAPI = async (trackId: string | number) => {
  console.log(trackId)
  const res = await axios.post(`api/track/${trackId}/listen`);
  // Backend trả về { message, history }
  return res.data.history;
};
// 3. Lấy top 10 bài hát phổ biến toàn hệ thống
export const getTop10PopularTracksAPI = async () => {
  const res = await axios.get('api/popular/top10');
  return res.data;
};

// 4. Lấy top 5 bài hát user nghe nhiều nhất
export const getTop5TracksOfUserAPI = async () => {
  const res = await axios.get('api/popular/top5');
  
  return res.data;
};

export const getTop5TracksOfOwnerAPI = async () => {
  const res = await axios.get('/popular-owner/top5');
  
  return res.data;
};
