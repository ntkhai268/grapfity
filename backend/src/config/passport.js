import { Client } from '@elastic/elasticsearch';
import { readFileSync } from 'fs';

const client = new Client({ node: 'http://elasticsearch:9200' });

async function waitForElastic() {
  let connected = false;
  while (!connected) {
    try {
      await client.ping();
      connected = true;
      console.log('✅ Elasticsearch is up');
    } catch (err) {
      console.log('⏳ Waiting for Elasticsearch...');
      await new Promise(res => setTimeout(res, 2000));
    }
  }
}

async function initIndex(indexName, mappingFile) {
  const exists = await client.indices.exists({ index: indexName });
  if (!exists) {
    console.log(`🔨 Creating index: ${indexName}`);
    const mapping = JSON.parse(readFileSync(mappingFile, 'utf8'));
    await client.indices.create({
      index: indexName,
      body: mapping
    });
  } else {
    console.log(`✅ Index ${indexName} already exists`);
  }
}

async function initElastic() {
  await waitForElastic();
  await initIndex('songs', './config/elastic/songs_mapping.json');
  await initIndex('playlists', './config/elastic/playlists_mapping.json');
  await initIndex('search_logs', './config/elastic/search_logs_mapping.json');
}

export default { client, initElastic };
