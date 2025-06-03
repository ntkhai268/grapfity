import { Client } from '@elastic/elasticsearch';

const es = new Client({ node: 'http://localhost:9200', compatibility: true });

export const searchEntities = async (query) => {
  console.log('aaa')
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
  console.log('Elastic result:', result);
  return result.hits.hits.map((hit) => hit._source);
};
