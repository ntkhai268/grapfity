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

export {
    getListeningHistoryOfUser,
    trackingListeningHistory
};
