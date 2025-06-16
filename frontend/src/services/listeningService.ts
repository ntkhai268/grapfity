// src/services/listeningService.ts
import axios from 'axios';


// Cấu hình Axios chung cho toàn project
// cái này dễ lỗi do bị gọi nhiều lần nó đè nhau , mỗi file cấu hình 1 cái nên lỗi
// axios.defaults.baseURL = 'http://localhost:8080/api';

// axios.defaults.withCredentials = true;

// dùng cài này an toàn 
const API_BASE_URL = 'http://localhost:8080/api';
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

// Lịch sử nghe nhạc
export async function fetchListeningHistory(): Promise<ListeningHistoryRecord[]> {
  const res = await axios.get<{ data: any[] }>(`${API_BASE_URL}/listening-history`);
  // ... xử lý như cũ
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

// Lấy tất cả tracks
export async function fetchAllTracks(): Promise<TrackRecord[]> {
  const res = await axios.get<{ data: TrackRecord[] }>(`${API_BASE_URL}/tracks`);
  return res.data.data;
}

// Ghi nhận lượt nghe mới
export const trackingListeningHistoryAPI = async (trackId: string | number) => {
  const res = await axios.post(`${API_BASE_URL}/track/${trackId}/listen`);
  return res.data.history;
};

// Top 10 phổ biến toàn hệ thống
export const getTop10PopularTracksAPI = async () => {
  const res = await axios.get(`${API_BASE_URL}/popular/top10`);
  return res.data;
};

// Top 5 bài hát user nghe nhiều nhất
export const getTop5TracksOfUserAPI = async () => {
  const res = await axios.get(`${API_BASE_URL}/popular/top5`);
  return res.data;
};

// Top 5 bài hát phổ biến theo owner
export const getTop5TracksOfProfileAPI = async (userId: string | number) =>{
  const res = await axios.get(`${API_BASE_URL}/popular-user/${userId}/top5`);
  return res.data;
};

export const getHomeRecommendationsAPI = async () => {
  const res =  await axios.get(`${API_BASE_URL}/recommend/home/`);
  console.log(res.data)
  return res.data.data;
}

export const getTrackRecommendationsAPI = async (trackId: string | number) => {
  console.log("Fetching recommendations for track:", trackId);
  const res = await axios.get(`${API_BASE_URL}/recommend/track/${trackId}`);
  console.log("Recommendations response:", res.data);
  return res.data.data;
}