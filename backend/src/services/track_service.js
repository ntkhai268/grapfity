import { Sequelize, Transaction } from 'sequelize';
import db from '../models/index.js';

const getAllTracks = async () => {
    return await db.Track.findAll({
        include:{
            model: db.Metadata
        }
    }); // Lấy tất cả dữ liệu trong bảng Track
};

const getTrackById = async (trackId) => {
    const numericTrackId = Number(trackId);
    if (isNaN(numericTrackId)) {
        console.error(`TrackService: Invalid track ID received in getTrackById: ${trackId}`);
        return null;
    }

    try {
        const track = await db.Track.findByPk(numericTrackId, {
            // Bạn có thể chọn các attributes cụ thể từ bảng Track nếu muốn
            attributes: ['id', 'trackUrl', 'imageUrl', 'uploaderId', 'createdAt', 'updatedAt'], 
            include: [
                {
                    model: db.User, // Nếu bạn muốn lấy thông tin người upload
                    as: 'User',     // Đảm bảo alias 'User' khớp với định nghĩa trong model Track
                                    // Ví dụ: Track.belongsTo(models.User, { as: 'User', ...})
                                    // Bỏ 'as' nếu không đặt alias cụ thể trong association.
                    attributes: ['id', 'userName']
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
    return await db.Track.findByPk(id, {
        include: {
            model: db.User,
            attributes: ['username'],
        }
    });
};

const createTrack = async (trackUrl, imageUrl, uploaderId, metadata) => {
    const newTrack = await db.Track.create({ trackUrl, imageUrl, uploaderId });
    metadata.track_id = newTrack.id
    const {
        trackname, track_id, explicit, danceability,
        energy, key, loudness, mode, speechiness,
        acousticness, instrumentalness, liveness,
        valence, tempo, duration_ms, time_signature, year, release_date
    } = metadata
    await db.Metadata.create({
        trackname, track_id, explicit, danceability,
        energy, key, loudness, mode, speechiness,
        acousticness, instrumentalness, liveness,
        valence, tempo, duration_ms, time_signature, year, release_date
    });
    return newTrack;
};

const updateTrack = async (id, updateData) => {
    const track = await db.Track.findByPk(id);
    if (!track) throw new Error('Track not found');
    await track.update(updateData);
    return track;
};

const deleteTrack = async (id) => {
    return await Sequelize.Transaction(async (t) => {
        await db.Track.destroy({ where: { id }, individualHooks: true, transaction: t });
    })
};

export {
    getAllTracks,
    getTrackById,
    getTrackWithUploaderById,
    createTrack,
    updateTrack,
    deleteTrack
};
