import { Sequelize, Transaction } from 'sequelize';
import db from '../models/index.js';

const getAllTracks = async () => {
    return await db.Track.findAll({
        where: {
            status: 'approved',
            privacy: 'public'
            
        },
        include: [
            {
                model: db.Metadata
            },
            {
                model: db.User, // ✅ KHÔNG dùng `as`
                attributes: ['id', 'Name']
            }
        ]
    }); // Lấy tất cả dữ liệu trong bảng Track
};

const getAllTracksForAdmin = async () => {
    return await db.Track.findAll({
        include: {
            model: db.Metadata
        },
        order: [['createdAt', 'DESC']]
    });
};


const getTrackById = async (trackId) => {
    const numericTrackId = Number(trackId);
    if (isNaN(numericTrackId)) {
        console.error(`TrackService: Invalid track ID received in getTrackById: ${trackId}`);
        return null;
    }

    try {
        const track = await db.Track.findOne( {
            where: {
                id: numericTrackId,
                status: 'approved' 
            },
            // Bạn có thể chọn các attributes cụ thể từ bảng Track nếu muốn
            attributes: ['id', 'trackUrl', 'imageUrl', 'uploaderId', 'createdAt', 'updatedAt'], 
            include: [
                {
                    model: db.User, // Nếu bạn muốn lấy thông tin người upload
                    as: 'User',     // Đảm bảo alias 'User' khớp với định nghĩa trong model Track
                                    // Ví dụ: Track.belongsTo(models.User, { as: 'User', ...})
                                    // Bỏ 'as' nếu không đặt alias cụ thể trong association.
                    attributes: ['id', 'Name']
                },
                {
                    model: db.Metadata,
                    as: 'Metadatum', // QUAN TRỌNG: Sử dụng alias 'Metadatum' (số ít, viết hoa M)
                                     // nếu Track.hasOne(models.Metadata) không có 'as' trong định nghĩa model.
                                     // Hoặc dùng alias bạn đã đặt trong Track.hasOne(models.Metadata, { as: 'yourAlias' })
                    attributes: [ // Liệt kê các trường bạn muốn lấy từ Metadatum
                        'trackname',
                        'duration_ms',
                        'explicit',
                        'danceability',
                        'energy',
                        'key',
                        'loudness',
                        'mode',
                        'speechiness',
                        'acousticness',
                        'instrumentalness',
                        'liveness',
                        'valence',
                        'tempo',
                        'time_signature',
                        'year',
                        'release_date',
                        'lyrics' // <<<--- ĐẢM BẢO LẤY TRƯỜNG 'lyrics'
                    ]
                }
                // Bạn có thể include thêm các model khác liên quan đến Track nếu cần
            ]
        });

        if (!track) {
            console.warn(`TrackService: Track with ID ${numericTrackId} not found.`);
            return null; // Trả về null nếu không tìm thấy track
        }
        // console.log(`TrackService - getTrackById - Track ID ${numericTrackId} - Raw Metadatum:`, JSON.stringify(track.Metadatum, null, 2));
        // console.log(`TrackService - getTrackById - Track ID ${numericTrackId} - Lyrics from Metadatum:`, track.Metadatum?.lyrics);

        // Dữ liệu trả về từ Sequelize sẽ tự động là plain objects khi dùng với res.json()
        // Hoặc bạn có thể gọi .get({ plain: true }) nếu muốn chắc chắn là POJO trước khi trả về từ service
        // return track.get({ plain: true }); 
        return track;

    } catch (error) {
        console.error(`TrackService: Error fetching track with ID ${numericTrackId}:`, error);
        throw error; // Ném lỗi để controller xử lý
    }
};

const getTrackWithUploaderById = async (id) => {
    return await db.Track.findOne({
        where: {
            id,
            status: 'approved' 
        },
        include: {
            model: db.User,
            attributes: ['username', 'Name'],
        }
    });
};

const getTracksByUploaderId = async (userId) => {
    const numericUserId = Number(userId);
    if (isNaN(numericUserId)) {
        console.error(`TrackService: Invalid user ID received in getTracksByUploaderId: ${userId}`);
        // Có thể ném lỗi hoặc trả về mảng rỗng tùy logic xử lý lỗi của bạn
        throw new Error("User ID không hợp lệ."); 
        // Hoặc: return [];
    }

    try {
        const tracks = await db.Track.findAll({
            where: {
                uploaderId: numericUserId, // Lọc theo uploaderId
                status : 'approved'
            },
            // Include các thông tin cần thiết giống như khi lấy chi tiết một track
            attributes: ['id', 'trackUrl', 'imageUrl', 'uploaderId', 'createdAt', 'updatedAt'], 
            include: [
                {
                    model: db.User, // Thông tin người upload (chính là user đang truy vấn)
                    as: 'User',     // Đảm bảo alias khớp với model Track
                    attributes: ['id', 'Name']
                },
                {
                    model: db.Metadata,
                    as: 'Metadatum', // Đảm bảo alias khớp với model Track
                    attributes: [ // Liệt kê các trường metadata cần thiết
                        'trackname',
                        'duration_ms',
                        'lyrics' // Lấy cả lyrics
                        // Thêm các trường khác nếu cần
                    ]
                }
            ],
            order: [
                ['createdAt', 'DESC'] // Sắp xếp theo ngày tạo mới nhất (tùy chọn)
            ]
        });

        console.log(`TrackService: Found ${tracks.length} tracks for uploader ID ${numericUserId}`);
        // Dữ liệu trả về đã bao gồm các include
        return tracks; 

    } catch (error) {
        console.error(`TrackService: Error fetching tracks for uploader ID ${numericUserId}:`, error);
        throw error; // Ném lỗi để controller xử lý
    }
};

const createTrack = async (trackUrl, imageUrl, uploaderId,privacy,  metadata) => {
     const newTrack = await db.Track.create({ trackUrl, imageUrl, uploaderId, status: 'pending', privacy} );
    metadata.track_id = newTrack.id   
    const {
        trackname, track_id, explicit, danceability,
        energy, key, loudness, mode, speechiness,
        acousticness, instrumentalness, liveness,
        valence, tempo, duration_ms, time_signature, year, release_date, lyrics
    } = metadata
   

    await db.Metadata.create({
        trackname, track_id, explicit, danceability,
        energy, key, loudness, mode, speechiness,
        acousticness, instrumentalness, liveness,
        valence, tempo, duration_ms, time_signature, year, release_date, lyrics
    });
    return newTrack;
};

// chỉ cho phép user cập nhật bài hát mà họ quản lí, không cập nhật status được
const updateTrack = async (id, updateData, userId) => {
    const track = await db.Track.findByPk(id);
    if (!track) throw new Error('Track not found');
    if (track.uploaderId !== userId) {
        throw new Error('Unauthorized: You can only edit your own tracks.');
    }
    if ('status' in updateData) {
        delete updateData.status;
    }
    // Chỉ cập nhật các trường cho phép
    const allowedFields = ['title', 'imageUrl', 'lyrics', 'privacy'];
    const safeUpdateData = {};
    for (const field of allowedFields) {
        if (field in updateData) {
        safeUpdateData[field] = updateData[field];
        }
    }
    await track.update(safeUpdateData);
    return track;
};

const deleteTrack = async (id, userId) => {
    const track = await db.Track.findByPk(id);
    console.log("track.uploaderId: ", track.uploaderId )
    if (!track|| track.uploaderId !== userId) {
        throw new Error("Unauthorized: You can only delete your own tracks.");
    }
    return await db.sequelize.transaction(async (t) => {
        await db.PlaylistTrack.destroy({ where: { trackId: id }, transaction: t });
        await db.Track.destroy({ where: { id }, individualHooks: true, transaction: t });
    })
};

export {
    getAllTracks,
    getAllTracksForAdmin,
    getTrackById,
    getTrackWithUploaderById,
    getTracksByUploaderId,
    createTrack,
    updateTrack,
    deleteTrack
};
