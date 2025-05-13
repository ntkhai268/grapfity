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
    : `${BACKEND_URL}/assets/default_playlist_cover.png`;

  return {
    id: playlistFromApi.id,
    title: playlistFromApi.title || 'Untitled Playlist',
    artist: playlistFromApi.User?.userName || 'Unknown Artist',
    timeAgo: calculateTimeAgo(playlistFromApi.createDate),
    cover: cover,

    tracks: (playlistFromApi.Tracks || []).map((track: any): TrackItem => {
      const trackArtist = track.User?.userName || 'Unknown Artist';

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
        cover: fullTrackImage
      };
    })
  };
};



// --- Các hàm gọi API ---

/**
 * Lấy danh sách playlist của người dùng ĐÃ ĐĂNG NHẬP.
 */
export const getMyPlaylistsAPI = async (): Promise<PlaylistData[]> => {
    console.log("Attempting to fetch playlists for the logged-in user...");
    try {
        const response = await axios.get<any[]>(`${API_BASE_URL}/`, {
            withCredentials: true,
        });
        console.log("Fetched playlists data (raw):", response.data);
        const playlists = response.data.map(mapApiDataToPlaylistData);
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

/**
 * Lấy chi tiết một playlist bằng ID.
 */
// export const getPlaylistByIdAPI = async (id: string | number): Promise<PlaylistData | null> => {
//     console.log(`Fetching playlist details for ID: ${id}`);
//     try {
//         const response = await axios.get<any>(`${API_BASE_URL}/${id}`);
//         console.log(`Data received for playlist ${id}:`, response.data);
//         const formattedPlaylist = mapApiDataToPlaylistData(response.data);
//         console.log(`Formatted playlist data for ${id}:`, formattedPlaylist);
//         return formattedPlaylist;

//     } catch (error) { // error là 'unknown'
//         console.error(`Error fetching playlist with id ${id}:`, error);
//         // --- SỬA LẠI CÁCH KIỂM TRA LỖI ---
//         if (error && typeof error === 'object' && 'response' in error) {
//             const axiosError = error as any;
//             console.error('Server response status:', axiosError.response?.status);
//             console.error('Server response data:', axiosError.response?.data);
//             if (axiosError.response?.status === 404) {
//                 console.log(`Playlist with ID ${id} not found (404).`);
//                 return null; // Trả về null nếu 404
//             }
//         } else if (error && typeof error === 'object' && 'request' in error) {
//             const axiosError = error as any;
//             console.error('No response received:', axiosError.request);
//         } else if (error instanceof Error) {
//             console.error('Generic error:', error.message);
//         } else {
//             console.error('Unknown error occurred:', error);
//         }
//         throw error; // Ném lại các lỗi khác 404
//     }
// };

/**
 * Tạo một playlist mới cho người dùng ĐÃ ĐĂNG NHẬP.
 */
export const createPlaylistAPI = async (trackId?: string | number | null): Promise<PlaylistData | null> => {
    console.log(`Attempting to create playlist`, trackId ? `from track: ${trackId}` : '(empty)');
    try {
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
                 cover: track.imageUrl || "/assets/default_track_cover.png"
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
export const updatePlaylistAPI = async (playlistId: string | number, title: string, imageUrl: string | null): Promise<PlaylistData> => {
    console.log(`Attempting to update playlist ID: ${playlistId} with title: "${title}"`);
    try {
         // --- THÊM CONSOLE LOG Ở ĐÂY ---
         const apiUrl = `${API_BASE_URL}/${playlistId}`; // Tạo URL
         console.log("Sending PUT request to URL:", apiUrl); // In URL ra console
        // Gửi yêu cầu PUT (hoặc PATCH tùy vào API backend của bạn)
        const response = await axios.put<{ message: string, data: any }>( // Định nghĩa kiểu dữ liệu trả về từ backend
            apiUrl,
            { title, imageUrl }, // Dữ liệu gửi đi trong body
            { withCredentials: true } // Cần thiết cho xác thực
        );

        console.log("Playlist updated successfully (raw response):", response.data);

        // --- SỬA Ở ĐÂY: Lấy dữ liệu từ response.data.data ---
        if (!response.data || !response.data.data) {
             throw new Error("Phản hồi từ server không chứa dữ liệu playlist đã cập nhật.");
        }
        // Sử dụng hàm map để chuẩn hóa dữ liệu nhận về
        const updatedPlaylist = mapApiDataToPlaylistData(response.data.data);
        // ----------------------------------------------------

        console.log("Formatted updated playlist data:", updatedPlaylist);
        return updatedPlaylist; // Trả về dữ liệu đã map

    } catch (error) { // error là 'unknown'
        console.error(`Error updating playlist ID ${playlistId}:`, error);

        // --- SỬA LẠI CÁCH KIỂM TRA LỖI ---
        if (axios.isAxiosError(error)) { // Sử dụng type guard của Axios
            const status = error.response?.status;
            // Lấy message lỗi từ backend nếu có, nếu không dùng message mặc định
            const serverErrorMessage = (error.response?.data as { error?: string })?.error;

            console.error('Server response status:', status);
            console.error('Server response data:', error.response?.data);

            let clientErrorMessage = 'Lỗi không xác định khi cập nhật playlist.'; // Message mặc định

            if (status === 401 || status === 403) {
                clientErrorMessage = serverErrorMessage || 'Bạn không có quyền cập nhật playlist này.';
            } else if (status === 404) {
                clientErrorMessage = serverErrorMessage || 'Playlist không tồn tại.';
            } else if (status === 400) {
                // Lỗi Bad Request (ví dụ: title trống, imageUrl sai định dạng)
                clientErrorMessage = serverErrorMessage || 'Dữ liệu gửi lên không hợp lệ.';
            } else if (status && status >= 500) {
                 // Lỗi server
                 clientErrorMessage = serverErrorMessage || 'Lỗi máy chủ khi cập nhật playlist.';
            } else if (!error.response) {
                 // Lỗi mạng hoặc không nhận được phản hồi
                 clientErrorMessage = 'Không thể kết nối đến máy chủ. Vui lòng kiểm tra lại mạng.';
            }
             // Ném lỗi với message đã xử lý để component hiển thị
            throw new Error(clientErrorMessage);

        } else if (error instanceof Error) {
            // Các lỗi JavaScript khác
            console.error('Generic error:', error.message);
            throw error; // Ném lại lỗi gốc
        } else {
            // Lỗi không xác định
            console.error('Unknown error occurred:', error);
            throw new Error('Đã xảy ra lỗi không xác định.'); // Ném lỗi chung
        }
        // ----------------------------------
    }
};


// ----- HÀM MỚI ĐỂ THÊM TRACK VÀO PLAYLIST (Không dùng isAxiosError) -----
/**
 * Thêm một bài hát vào playlist cụ thể thông qua API backend.
 * LƯU Ý: Backend controller hiện tại (PlaylistTrackController) trả về association object,
 * không phải full playlist. Component CẦN phải tự fetch lại playlist sau khi thành công.
 */
// export const addTrackToPlaylistAPI = async (playlistId: string | number, trackId: string | number): Promise<{ success: boolean; message: string }> => {
//     console.log(`Frontend Service: Attempting to add track ${trackId} to playlist ${playlistId}`);
//     try {
//         // Giả định route là POST /api/playlists/:playlistId/tracks
//         // --> Đảm bảo route này đúng với backend của bạn <--
//         const response = await axios.post<{ message: string; data: any }>( // data là PlaylistTrack object
//             `${API_BASE_URL}/${playlistId}/tracks`, // Endpoint
//             { trackId: Number(trackId) },        // Body chứa trackId dạng số
//             { withCredentials: true }          // Gửi cookie xác thực
//         );

//         console.log("Backend response after adding track:", response.data);

//         // Backend hiện tại trả về 200 OK khi thành công
//         if (response.status === 200 && response.data.message) {
//             console.log(`Successfully added track ${trackId} to playlist ${playlistId}. Message: ${response.data.message}`);
//             // Trả về thành công, component gọi hàm này sẽ cần fetch lại dữ liệu playlist
//             return { success: true, message: response.data.message };
//         } else {
//             // Trường hợp không mong muốn khác
//             console.warn("Unexpected successful response structure:", response);
//             // Không nên throw Error ở đây nếu kiểu trả về là Promise<{success, message}>
//             // throw new Error("Phản hồi từ server không như mong đợi sau khi thêm bài hát.");
//              return { success: false, message: "Phản hồi từ server không như mong đợi sau khi thêm bài hát." };
//         }

//     } catch (error: any) { // Bắt lỗi dưới dạng 'any'
//         console.error(`Error adding track ${trackId} to playlist ${playlistId} via API:`, error);

//         let errorMessage = "Lỗi không xác định khi thêm bài hát vào playlist.";

//         // Kiểm tra trực tiếp cấu trúc lỗi thay vì dùng isAxiosError
//         if (error && error.response) {
//             // Có phản hồi lỗi từ server (status code 4xx, 5xx)
//             const axiosResponseError = error as { response: { status: number; data: any } }; // Type assertion đơn giản
//              console.error('Server Response Error:', {
//                  status: axiosResponseError.response.status,
//                  data: axiosResponseError.response.data
//              });
//             const responseData = axiosResponseError.response.data;
//             // Ưu tiên lấy lỗi từ responseData.error hoặc responseData.message
//             errorMessage = responseData?.error || responseData?.message || `Lỗi từ server: ${axiosResponseError.response.status}`;

//             const status = axiosResponseError.response.status;
//             if (status === 400) {
//                 console.warn(`Bad Request (400): ${errorMessage}`);
//             } else if (status === 401 || status === 403) {
//                 console.warn(`Authentication/Authorization Error (${status}).`);
//                 errorMessage = "Bạn không được phép thực hiện hành động này.";
//             } else if (status === 404) {
//                 console.warn(`Not Found (404): ${errorMessage}`);
//                 // Cập nhật message nếu backend trả về cụ thể hơn
//                 if (errorMessage.toLowerCase().includes('playlist')) {
//                      errorMessage = "Không tìm thấy playlist.";
//                 } else if (errorMessage.toLowerCase().includes('track') || errorMessage.toLowerCase().includes('bài hát')) {
//                      errorMessage = "Không tìm thấy bài hát.";
//                 } else {
//                       errorMessage = "Không tìm thấy tài nguyên được yêu cầu.";
//                 }
//             } else if (status === 409) {
//                  console.warn(`Conflict (409): ${errorMessage}`); // Ví dụ: Bài hát đã tồn tại
//                  errorMessage = responseData?.message || "Bài hát này đã có trong playlist.";
//             }
//             // Bạn có thể thêm các case khác cho các status code cụ thể

//         } else if (error && error.request) {
//             // Request đã được gửi đi nhưng không nhận được phản hồi
//              console.error('No response received (Network Error):', error.request);
//             errorMessage = "Không nhận được phản hồi từ server. Vui lòng kiểm tra kết nối mạng.";
//         } else if (error instanceof Error) {
//             // Lỗi Javascript thông thường (ví dụ: lỗi trong logic trước khi gọi axios)
//              console.error('Generic JavaScript error:', error.message);
//              errorMessage = error.message; // Lấy message từ lỗi JS
//          } else {
//             // Các loại lỗi không xác định khác
//              console.error('Unknown error occurred:', error);
//              // Có thể cố gắng chuyển đổi error sang string để xem thông tin
//              try {
//                 errorMessage = String(error);
//              } catch (e) { /* Bỏ qua nếu không thể chuyển đổi */ }
//         }

//         // Trả về trạng thái thất bại để component xử lý
//         return { success: false, message: errorMessage };
//     }
// };
// ------------------kết thúc API thêm playlist mới---------------------------------------- 

// =====================================================
// === HÀM MỚI ĐỂ XÓA TRACK KHỎI PLAYLIST ===
// =====================================================
/**
 * Xóa một bài hát khỏi playlist cụ thể.
 * @param playlistId ID của Playlist chứa bài hát.
 * @param trackId ID của Track cần xóa.
 * @returns Promise<{ success: boolean; message: string }>
 */
// export const removeTrackFromPlaylistAPI = async (playlistId: string | number, trackId: string | number): Promise<{ success: boolean; message: string }> => {
//     console.log(`Frontend Service: Attempting to remove track ${trackId} from playlist ${playlistId}`);
//     try {
//         // Gọi API backend với phương thức DELETE
//         // Endpoint: DELETE /api/playlists/:playlistId/tracks/:trackId
//         const response = await axios.delete<{ message: string }>( // Backend có thể chỉ trả về message
//             `${API_BASE_URL}/${playlistId}/tracks/${trackId}`, // URL bao gồm cả trackId
//             { withCredentials: true } // Gửi cookie xác thực
//         );

//         console.log("Backend response after removing track:", response.data);

//         // Giả định thành công nếu status là 200 hoặc 204 (No Content) và có message (nếu status là 200)
//         if ((response.status === 200 && response.data.message) || response.status === 204) {
//             console.log(`Successfully removed track ${trackId} from playlist ${playlistId}.`);
//             return { success: true, message: response.data?.message || "Đã xóa bài hát khỏi playlist." }; // Lấy message nếu có
//         } else {
//             console.warn("Unexpected successful response structure after delete:", response);
//             return { success: false, message: "Phản hồi từ server không như mong đợi." };
//         }

//     } catch (error: any) {
//         console.error(`Error removing track ${trackId} from playlist ${playlistId} via API:`, error);
//         let errorMessage = "Lỗi không xác định khi xóa bài hát.";
//         if (error.response) {
//             const status = error.response.status;
//             const responseData = error.response.data;
//             errorMessage = responseData?.error || `Lỗi từ server: ${status}`;
//             console.error('Server Response Error:', { status, data: responseData });
//             // Xử lý các status code cụ thể
//             if (status === 401 || status === 403) errorMessage = "Bạn không có quyền xóa khỏi playlist này.";
//             else if (status === 404) errorMessage = responseData?.error || "Không tìm thấy playlist hoặc bài hát trong playlist.";
//             else if (status === 400) errorMessage = responseData?.error || "Dữ liệu không hợp lệ.";
//         } else if (error.request) {
//             errorMessage = "Không nhận được phản hồi từ server.";
//         } else {
//             errorMessage = `Lỗi không xác định: ${error.message}`;
//         }
//         // Trả về thất bại kèm message lỗi
//         return { success: false, message: errorMessage };
//     }
// };

// ----- Các hàm API khác (nếu có) -----



// ----- Các hàm API khác -----
