//D:\web_html\gop\grapfity\frontend\src\services\likeService.ts
// src/services/likeService.ts
import axios from 'axios';
import { mapApiDataToTrackData } from "./trackServiceAPI";
const LIKE_API_BASE_URL = 'http://localhost:8080/api'; // Base URL dùng chung

/**
 * Gửi like cho một track
 */
export const likeTrackAPI = async (trackId: number | string): Promise<any> => {
  const response = await axios.post(`${LIKE_API_BASE_URL}/track/${trackId}/like`, null, {
    withCredentials: true,
  });
  return response.data;
};

/**
 * Gỡ like cho một track
 */
export const unlikeTrackAPI = async (trackId: number | string): Promise<any> => {
  const response = await axios.delete(`${LIKE_API_BASE_URL}/track/${trackId}/unlike`, {
    withCredentials: true,
  });
  return response.data;
};

/**
 * Lấy danh sách tất cả track đã like bởi người dùng hiện tại
 */
export const getLikedTracksByUserAPI = async (): Promise<any[]> => {
  const response = await axios.get(`${LIKE_API_BASE_URL}/likes`, {
    withCredentials: true,
  });
  const rawTracks = response.data.data || [];
  //  console.log("🧪 raw tracks:", rawTracks);

  return rawTracks.map(mapApiDataToTrackData);
};

/**
 * Kiểm tra xem một track có được người dùng like chưa
 */
export const isTrackLikedByUserAPI = async (trackId: number | string): Promise<boolean> => {
  const response = await axios.get(`${LIKE_API_BASE_URL}/tracks/${trackId}/is-liked`, {
    withCredentials: true,
  });
  return response.data.isLiked;
};

/**
 * Lấy số lượt like của một track
 */
export const countLikesForTrackAPI = async (trackId: number | string): Promise<number> => {
  const response = await axios.get(`${LIKE_API_BASE_URL}/tracks/${trackId}/like-count`);
  return response.data.likeCount;
};
