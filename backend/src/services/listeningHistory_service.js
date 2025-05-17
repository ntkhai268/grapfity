import db from '../models/index.js';

const getListeningHistoryOfUser = async (userId) => {
    const histories = await db.listeningHistory.findAll({ where: { userId } });
    return histories;
};

const trackingListeningHistory = async (userId, trackId) => {
    const [history, created] = await db.listeningHistory.findOrCreate({
        where: { userId, trackId },
        defaults: {
            listenCount: 0
        }
    });

    history.listenCount += 1;
    await history.save();
    return history;
};
const getAllListeningHistory = async () => {
    return await db.listeningHistory.findAll({
      attributes: [
        'id',
        'userId',
        'trackId',
        'listenCount',
        'createdAt',
        'updatedAt'
      ]
    });
  };
  
  export {
    getListeningHistoryOfUser,
    trackingListeningHistory,
    getAllListeningHistory    // xuất thêm
  };
