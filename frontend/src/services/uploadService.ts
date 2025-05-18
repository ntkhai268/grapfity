// src/services/uploadService.ts
import axios from 'axios';

axios.defaults.baseURL = 'http://localhost:8080';
axios.defaults.withCredentials = true;

export interface MinimalTrack {
  id: number;
  trackUrl: string;
  imageUrl: string;
  uploaderId: number;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface Artist {
  id: number;
  UploaderName: string;
}

export interface TrackWithCount extends MinimalTrack {
  listenCount: number;
  trackName: string | null;
  artist?: Artist;
}

// Chuyển '../public/assets/...' hoặc '../assets/...' → '/assets/...'
function toPublicPath(p: string): string {
  return p
    .replace(/^\.\.\/public/, '')
    .replace(/^(?:\.\.\/)+/, '/')
    .replace(/^\/+/, '/');
}


/**
 * Lấy track của user, tính tổng listenCount từ listeningHistories, rồi sort giảm dần.
 * Component chỉ cần slice(0, N) nếu muốn lấy top N.
 */
export async function getUserTracks(): Promise<TrackWithCount[]> {
  const res = await axios.get<{
    message: string;
    data: Array<{
      id: number;
      trackUrl: string;
      imageUrl: string;
      uploaderId: number;
      status: string;
      createdAt: string;
      updatedAt: string;
      listeningHistories: Array<{
        metadata: { trackname: string } | null;
        artis: Artist | null;
        listenCount: number;
        listener: { id: number; Name: string };
      }>;
    }>;
  }>('/api/tracks/user');

  const tracks: TrackWithCount[] = res.data.data.map(item => {
    // tính tổng listenCount
    const totalCount = item.listeningHistories.reduce((sum, h) => sum + h.listenCount, 0);

    // lấy trackName từ metadata đầu tiên có giá trị
    const metaEntry = item.listeningHistories.find(h => h.metadata?.trackname);
    const trackName = metaEntry?.metadata?.trackname ?? null;

    // lấy artist từ listeningHistories
    const artEntry = item.listeningHistories.find(h => h.artis != null)?.artis;
    const artist = artEntry ? { id: artEntry.id, UploaderName: artEntry.UploaderName } : undefined;

    const base: MinimalTrack = {
      id: item.id,
      trackUrl: toPublicPath(item.trackUrl),
      imageUrl: toPublicPath(item.imageUrl),
      uploaderId: item.uploaderId,
      status: item.status,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
    };

    return {
      ...base,
      listenCount: totalCount,
      trackName,
      artist,
    };
  });

  // sort giảm dần theo listenCount
  tracks.sort((a, b) => b.listenCount - a.listenCount);
  return tracks;
}
