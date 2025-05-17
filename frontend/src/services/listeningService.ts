  // src/services/listeningService.ts
  import axios from 'axios';

  // Cấu hình Axios chung cho toàn project
  axios.defaults.baseURL = 'http://localhost:8080';
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
    const res = await axios.get<{ histories: HistoryRecord[] }>('/api/listening-history');
    return res.data.histories;
  }

  /**
   * Lấy về danh sách tất cả tracks
   */
  export async function fetchAllTracks(): Promise<TrackRecord[]> {
    const res = await axios.get<{ data: TrackRecord[] }>('/api/tracks');
    return res.data.data;
  }