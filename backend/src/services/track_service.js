import { Sequelize, Transaction } from 'sequelize';
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
    return await Sequelize.Transaction(async (t) => {
        await db.Track.destroy({ where: { id }, individualHooks: true, transaction: t });
    })
};

//dangkhoi them
const getTracksByUserId = async (userId) => {
  return await db.Track.findAll({
    where: { uploaderId: userId },
    include: [
      // 1) Lấy trackname từ Metadata, dùng alias 'Metadatum'
      // 2) Lấy lịch sử nghe, dùng alias 'listeningHistories'
      
      {
        model: db.listeningHistory,
        as: 'listeningHistories',
        attributes: ['listenCount', 'createdAt'],
        include: [
          // 3) Lấy thông tin listener, dùng alias 'listener'
          {
            model: db.User,
            as: 'listener',
            attributes: ['id', 'Name']
          }
        ]
      }
    ]
  });
};

  const updateTrackStatus = async (id, status) => {
    const track = await db.Track.findByPk(id);
    if (!track) throw new Error('Track not found');
    return await track.update({ status });
  };
  const getJoinedTracks = async () => {
    return await db.listeningHistory.findAll({
      attributes: ['listenCount'],        // chỉ cần số lần nghe
      include: [
        {
          association: 'metadata',        // tên bài
          attributes: ['trackname']
        },
        {
          association: 'track',           // url, ảnh, tác giả
          attributes: ['trackUrl', 'imageUrl', 'uploaderId']
        },
        {
          association: 'listener',        // người nghe
          attributes: [
            'id',
            ['name', 'Name']              // alias → Name
          ]
        }
      ]
    });
  };
export {
    getAllTracks,
    getTrackById,
    getTrackWithUploaderById,
    createTrack,
    updateTrack,
    deleteTrack,
    getTracksByUserId,
    getJoinedTracks,
    updateTrackStatus
};