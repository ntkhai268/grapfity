import { Router } from 'express';
const router = Router();
import userRouter from './user_router.js'; //import router userRouter từ file user_router.js
import authRouter from './auth_router.js'; //import router userRouter từ file user_router.js
import trackRouter from './track_router.js'; //import router userRouter từ file user_router.js
import roleRouter from './role_router.js'; //import router userRouter từ file user_router.js
import playlistRouter from './playlist_router.js'; //import router userRouter từ file user_router.js
import playlisttrackRouter from './playlist_track_router.js';
import likeRouter from './like_router.js';
import listeningHistoryRouter from './listeningHistory_router.js';
import statsRouter from './stats_router.js';
import searchRouter from './search_router.js';

// import metadataRouter from './metadata_router.js';

router.use('', userRouter)
router.use('', authRouter)

console.log('--- api.js Router is being loaded ---');

// Middleware log cho router này
router.use((req, res, next) => {
  console.log(`>>> Request received in api.js: ${req.method} ${req.originalUrl}`);
  next(); 
});

// Middleware log ngay trước khi dùng trackRouter
router.use('/tracks', (req, res, next) => { // Chỉ log nếu path bắt đầu bằng /tracks
    console.log(`>>> Request potentially for trackRouter: ${req.method} ${req.path}`);
    next();
});


router.use('', trackRouter)
router.use('', roleRouter)
router.use('/playlists', playlistRouter)
router.use('', playlisttrackRouter)
router.use('', likeRouter)
router.use('', listeningHistoryRouter)
router.use('', statsRouter)
router.use('/search', searchRouter);
// router.use('', metadataRouter)

export default router; //export router để sử dụng ở file khác