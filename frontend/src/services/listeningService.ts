// src/services/listeningService.ts
import axios from 'axios';


// Cấu hình Axios chung cho toàn project
axios.defaults.baseURL = 'http://localhost:8080/api';
axios.defaults.withCredentials = true;

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
 * Lấy về mảng lịch sử nghe của user
 */
export async function fetchListeningHistory(): Promise<HistoryRecord[]> {
  const res = await axios.get<{ histories: HistoryRecord[] }>('/listening-history');
  return res.data.histories;
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
  const res = await axios.post(`/track/${trackId}/listen`);
  // Backend trả về { message, history }
  return res.data.history;
};
// 3. Lấy top 10 bài hát phổ biến toàn hệ thống
export const getTop10PopularTracksAPI = async () => {
  const res = await axios.get('/popular/top10');
  return res.data;
};

// 4. Lấy top 5 bài hát user nghe nhiều nhất
export const getTop5TracksOfUserAPI = async () => {
  const res = await axios.get('/popular/top5');
  
  return res.data;
};