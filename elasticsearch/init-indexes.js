// init-indexes.js
import { Client } from '@elastic/elasticsearch';

const client = new Client({ node: 'http://elasticsearch:9200', compatibility: true });

const run = async () => {
  const indexName = 'search_entities';

  // Kiểm tra nếu index đã tồn tại thì bỏ qua
  const { body: exists } = await client.indices.exists({ index: indexName });
  if (exists) {
    console.log(`✅ Index "${indexName}" đã tồn tại`);
    return;
  }

  // Tạo index với mapping
  await client.indices.create({
    index: indexName,
    body: {
      mappings: {
        properties: {
          type: { type: 'keyword' },
          // TRACK
          trackId: { type: 'integer' },
          title: { type: 'text' },
          artist: { type: 'text' },
          uploaderId: { type: 'integer' },
          imageUrl: { type: 'text', index: false },
          trackUrl: { type: 'text', index: false },
          // PLAYLIST
          playlistId: { type: 'integer' },
          userId: { type: 'integer' },
          // USER
          username: { type: 'text' },
          name: { type: 'text' }
        }
      }
    }
  });

  console.log(`✅ Index "${indexName}" đã được tạo thành công`);
};

run().catch((err) => {
  console.error('❌ Lỗi khi khởi tạo index:', err);
});
