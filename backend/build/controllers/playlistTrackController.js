// src/controllers/playlistTrackController.js
import db from '../models/index.js';

// Import các hàm service cần thiết
// Đảm bảo đường dẫn này đúng và file service export các hàm này
import { addTrackToPlaylist, removeTrackFromPlaylist,
// getTracksInPlaylist 
getPlaylistDetailsById, getPlaylistDetailsByIdforme } from '../services/playlist_track_service.js'; // <-- Sử dụng service riêng nếu có

/**
 * Controller để thêm track vào playlist hiện có.
 * Endpoint: POST /api/playlists/:playlistId/tracks
 */
const addTrackToPlaylistController = async (req, res) => {
  try {
    const userId = req.userId;
    const {
      playlistId
    } = req.params;
    const {
      trackId
    } = req.body;

    // Validate inputs (giữ nguyên)
    if (!userId) return res.status(401).json({
      error: 'Unauthorized: Yêu cầu đăng nhập.'
    });
    if (!playlistId || isNaN(Number(playlistId))) return res.status(400).json({
      error: 'Bad Request: Playlist ID không hợp lệ.'
    });
    if (!trackId || isNaN(Number(trackId))) return res.status(400).json({
      error: 'Bad Request: Track ID không hợp lệ hoặc thiếu.'
    });
    console.log(`Controller: User ${userId} thêm track ${trackId} vào playlist ${playlistId}`);

    // Gọi service function
    const newPlaylistTrack = await addTrackToPlaylist(Number(playlistId), Number(trackId), userId);

    // Trả về thành công
    return res.status(201).json({
      // Sử dụng 201 Created sẽ hợp lý hơn
      message: 'Đã thêm bài hát vào playlist thành công!',
      data: newPlaylistTrack
    });
  } catch (error) {
    // Bắt lỗi từ service và trả về status code phù hợp
    console.error(`Lỗi trong addTrackToPlaylistController cho user ${req.userId}, playlist ${req.params.playlistId}, track ${req.body.trackId}:`, error.message);

    // Ưu tiên sử dụng statusCode từ lỗi nếu service cung cấp
    const statusCode = error.statusCode || 500;
    // Lấy message từ lỗi hoặc cung cấp message mặc định
    let errorMessage = error.message || 'Lỗi server khi thêm track vào playlist.';

    // Có thể giữ lại các kiểm tra message cụ thể nếu service không nhất quán về statusCode
    if (statusCode === 404) {
      if (error.message.includes('Playlist')) errorMessage = 'Không tìm thấy playlist.';else if (error.message.includes('Track')) errorMessage = 'Không tìm thấy bài hát.';
    } else if (statusCode === 403) {
      errorMessage = 'Bạn không có quyền thêm vào playlist này.';
    } else if (statusCode === 409) {
      errorMessage = 'Bài hát này đã có trong playlist.';
    } else if (statusCode === 400) {
      errorMessage = 'Dữ liệu không hợp lệ.';
    }
    return res.status(statusCode).json({
      error: errorMessage
    });
  }
};

/**
 * Controller để xóa track khỏi playlist.
 * Endpoint: DELETE /api/playlists/:playlistId/tracks/:trackId
 */
const removeTrackFromPlaylistController = async (req, res) => {
  try {
    const userId = req.userId;
    const {
      playlistId,
      trackId
    } = req.params;

    // Validate inputs (giữ nguyên)
    if (!userId) return res.status(401).json({
      error: 'Unauthorized: Yêu cầu đăng nhập.'
    });
    if (!playlistId || isNaN(Number(playlistId))) return res.status(400).json({
      error: 'Bad Request: Playlist ID không hợp lệ.'
    });
    if (!trackId || isNaN(Number(trackId))) return res.status(400).json({
      error: 'Bad Request: Track ID không hợp lệ.'
    });
    console.log(`Controller: User ${userId} xóa track ${trackId} khỏi playlist ${playlistId}`);

    // Gọi service function
    const result = await removeTrackFromPlaylist(Number(playlistId), Number(trackId), userId);

    // Trả về thành công (có thể dùng 204 No Content)
    return res.status(200).json({
      message: result.message || 'Đã xóa bài hát khỏi playlist thành công!'
    });
    // Hoặc: return res.status(204).send();
  } catch (error) {
    // Bắt lỗi từ service và trả về status code phù hợp
    console.error(`Lỗi trong removeTrackFromPlaylistController cho user ${req.userId}, playlist ${req.params.playlistId}, track ${req.params.trackId}:`, error.message);
    const statusCode = error.statusCode || 500;
    let errorMessage = error.message || 'Lỗi server khi xóa track khỏi playlist.';
    if (statusCode === 404) {
      if (error.message.includes('Playlist')) errorMessage = 'Không tìm thấy playlist.';else if (error.message.includes('Track')) errorMessage = 'Không tìm thấy bài hát này trong playlist.';
    } else if (statusCode === 403) {
      errorMessage = 'Bạn không có quyền xóa khỏi playlist này.';
    } else if (statusCode === 400) {
      errorMessage = 'Dữ liệu không hợp lệ.';
    }
    return res.status(statusCode).json({
      error: errorMessage
    });
  }
};

/**
 * Controller để lấy danh sách các track trong một playlist.
 * Endpoint: GET /api/playlists/:playlistId/tracks
 */
const getPlaylistDetailsController = async (req, res) => {
  try {
    const {
      playlistId
    } = req.params;
    const currentUserId = req.userId;
    if (!playlistId || isNaN(Number(playlistId))) {
      return res.status(400).json({
        error: 'Bad Request: Playlist ID không hợp lệ.'
      });
    }

    // kiểm tra playlist có tồn tại ko
    const playlist = await db.Playlist.findByPk(playlistId);
    if (!playlist) {
      return res.status(404).json({
        error: 'Playlist không tồn tại.'
      });
    }
    const isOwner = playlist.userId === currentUserId;
    const fullPlaylistData = isOwner ? await getPlaylistDetailsByIdforme(Number(playlistId), currentUserId) : await getPlaylistDetailsById(Number(playlistId)); // chỉ lấy bài public

    res.status(200).json({
      message: 'Lấy thông tin playlist thành công!',
      data: fullPlaylistData
    });
  } catch (err) {
    console.error(`Lỗi trong getPlaylistDetailsController cho playlist ${req.params.playlistId}:`, err.message);
    const statusCode = err.statusCode || 500;
    const errorMessage = err.message || 'Lỗi server khi lấy thông tin playlist.';
    res.status(statusCode).json({
      error: errorMessage
    });
  }
};
// Export các controller trong file này
export { addTrackToPlaylistController, removeTrackFromPlaylistController,
// getTracksInPlaylistController 
getPlaylistDetailsController };