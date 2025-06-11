import { exec } from 'child_process';
import path from 'path';
import util from 'util';
import db from '../models/index.js';
const execAsync = util.promisify(exec);
const extractMetadata = async filePath => {
  const absolutePath = path.resolve(filePath);
  const inputDir = path.dirname(absolutePath);
  const filename = path.basename(absolutePath);
  const dockerCmd = ['sudo docker run --rm', `-v "${inputDir}:/input"`, 'ntkhai2608/music-extractor', 'python', 'scripts/extract_audio_features.py', `/input/${filename}`].join(' ');
  try {
    const {
      stdout
    } = await execAsync(dockerCmd);
    const jsonStart = stdout.indexOf('{');
    const jsonEnd = stdout.lastIndexOf('}') + 1;
    if (jsonStart === -1 || jsonEnd === -1) {
      throw new Error('Không tìm thấy JSON trong output.');
    }
    const jsonStr = stdout.slice(jsonStart, jsonEnd);
    const result = JSON.parse(jsonStr);
    const {
      prediction = {},
      ...rest
    } = result;
    return {
      ...rest,
      ...prediction
    };
  } catch (err) {
    console.error(`❌ Lỗi khi extract metadata cho file ${filePath}:`, err.message);
    throw new Error('Docker metadata extraction failed');
  }
};
const metadataStats = {
  // khởi tạo các giá trị ban đầu
  duration_ms: {
    min: 175000,
    max: 345312
  },
  loudness: {
    min: -9.0,
    max: 6799.71875
  },
  tempo: {
    min: 0.0,
    max: 135.0
  },
  key: {
    min: 0,
    max: 11
  },
  mode: {
    min: 0,
    max: 1
  },
  explicit: {
    min: 0,
    max: 1
  },
  danceability: {
    min: 0,
    max: 0.95
  },
  speechiness: {
    min: 0,
    max: 0.07
  },
  acousticness: {
    min: 0,
    max: 0.3
  },
  instrumentalness: {
    min: 0,
    max: 0.3
  },
  liveness: {
    min: 0,
    max: 0.3
  },
  valence: {
    min: 0,
    max: 0.95
  },
  energy: {
    min: 0,
    max: 0.95
  }
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
const checkMetadataSimilarity = async metadata => {
  const fields = ['duration_ms', 'loudness', 'tempo', 'key', 'mode', 'explicit', 'danceability', 'speechiness', 'acousticness', 'instrumentalness', 'liveness', 'valence', 'energy'];
  for (const field of fields) {
    updateStatsWithNewValue(field, metadata[field], metadataStats);
  }
  const newVec = fields.map(f => normalize(metadata[f], f, metadataStats));
  console.log('newVec:');
  const existingMetadatas = await db.Metadata.findAll({
    attributes: fields
  });
  const distance = (a, b) => {
    return Math.sqrt(a.reduce((sum, ai, i) => {
      const bi = b[i];
      return sum + (ai - bi) ** 2;
    }, 0));
  };
  for (const row of existingMetadatas) {
    const existingVec = fields.map(f => normalize(parseFloat(row[f]), f, metadataStats));
    const d = distance(newVec, existingVec);
    console.log("🔍 existingVec:", existingVec, "→ d:", d.toFixed(4));
    if (d < 0.4) return false;
  }
  return true;
};
export { extractMetadata, checkMetadataSimilarity };