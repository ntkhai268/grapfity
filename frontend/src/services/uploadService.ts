import axios from 'axios';

axios.defaults.baseURL = 'http://localhost:8080';
axios.defaults.withCredentials = true;

export interface MinimalTrack {
  id: number;
  title: string;
  trackUrl: string;
  imageUrl: string;
  createdAt: string;
  uploaderId: number;
}

export interface TrackWithCount extends MinimalTrack {
  listenCount: number;
}

interface HistoryRecord {
  id: number;
  userId: number;
  trackId: number;
  listenCount: number;
  createdAt: string;
  updatedAt: string;
}

/**
 * Chuyển '../public/assets/...' hoặc '../assets/...' → '/assets/...'
 */
function toPublicPath(p: string): string {
  return p
    .replace(/^\.\.\/public/, '')
    .replace(/^(?:\.\.\/)+/, '/')
    .replace(/^\/+/, '/');
}

/** Lấy toàn bộ lịch sử nghe */
async function fetchListeningHistories(): Promise<HistoryRecord[]> {
  const res = await axios.get<{
    message: string;
    histories: HistoryRecord[];
  }>('/api/listening-histories');
  return res.data.histories;
}

/**
 * Lấy track của user, gắn listenCount rồi sort giảm dần.
 * Component chỉ cần slice(0, 3).
 */
export async function getUserTracks(): Promise<TrackWithCount[]> {
  // fetch track/user và listening histories song song
  const [tracksRes, histories] = await Promise.all([
    axios.get<{ data: any[] }>('/api/tracks/user'),
    fetchListeningHistories()
  ]);

  // map trackId → tổng listenCount
  const countMap = histories.reduce<Record<number, number>>((acc, h) => {
    acc[h.trackId] = (acc[h.trackId] || 0) + h.listenCount;
    return acc;
  }, {});

  // build TrackWithCount
  const tracks: TrackWithCount[] = tracksRes.data.data.map(item => {
    const base: MinimalTrack = {
      id: item.id,
      title: item.title ?? `Track ${item.id}`,
      trackUrl: toPublicPath(item.trackUrl),
      imageUrl: toPublicPath(item.imageUrl),
      createdAt: item.createdAt,
      uploaderId: item.uploaderId
    };
    return {
      ...base,
      listenCount: countMap[base.id] || 0
    };
  });

  // sort giảm dần
  tracks.sort((a, b) => b.listenCount - a.listenCount);
  return tracks;
}
