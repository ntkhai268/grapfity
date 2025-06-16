import axios from 'axios';
import fs from 'fs';
import FormData from 'form-data';
import path from 'path';
import db from '../models/index.js';

const extractMetadata = async (filePath) => {
  try {
    const absolutePath = path.resolve(filePath);
    const form = new FormData();
    form.append('file', fs.createReadStream(absolutePath));

    const response = await axios.post(
      'http://extract-track-feature:5000/extract',
      form,
      {
        headers: form.getHeaders()
      }
    );

    const result = response.data;
    console.log(result);

    return result;
  } catch (err) {
    console.error(`❌ Lỗi khi extract metadata cho file ${filePath}:`, err.message);
    throw new Error('HTTP metadata extraction failed');
  }
};

const metadataStats = {

  // khởi tạo các giá trị ban đầu
  duration_ms: { min: 175000, max: 345312 },
  loudness: { min: -9.0, max: 6799.71875 },
  tempo: { min: 0.0, max: 135.0 },
  key: { min: 0, max: 11 },
  mode: { min: 0, max: 1 },
  explicit: { min: 0, max: 1 },
  danceability: { min: 0, max: 0.95 },
  speechiness: { min: 0, max: 0.07 },
  acousticness: { min: 0, max: 0.3 },
  instrumentalness: { min: 0, max: 0.3 },
  liveness: { min: 0, max: 0.3 },
  valence: { min: 0, max: 0.95 },
  energy: { min: 0, max: 0.95 }
};

const updateStatsWithNewValue = (field, value, stats) => {
  if (value < stats[field].min) stats[field].min = value;
  if (value > stats[field].max) stats[field].max = value;
};

const normalize = (value, field, stats) => {
  const min = stats[field].min;
  const max = stats[field].max;
  return (value - min) / (max - min || 1);
};

const checkMetadataSimilarity = async (metadata) => {
  const numericFields = ['duration_ms', 'loudness', 'tempo', 'key', 'mode', 'energy'];

  for (const field of numericFields) {
    updateStatsWithNewValue(field, metadata[field], metadataStats);
  }

  const numericVec = numericFields.map(f => normalize(metadata[f], f, metadataStats));

  const embeddingVec = metadata.embedding;

  const newFullVec = [...numericVec, ...embeddingVec];

  const distance = (a, b) => {
    return Math.sqrt(a.reduce((sum, ai, i) => {
      const bi = b[i];
      return sum + (ai - bi) ** 2;
    }, 0));
  };

  // Lấy metadata cũ từ DB, gồm các trường số và embedding
  const existingMetadatas = await db.Metadata.findAll({
    attributes: [...numericFields, 'embedding']
  });

  for (const row of existingMetadatas) {
    const emb = row.embedding;
    if (!Array.isArray(emb)) continue;

    const existingNumericVec = numericFields.map(f =>
      normalize(parseFloat(row[f]), f, metadataStats)
    );

    const existingFullVec = [...existingNumericVec, ...emb];

    const d = distance(newFullVec, existingFullVec);
    console.log("📏 distance:", d.toFixed(4));

    if (d < 0.4) return false; // hoặc threshold bạn định nghĩa
  }

  return true;
};

const getMostSimilarTracks = async (metadata, count = 10) => {
  const numericFields = ['duration_ms', 'loudness', 'tempo', 'key', 'mode', 'energy'];

  // Cập nhật lại min/max nếu có metadata mới
  for (const field of numericFields) {
    updateStatsWithNewValue(field, metadata[field], metadataStats);
  }

  const normalize = (val, field, stats) => {
    const min = stats[field].min;
    const max = stats[field].max;
    if (min === max) return 0.5;
    return (val - min) / (max - min);
  };

  const numericVec = numericFields.map(f => normalize(metadata[f], f, metadataStats));
  const embeddingVec = metadata.embedding || [];
  const inputVec = [...numericVec, ...embeddingVec];

  const distance = (a, b) => {
    return Math.sqrt(a.reduce((sum, ai, i) => {
      const bi = b[i];
      return sum + (ai - bi) ** 2;
    }, 0));
  };

  // Lấy metadata hiện có từ DB
  const existingMetadatas = await db.Metadata.findAll({
    attributes: ['track_id', ...numericFields, 'embedding'],
  });

  const distances = [];

  for (const row of existingMetadatas) {
    const emb = row.embedding;
    if (!Array.isArray(emb)) continue;

    const rowNumericVec = numericFields.map(f =>
      normalize(parseFloat(row[f]), f, metadataStats)
    );

    const rowVec = [...rowNumericVec, ...emb];
    const d = distance(inputVec, rowVec);

    distances.push({
      trackId: row.track_id,
      distance: d,
    });
  }

  distances.sort((a, b) => a.distance - b.distance);

  const result = distances.slice(0, count).map(item => item.trackId);

  return result;
};


export {
  extractMetadata,
  checkMetadataSimilarity,
  getMostSimilarTracks
};
