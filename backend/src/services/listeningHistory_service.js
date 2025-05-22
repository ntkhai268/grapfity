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

//lấy ra 10 bài có số lượt nghe cao nhất hệ thống
// dùng group để đếm tổng số luuợt nghe dựa trên trackId
const getTop10PopularTracks = async () => {
  const { listeningHistory, Track, Metadata, User } = db;

  const results = await listeningHistory.findAll({
  attributes: [
    'trackId',
    [db.Sequelize.fn('SUM', db.Sequelize.col('listenCount')), 'totalListens'],
    [db.Sequelize.fn('MAX', db.Sequelize.col('listeningHistory.updatedAt')), 'lastHeardAt']
  ],
  include: [
    {
      model: db.Track,
      where: { privacy: 'public' },
      attributes: ['id', 'trackUrl', 'imageUrl', 'uploaderId'],
      include: [
          {
            model: db.Metadata,
            as: 'Metadatum', // đảm bảo đúng alias theo model
             attributes: ['trackname'] 
          },
          {
            model: db.User,
            attributes: ['id','Name']
          }
        ]
    }
  ],
  group: [
    'trackId',
    'Track.id',
    'Track.trackUrl',
    'Track.imageUrl', 
    'Track.uploaderId',
    'Track->Metadatum.track_id', 
    'Track->Metadatum.trackname',
    'Track->User.id',
    'Track->User.Name'
  ],
  order: [
    [db.Sequelize.literal('totalListens'), 'DESC'],
    [db.Sequelize.literal('lastHeardAt'), 'DESC']
  ],
  
});

  const tracks = results.map(row => {
  const track = row.Track;
  return track ? {
    id: track.id,
    src: track.trackUrl || "",                              // Chuẩn hóa field src
    title: track.Metadatum?.trackname ?? undefined,         // Lấy từ Metadata
    artist: track.User?.Name ?? undefined,                  // Lấy từ User
    cover: track.imageUrl ?? undefined                      // Ảnh bìa
  } : null;
}).filter(Boolean);

return tracks;
};


// Service: Lấy 5 bài hát nghe nhiều nhất của user
const getTop5TracksOfUser = async (userId) => {
  const { listeningHistory, Track, Metadata, User } = db;
  const results = await listeningHistory.findAll({
    where: { userId },
    include: [
      {
        model: Track,
        where: { privacy: 'public' },
        attributes: ['id', 'trackUrl', 'imageUrl', 'privacy', 'uploaderId'],
        include: [
          {
            model: Metadata,
            attributes: ['trackname'] // Lấy title và các trường cần thiết
          },
          {
            model: User,
        
            attributes: ['Name'] // Lấy tên nghệ sĩ (artist)
          }
        ]
      }
    ],
    order: [['listenCount', 'DESC']],
    limit: 5
  });
  const tracks = results.map(row => {
  const track = row.Track;
  return track ? {
    id: track.id,
    src: track.trackUrl || "",                              // Chuẩn hóa field src
    title: track.Metadatum?.trackname ?? undefined,         // Lấy từ Metadata
    artist: track.User?.Name ?? undefined,                  // Lấy từ User
    cover: track.imageUrl ?? undefined                      // Ảnh bìa
  } : null;
}).filter(Boolean);

return tracks;
};




export {
    getListeningHistoryOfUser,
    trackingListeningHistory,
    getTop10PopularTracks,
    getTop5TracksOfUser
};
