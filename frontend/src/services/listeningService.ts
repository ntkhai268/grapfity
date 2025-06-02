// src/services/listeningService.ts
import axios from 'axios';

// Cấu hình Axios chung cho toàn project
axios.defaults.baseURL = 'http://localhost:8080';
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

/**
 * Lấy lịch sử nghe với đầy đủ thông tin track, metadata, và người nghe
 */
export async function fetchListeningHistory(): Promise<ListeningHistoryRecord[]> {
  const res = await axios.get<{ data: ListeningHistoryRecord[] }>('/api/listening-history');
  return res.data.data;
}

