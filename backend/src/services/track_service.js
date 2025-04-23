import db from '../models/index.js';

const getAllTracks = async () => {
    return await db.Track.findAll({
        include:{
            model: db.Metadata
        }
    }); // Lấy tất cả dữ liệu trong bảng Track
};

const getTrackById = async (id) => {
    return await db.Track.findByPk(id); // Lấy dữ liệu của track theo id
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
    // TODO: cần xử lý nếu có khóa ngoại liên quan
    // return await db.Track.destroy({ where: { id } });
};

export {
    getAllTracks,
    getTrackById,
    getTrackWithUploaderById,
    createTrack,
    updateTrack,
    deleteTrack
};
