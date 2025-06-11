import db from "../models/index.js";
const getRecentlyTracks = async userId => {
  return await db.listeningHistory.findAll({
    where: {
      userId: userId
    },
    order: [['createdAt', 'DESC']]
  });
};
export { getRecentlyTracks };