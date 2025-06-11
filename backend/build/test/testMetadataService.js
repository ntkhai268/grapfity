import path from 'path';
import { extractMetadata } from '../services/metadata_service.js';
const runTest = async () => {
  const fakeTrackId = 'test-track-001';
  const audioPath = path.resolve('/home/ntkhai26/PTIT/grapfity/backend/src/public/assets/track_audio/BacPhan.mp3');
  try {
    const result = await extractMetadata(audioPath);
    console.log('🎯 Metadata Result:');
    console.log(result);
  } catch (err) {
    console.error('❌ Error during metadata test:', err.message);
  }
};
runTest();