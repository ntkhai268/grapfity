const db = require('../models/index');

const getAllTracks = async () => {
  return await db.Track.findAll(); // Lấy tất cả dữ liệu trong bảng Track
}   

const getTrackById = async (id) => { 
    return await db.Track.findByPk(id); // Lấy dữ liệu của track theo id
}

const getTrackWithUploaderById = async (id) => {
    return await db.Track.findByPk(id, {
        include: {
            model: db.User,
            attributes: ['username'],
        }
    });
}

const createTrack = async (trackUrl, imageUrl, uploaderId) => {
    return await db.Track.create({ trackUrl, imageUrl, uploaderId });
}

const updateTrack = async (id, updateData) => {
    const track = await db.Track.findByPk(id);
    if (!track) throw new Error('Track not found');
    await track.update(updateData);
    return track;
}

const deleteTrack = async (id) => {
    // cần xử lý thêm giao tác với các bảng khác nếu có quan hệ khóa ngoại, không đơn giản
    // return await db.Track.destroy({ where: { id } });
}

module.exports = {
    getAllTracks,
    getTrackById,
    getTrackWithUploaderById,
    createTrack,
    updateTrack,
    deleteTrack
}   