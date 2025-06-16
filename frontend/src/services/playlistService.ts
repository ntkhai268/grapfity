import axios from 'axios'; // Bỏ import AxiosError
import { PlaylistData, TrackItem } from '../components/Manager_Playlists/ManagerDataPlaylist'; // Đảm bảo đường dẫn đúng

// API Base URL
const API_BASE_URL = 'http://localhost:8080/api/playlists'; // Trỏ thẳng tới /api/playlists

// --- Hàm tiện ích tính thời gian ---
function calculateTimeAgo(createDate: string | Date | undefined): string {
    if (!createDate) return "Unknown time";
    try {
        const date = new Date(createDate);
        const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
        if (isNaN(seconds) || seconds < 0) return "Just now";
        let interval = seconds / 31536000; if (interval > 1) return Math.floor(interval) + " years ago";
        interval = seconds / 2592000; if (interval > 1) return Math.floor(interval) + " months ago";
        interval = seconds / 86400; if (interval > 1) return Math.floor(interval) + " days ago";
        interval = seconds / 3600; if (interval > 1) return Math.floor(interval) + " hours ago";
        interval = seconds / 60; if (interval > 1) return Math.floor(interval) + " minutes ago";
        return Math.floor(seconds) + " seconds ago";
    } catch (e) {
        console.error("Error calculating time ago:", e);
        return "Invalid date";
    }
}

/**
 * Ánh xạ dữ liệu thô từ API thành cấu trúc PlaylistData.
 * @param playlistFromApi Dữ liệu playlist thô từ backend.
 * @returns Đối tượng PlaylistData đã được định dạng.
 */
const BACKEND_URL = 'http://localhost:8080'; // có thể import từ config

export const mapApiDataToPlaylistData = (playlistFromApi: any): PlaylistData => {
  // Chuẩn hóa ảnh cover playlist
  const relativeCover = playlistFromApi.imageUrl || null;
  const cover = relativeCover
    ? `${BACKEND_URL}/${relativeCover.replace(/^\/?/, '')}`
    : "";
    // console.log("🎤 User info:", playlistFromApi.User);
    // console.log("🎤 User name:", playlistFromApi.User?.Name);
  return {
    id: playlistFromApi.id,
    title: playlistFromApi.title || 'Untitled Playlist',
    artist: playlistFromApi.User?.Name || 'Unknown Artist',
    uploaderId: playlistFromApi.User?.id,
    timeAgo: calculateTimeAgo(playlistFromApi.createDate),
    cover: cover,
    privacy: playlistFromApi.privacy ?? 'public',

    tracks: (playlistFromApi.Tracks || []).map((track: any): TrackItem => {
      const trackArtist = track.User?.Name || 'Unknown Artist';
      const uploaderId= track.User?.id;

      const trackTitle = track.Metadatum?.trackname || 'Unknown Title';

      const relativeAudioUrl = track.trackUrl || '';
      const fullAudioUrl = relativeAudioUrl
        ? `${BACKEND_URL}/${relativeAudioUrl.replace(/^\/?/, '')}`
        : '';

      const relativeTrackImage = track.imageUrl || null;
      const fullTrackImage = relativeTrackImage
        ? `${BACKEND_URL}/${relativeTrackImage.replace(/^\/?/, '')}`
        : `${BACKEND_URL}/assets/default_track_cover.png`;

      return {
        id: track.id,
        title: trackTitle,
        src: fullAudioUrl,
        artist: trackArtist,
        cover: fullTrackImage,
        uploaderId: uploaderId
      };
    })
  };
};
interface ApiResponse<T> {
  message: string;
  data: T;
}


// --- Các hàm gọi API ---

/**
 * Lấy danh sách playlist của người dùng ĐÃ ĐĂNG NHẬP.
 */
export const getMyPlaylistsAPI = async (): Promise<PlaylistData[]> => {
    console.log("Attempting to fetch playlists for the logged-in user...");
    try {
        const response = await axios.get<ApiResponse<PlaylistData[]>>(`${API_BASE_URL}/`, { withCredentials: true });

        console.log("Fetched playlists data (raw):", response.data);
        const playlists = response.data.data.map(mapApiDataToPlaylistData);
        console.log("Formatted playlists data:", playlists);
        return playlists;

    } catch (error) { // error là 'unknown'
        console.error('Error fetching my playlists:', error);
        // --- SỬA LẠI CÁCH KIỂM TRA LỖI ---
        if (error && typeof error === 'object' && 'response' in error) {
            const axiosError = error as any; // Cast sang any để truy cập
            console.error('Server response status:', axiosError.response?.status);
            console.error('Server response data:', axiosError.response?.data);
            if (axiosError.response?.status === 401 || axiosError.response?.status === 403) {
                 console.warn("Authentication error detected.");
            }
        } else if (error && typeof error === 'object' && 'request' in error) {
             const axiosError = error as any;
             console.error('No response received:', axiosError.request);
        } else if (error instanceof Error) {
             console.error('Generic error:', error.message);
        } else {
             console.error('Unknown error occurred:', error);
        }
        throw error;
    }
};


// lấy playlist public của người khác

export const getPublicPlaylistsByUserIdAPI = async (userId: string | number): Promise<PlaylistData[]> => {
    try {
        const response = await axios.get<{ message: string; data: any[] }>(
            `${API_BASE_URL}/user/${userId}`,
            { withCredentials: true }
        );
        return response.data.data.map(mapApiDataToPlaylistData);
    } catch (error) {
        console.error('Error fetching public playlists for user:', error);
        throw error;
    }
};


// để hiển thị ở trang chủ chơi 
export const getAllPublicPlaylistsAPI = async (): Promise<PlaylistData[]> => {
    console.log("📂 Fetching all public playlists from server...");
    try {
        const response = await axios.get<{ message: string; data: any[] }>(
            `${API_BASE_URL}/public`
        );
        const playlists = response.data.data.map(mapApiDataToPlaylistData);
        // console.log("✅ Fetched public playlists:", playlists);
        return playlists;
    } catch (error) {
        console.error('❌ Error fetching all public playlists:', error);
        throw error;
    }
};

/**
 * Tạo một playlist mới cho người dùng ĐÃ ĐĂNG NHẬP.
 */
export const createPlaylistAPI = async (trackId?: string | number | null): Promise<PlaylistData | null> => {
    console.log(`Attempting to create playlist`, trackId ? `from track: ${trackId}` : '(empty)');
    try {
        console.log("Sending POST request to create playlist...");
        const response = await axios.post<any>(`${API_BASE_URL}/`,
            { trackId: trackId },
            { withCredentials: true }
        );
        console.log("Playlist created successfully (raw data):", response.data);
        const formattedNewPlaylist: PlaylistData = {
             id: response.data.id,
             title: response.data.title || "Untitled Playlist",
             artist: "Bạn",
             timeAgo: calculateTimeAgo(response.data.createDate),
             cover: response.data.imageUrl || null,
             tracks: response.data.Tracks?.map((track: any): TrackItem => ({
                 id: track.id,
                 title: track.title || "Unknown Title",
                 src: track.trackUrl || "",
                 artist: track.User?.userName || "Unknown Artist",
                 cover: track.imageUrl || ""
             })) || []
        };
        console.log("Formatted new playlist data:", formattedNewPlaylist);
        return formattedNewPlaylist;

    } catch (error) { // error là 'unknown'
        console.error("Error creating playlist via API:", error);
        // --- SỬA LẠI CÁCH KIỂM TRA LỖI ---
        if (error && typeof error === 'object' && 'response' in error) {
            const axiosError = error as any;
            console.error('Server response status:', axiosError.response?.status);
            console.error('Server response data:', axiosError.response?.data);
            if (axiosError.response?.status === 401 || axiosError.response?.status === 403) {
                throw new Error('Unauthorized');
            }
            // Kiểm tra lỗi track không tồn tại từ backend (dựa vào message nếu có)
            if (axiosError.response?.status === 404 && axiosError.response?.data?.message?.includes('Track not found')) {
                 throw new Error('Bài hát dùng để tạo playlist không tồn tại.');
            }
        } else if (error && typeof error === 'object' && 'request' in error) {
            const axiosError = error as any;
            console.error('No response received:', axiosError.request);
        } else if (error instanceof Error) {
            console.error('Generic error:', error.message);
        } else {
            console.error('Unknown error occurred:', error);
        }
        throw error; // Ném lại các lỗi khác
    }
};


// --- HÀM XÓA PLAYLIST (Mới) ---
/**
 * Gửi yêu cầu xóa một playlist đến API backend.
 * @param playlistId ID của playlist cần xóa.
 * @returns {Promise<void>} Promise sẽ resolve nếu xóa thành công, reject nếu có lỗi.
 * @throws {Error} Ném lỗi nếu API trả về lỗi (401, 403, 404, 500) hoặc có lỗi mạng.
 */
export const deletePlaylistAPI = async (playlistId: string | number): Promise<void> => {
    console.log(`Attempting to delete playlist with ID: ${playlistId}`);
    try {
        // Gửi yêu cầu DELETE đến endpoint cụ thể của playlist
        const response = await axios.delete(
            `${API_BASE_URL}/${playlistId}`, // URL bao gồm ID playlist
            { withCredentials: true } // Cần thiết cho xác thực
        );

        // Backend trả về 204 No Content khi thành công, không cần xử lý data
        console.log(`Playlist ${playlistId} deleted successfully. Status: ${response.status}`);
        // Không cần return gì cả (void)

    } catch (error) { // error là 'unknown'
        console.error(`Error deleting playlist ${playlistId} via API:`, error);

        // --- Xử lý lỗi chi tiết ---
        if (axios.isAxiosError(error)) { // Kiểm tra lỗi axios
            console.error('Server response status:', error.response?.status);
            console.error('Server response data:', error.response?.data);
            const status = error.response?.status;
            const errorData = error.response?.data as { error?: string }; // Ép kiểu để lấy message lỗi

            if (status === 401 || status === 403) {
                // Lỗi không có quyền hoặc chưa đăng nhập
                throw new Error(errorData?.error || 'Bạn không có quyền xóa playlist này.');
            }
            if (status === 404) {
                // Lỗi không tìm thấy playlist
                throw new Error(errorData?.error || 'Không tìm thấy playlist để xóa.');
            }
             if (status === 400) {
                // Lỗi dữ liệu không hợp lệ (mặc dù ít xảy ra với DELETE)
                throw new Error(errorData?.error || 'Yêu cầu không hợp lệ.');
            }
            // Các lỗi server khác (5xx)
            throw new Error(errorData?.error || 'Lỗi server khi xóa playlist.');

        } else if (error instanceof Error) {
            console.error('Generic error:', error.message);
            throw error; // Ném lại lỗi gốc
        } else {
            console.error('Unknown error occurred:', error);
            throw new Error('Đã xảy ra lỗi không xác định khi xóa playlist.'); // Ném lỗi chung
        }
    }
};


export const uploadPlaylistImageAPI = async (playlistId: string | number, imageFile: File): Promise<string> => {
    console.log(`Attempting to upload cover image for playlist ID: ${playlistId}`);

    // 1. Tạo FormData
    const formData = new FormData();
    // Thêm file vào FormData với key là 'playlistImage' (phải khớp với multer ở backend)
    formData.append('playlistImage', imageFile, imageFile.name);

    try {
        // 2. Gửi yêu cầu POST đến endpoint upload
        const response = await axios.post<{ message: string, imageUrl: string }>( // Định nghĩa kiểu trả về
            `${API_BASE_URL}/${playlistId}/upload-cover`, // Endpoint upload mới
            formData, // Gửi FormData làm body
            {
                headers: {
                    // Quan trọng: Để axios tự đặt Content-Type là multipart/form-data
                    // Không cần set 'Content-Type': 'multipart/form-data' thủ công ở đây
                },
                withCredentials: true // Gửi cookie nếu cần xác thực
            }
        );

        console.log("Image uploaded successfully (raw response):", response.data);

        // 3. Kiểm tra và trả về imageUrl
        if (response.data && response.data.imageUrl) {
            return response.data.imageUrl; // Trả về URL mới từ backend
        } else {
            throw new Error("Phản hồi từ server không chứa URL ảnh hợp lệ.");
        }

    } catch (error) {
        console.error(`Error uploading image for playlist ID ${playlistId}:`, error);

        // Xử lý lỗi chi tiết
        if (axios.isAxiosError(error)) {
            const status = error.response?.status;
            const serverErrorMessage = (error.response?.data as { error?: string })?.error;
            console.error('Server response status:', status);
            console.error('Server response data:', error.response?.data);

            let clientErrorMessage = 'Lỗi không xác định khi tải ảnh lên.';

            if (status === 401 || status === 403) {
                clientErrorMessage = serverErrorMessage || 'Bạn không có quyền tải ảnh lên cho playlist này.';
            } else if (status === 404) {
                clientErrorMessage = serverErrorMessage || 'Playlist không tồn tại.';
            } else if (status === 400) {
                // Lỗi Bad Request (ví dụ: file không hợp lệ, kích thước quá lớn)
                clientErrorMessage = serverErrorMessage || 'File ảnh không hợp lệ hoặc kích thước quá lớn.';
            } else if (status && status >= 500) {
                 clientErrorMessage = serverErrorMessage || 'Lỗi máy chủ khi tải ảnh lên.';
            } else if (!error.response) {
                 clientErrorMessage = 'Không thể kết nối đến máy chủ. Vui lòng kiểm tra lại mạng.';
            }
            throw new Error(clientErrorMessage);

        } else if (error instanceof Error) {
            throw error;
        } else {
            throw new Error('Đã xảy ra lỗi không xác định khi tải ảnh lên.');
        }
    }
};

/**
 * Cập nhật thông tin playlist (title, imageUrl).
 */
export const updatePlaylistAPI = async (
  playlistId: string | number,
  updateData: {
    title: string;
    imageUrl?: string | null;
    privacy?: 'public' | 'private';
  }
): Promise<PlaylistData> => {
  console.log(`Attempting to update playlist ID: ${playlistId} with title: "${updateData.title}"`);
  try {
    const apiUrl = `${API_BASE_URL}/${playlistId}`;
    console.log("Sending PUT request to URL:", apiUrl);

    const response = await axios.put<{ message: string; data: any }>(
      apiUrl,
      updateData,
      { withCredentials: true }
    );

    console.log("Playlist updated successfully (raw response):", response.data);

    if (!response.data || !response.data.data) {
      throw new Error("Phản hồi từ server không chứa dữ liệu playlist đã cập nhật.");
    }

    const updatedPlaylist = mapApiDataToPlaylistData(response.data.data);

    console.log("Formatted updated playlist data:", updatedPlaylist);
    return updatedPlaylist;

  } catch (error) {
    console.error(`Error updating playlist ID ${playlistId}:`, error);

    if (axios.isAxiosError(error)) {
      const status = error.response?.status;
      const serverErrorMessage = (error.response?.data as { error?: string })?.error;

      console.error('Server response status:', status);
      console.error('Server response data:', error.response?.data);

      let clientErrorMessage = 'Lỗi không xác định khi cập nhật playlist.';

      if (status === 401 || status === 403) {
        clientErrorMessage = serverErrorMessage || 'Bạn không có quyền cập nhật playlist này.';
      } else if (status === 404) {
        clientErrorMessage = serverErrorMessage || 'Playlist không tồn tại.';
      } else if (status === 400) {
        clientErrorMessage = serverErrorMessage || 'Dữ liệu gửi lên không hợp lệ.';
      } else if (status && status >= 500) {
        clientErrorMessage = serverErrorMessage || 'Lỗi máy chủ khi cập nhật playlist.';
      } else if (!error.response) {
        clientErrorMessage = 'Không thể kết nối đến máy chủ. Vui lòng kiểm tra lại mạng.';
      }

      throw new Error(clientErrorMessage);

    } else if (error instanceof Error) {
      console.error('Generic error:', error.message);
      throw error;
    } else {
      console.error('Unknown error occurred:', error);
      throw new Error('Đã xảy ra lỗi không xác định.');
    }
  }
};
