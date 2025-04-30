import axios from 'axios';

const API_URL = 'http://localhost:3000/api';

// Tạo instance của axios với cấu hình mặc định
const api = axios.create({
  baseURL: API_URL,
  withCredentials: true, // Cho phép gửi cookies
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor để thêm token vào header
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers = {
      ...config.headers,
      Authorization: `Bearer ${token}`
    };
  }
  return config;
});

// Interceptor để xử lý lỗi
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token hết hạn hoặc không hợp lệ
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const apiService = {
  // Authentication
  login: async (credentials: { email: string; password: string }) => {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },

  register: async (userData: { email: string; password: string; name: string }) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },

  // User
  getUserProfile: async () => {
    const response = await api.get('/users/profile');
    return response.data;
  },

  // Songs
  getSongs: async () => {
    const response = await api.get('/tracks');
    return response.data;
  },

  getSongById: async (id: string) => {
    const response = await api.get(`/tracks/${id}`);
    return response.data;
  },

  // Playlists
  getPlaylists: async () => {
    const response = await api.get('/playlists');
    return response.data;
  },

  createPlaylist: async (playlistData: { name: string; description?: string }) => {
    const response = await api.post('/playlists', playlistData);
    return response.data;
  },

  // Stats
  getStats: async () => {
    const response = await api.get('/stats');
    return response.data;
  },

  // Listening History
  getListeningHistory: async () => {
    const response = await api.get('/listening-history');
    return response.data;
  },

  // Likes
  likeSong: async (songId: string) => {
    const response = await api.post(`/likes/${songId}`);
    return response.data;
  },

  unlikeSong: async (songId: string) => {
    const response = await api.delete(`/likes/${songId}`);
    return response.data;
  },
}; 