import { Client } from '@elastic/elasticsearch';

const es = new Client({ node: 'http://elasticsearch:9200' }); // ❌ bỏ compatibility


export const searchEntities = async (query) => {
  try {
    console.log('>>> Đang tìm kiếm với từ khóa:', query);

    const result = await es.search({
      index: 'search_entities',
      query: {
        multi_match: {
          type: 'best_fields',
          query,
          fields: ['title^2', 'username', 'name', 'artist'],
          fuzziness: 'AUTO'
        }
      }
    });

    console.log('>>> Kết quả Elastic:', result?.hits?.hits);
    return result.hits.hits.map((hit) => hit._source);
  } catch (err) {
    console.error('❌ Elasticsearch query failed:', err.meta?.body?.error || err);
    throw new Error('Lỗi Elasticsearch'); // Để controller trả về status 500 rõ ràng
  }
};
