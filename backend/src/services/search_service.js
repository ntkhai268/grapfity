import { Client } from '@elastic/elasticsearch';

const es = new Client({ node: 'http://elasticsearch:9200', compatibility: true });

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

export const indexTrack = async (track, metadata, uploader) => {
  await es.index({
    index: 'search_entities',
    id: `track_${track.id}`,
    document: {
      type: 'track',
      title: metadata.trackname || 'unknown',
      artist: uploader.userName,
      uploaderId: uploader.id,
      trackId: track.id,
      imageUrl: track.imageUrl,
      trackUrl: track.trackUrl
    }
  });
};

export const indexUser = async (user) => {
  await es.index({
    index: 'search_entities',
    id: `user_${user.id}`,
    document: {
      type: 'user',
      name: user.Name || '',
      username: user.userName,
      userId: user.id,
      avatar: user.Avatar || ''
    }
  });
};

export const indexPlaylist = async (playlist) => {
  await es.index({
    index: 'search_entities',
    id: `playlist_${playlist.id}`,
    document: {
      type: 'playlist',
      title: playlist.title,
      playlistId: playlist.id,
      userId: playlist.userId,
      imageUrl: playlist.imageUrl || ""
    }
  });
};

export const deleteEntity = async (type, id) => {
  await es.delete({
    index: 'search_entities',
    id: `${type}_${id}`
  });
};
