// app.js
require('dotenv').config();
const express = require('express');
const { getPool } = require('./config/database');

// Import các hàm controller cho Users
const {
  getAllUsersRaw,
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser
} = require('./controllers/userController');

// Import controller cho Tracks
const {
  getAllTracks,
  getTrackById,
  createTrack,
  updateTrack,
  deleteTrack
} = require('./controllers/trackController');

// Import controller cho Playlists
const {
  getAllPlaylists,
  getPlaylistById,
  createPlaylist,
  updatePlaylist,
  deletePlaylist
} = require('./controllers/playlistController');

// Import controller cho Likes
const {
  getAllLikes,
  getLikeById,
  createLike,
  updateLike,
  deleteLike
} = require('./controllers/likeController');

// Import controller cho ListeningHistory
const {
  getAllHistory,
  getHistoryById,
  createHistory,
  updateHistory,
  deleteHistory
} = require('./controllers/listeningHistoryController');

// Import controller cho SearchHistory
const {
  getAllSearches,
  getSearchById,
  createSearch,
  updateSearch,
  deleteSearch
} = require('./controllers/searchHistoryController');

// Import controller cho Roles
const {
  getAllRoles,
  getRoleById,
  createRole,
  updateRole,
  deleteRole
} = require('./controllers/roleController');

const app = express();
app.use(express.json());

// Khởi động ứng dụng
async function startApp() {
  try {
    // Kết nối DB
    await getPool();
    // In ra danh sách Users
    const users = await getAllUsersRaw();
    console.log('\n📋 Danh sách Users từ database:');
    console.table(users);

    // Lắng nghe cổng
    const PORT = process.env.PORT || 3001;
    app.listen(PORT, () => {
      console.log(`\n🚀 Server đang chạy tại http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('❌ Lỗi khởi động ứng dụng:', err);
  }
}

// ---------------------
//  Định nghĩa endpoint
// ---------------------

// Users
app.get('/api/users', getAllUsers);
app.get('/api/users/:id', getUserById);
app.post('/api/users', createUser);
app.put('/api/users/:id', updateUser);
app.delete('/api/users/:id', deleteUser);

// Tracks
app.get('/api/tracks', getAllTracks);
app.get('/api/tracks/:id', getTrackById);
app.post('/api/tracks', createTrack);
app.put('/api/tracks/:id', updateTrack);
app.delete('/api/tracks/:id', deleteTrack);

// Playlists
app.get('/api/playlists', getAllPlaylists);
app.get('/api/playlists/:id', getPlaylistById);
app.post('/api/playlists', createPlaylist);
app.put('/api/playlists/:id', updatePlaylist);
app.delete('/api/playlists/:id', deletePlaylist);

// Likes
app.get('/api/likes', getAllLikes);
app.get('/api/likes/:id', getLikeById);
app.post('/api/likes', createLike);
app.put('/api/likes/:id', updateLike);
app.delete('/api/likes/:id', deleteLike);

// ListeningHistory
app.get('/api/listening-history', getAllHistory);
app.get('/api/listening-history/:id', getHistoryById);
app.post('/api/listening-history', createHistory);
app.put('/api/listening-history/:id', updateHistory);
app.delete('/api/listening-history/:id', deleteHistory);

// SearchHistory
app.get('/api/search-history', getAllSearches);
app.get('/api/search-history/:id', getSearchById);
app.post('/api/search-history', createSearch);
app.put('/api/search-history/:id', updateSearch);
app.delete('/api/search-history/:id', deleteSearch);

// Roles
app.get('/api/roles', getAllRoles);
app.get('/api/roles/:id', getRoleById);
app.post('/api/roles', createRole);
app.put('/api/roles/:id', updateRole);
app.delete('/api/roles/:id', deleteRole);

// Gọi hàm khởi chạy
startApp();
