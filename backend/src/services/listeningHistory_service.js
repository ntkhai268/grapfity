import db from '../models/index.js';

const getListeningHistoryOfUser = async (userId) => {
  const histories = await db.listeningHistory.findAll({
    where: { userId },
    attributes: ['listenCount', 'createdAt'],
    include: [
      {
        model: db.Track,
        attributes: ['id', 'trackname', 'trackUrl', 'imageUrl', 'uploaderId', 'createdAt'],
        include: [
          {
            model: db.User,
            attributes: ['id', ['name', 'UploaderName']]
          }
        ]
      },
      {
        model: db.User,
        attributes: ['id', ['name', 'Name']]
      }
    ]
  });

  return histories;
};



const trackingListeningHistory = async (userId, trackId) => {
  const [history, created] = await db.listeningHistory.findOrCreate({
    where: { userId, trackId },
    defaults: { listenCount: 1 }  // Nếu mới, bắt đầu từ 1
  });

  if (!created) {
    await history.increment('listenCount', { by: 1 });
  }

  return history;
};


//lấy ra 10 bài có số lượt nghe cao nhất hệ thống
// dùng group để đếm tổng số luuợt nghe dựa trên trackId
const getTop10PopularTracks = async () => {
  const { listeningHistory, Track, User } = db;

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
      attributes: ['id', 'trackname','trackUrl', 'imageUrl', 'uploaderId'],
      include: [
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
    title: track.trackname  || "",     // Lấy từ Metadata
    artist: track.User?.Name ?? undefined,                  // Lấy từ User
    cover: track.imageUrl ?? undefined                      // Ảnh bìa
  } : null;
}).filter(Boolean);

return tracks;
};


// Service: Lấy 5 bài hát nghe nhiều nhất của user
const getTop5TracksOfUser = async (userId) => {
  const { listeningHistory, Track, User } = db;
  const results = await listeningHistory.findAll({
    where: { userId },
    include: [
      {
        model: Track,
        where: { privacy: 'public' },
        attributes: ['id', 'trackUrl', 'imageUrl', 'privacy', 'uploaderId', 'trackname'],
        include: [
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

const getTop5TracksByProfile = async (uploaderId) => {
  // console.log("===>🧪🧪🧪 getTop5TracksByOwner được gọi với uploaderId:", uploaderId);
  const { Track, User } = db;

  const topTracks = await db.sequelize.query(
    `
    SELECT t.id as trackId, ISNULL(SUM(lh.listenCount), 0) AS totalListenCount
    FROM Tracks t
    LEFT JOIN listeningHistories lh ON t.id = lh.trackId
    WHERE t.uploaderId = :uploaderId AND t.privacy = 'public'
    GROUP BY t.id
    ORDER BY totalListenCount DESC
    OFFSET 0 ROWS FETCH NEXT 5 ROWS ONLY
    `,
    {
      replacements: { uploaderId },
      type: db.Sequelize.QueryTypes.SELECT
    }
  );
  // console.log("===>🧪🧪🧪 topTracks:", topTracks);

  if (!topTracks.length) {
    console.log("[DEBUG] No topTracks found");
    return [];
  }

  const trackIds = topTracks.map(t => t.trackId);

  const tracks = await Track.findAll({
    where: { id: trackIds},
    include: [
      { model: User, attributes: ['Name'] }
    ]
  });

  // Tạo tracksMap để merge theo đúng thứ tự, tránh find bị sai/thiếu
  const tracksMap = {};
  tracks.forEach(t => { tracksMap[String(t.id)] = t; });

  return topTracks.map(t => {
    const track = tracksMap[String(t.trackId)];
    if (!track) {
      console.log(`🛑 Không tìm thấy info cho trackId ${t.trackId}`);
      return null;
    }
    return {
      id: track.id,
      src: track.trackUrl || "",
      title: track.Metadatum?.trackname ?? undefined,
      artist: track.User?.Name ?? undefined,
      cover: track.imageUrl ?? undefined,
      listenCount: t.totalListenCount || 0
    };
  }).filter(Boolean);
};

export {
    getListeningHistoryOfUser,
    trackingListeningHistory,
    getTop10PopularTracks,
    getTop5TracksOfUser,
    getTop5TracksByProfile
};
