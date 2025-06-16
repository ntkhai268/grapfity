// rs_service.js
import { getMostSimilarTracks } from "./metadata_service.js";
import db from "../models/index.js"

export const recommendForHome = async (userId) => {
  const trackScores = new Map();

  // Lượt nghe
  const histories = await db.listeningHistory.findAll({
    where: { userId },
    attributes: ["trackId", "listenCount"],
  });
  for (const h of histories) {
    trackScores.set(h.trackId, (trackScores.get(h.trackId) || 0) + h.listenCount);
  }

  // Lượt thích
  const likes = await db.Like.findAll({
    where: { userId },
    attributes: ["trackId"],
  });
  for (const l of likes) {
    trackScores.set(l.trackId, (trackScores.get(l.trackId) || 0) + 10);
  }

  // Lấy 5 bài có điểm cao nhất
  const seeds = [...trackScores.entries()]
    .sort((a, b) => b[1] - a[1]) //b[1] a[1] bởi vì seed là [trackId, score]
    .slice(0, 5)
    .map(([trackId]) => trackId); // tương tự như .map(seed => seed[0]) chỉ là dùng destructuring

  const recommendations = new Set();
  for (const seed of seeds) {
    const metadata = await db.Metadata.findOne({ where: { track_id: seed } });
    if (!metadata) continue;
    const topSimilar = await getMostSimilarTracks(metadata, 10);
    topSimilar.forEach((tId) => recommendations.add(tId));
  }

  const listened = new Set(histories.map((h) => h.trackId));
  const trackIds = [...recommendations].filter((id) => !listened.has(id));

  const tracks = await db.Track.findAll({
    where: { id: trackIds },
    include: [
      {
        model: db.User,
        attributes: ["userName"],
      },
    ],
  });

  //dùng include metadata không được nên hard code
  for (const track of tracks) {
    const metadata = await db.Metadata.findOne({ 
      where: { track_id: track.id }, 
      attributes: ["trackname"] 
    });
    track.trackname = metadata?.trackname || null;
  }

  const result = tracks.map((track) => ({
    id: track.id,
    src: track.trackUrl,
    title: track.trackname || "Không rõ tên",
    artist: track.User?.userName || "Không rõ nghệ sĩ",
    cover: track.imageUrl,
  }));
  return result;
};

export const recommendForTrack = async (trackId) => {
  const metadata = await db.Metadata.findOne({ where: { track_id: trackId } });
  if (!metadata) return [];

  const similarTrackIds = await getMostSimilarTracks(metadata, 10);

  const tracks = await db.Track.findAll({
    where: { id: similarTrackIds },
    include: [
      {
        model: db.User,
        attributes: ["userName"],
      },
    ],
  });

  for (const track of tracks) {
    const meta = await db.Metadata.findOne({ 
      where: { track_id: track.id }, 
      attributes: ["trackname"] 
    });
    track.trackname = meta?.trackname || null;
  }

  const result = tracks.map((track) => ({
    id: track.id,
    src: track.trackUrl,
    title: track.trackname || "Không rõ tên",
    artist: track.User?.userName || "Không rõ nghệ sĩ",
    cover: track.imageUrl,
  }));

  return result;
};

