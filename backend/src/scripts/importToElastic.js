import { Client } from '@elastic/elasticsearch';
import db from '../models/index.js'; // <-- chính xác theo mẫu bạn gửi

const es = new Client({
    node: 'http://localhost:9200'
});

async function importToElastic() {
    try {
        // Kết nối CSDL
        await db.connectToDB();

        // Lấy toàn bộ dữ liệu
        const users = await db.User.findAll({ raw: true });
        const playlists = await db.Playlist.findAll({ raw: true });
        const tracks = await db.Track.findAll({
            raw: true,
            nest: true
        });

        const bulkBody = [];

        // User
        users.forEach((user) => {
            bulkBody.push({ index: { _index: 'search_entities', _id: `user_${user.id}` } });
            bulkBody.push({
                type: 'user',
                name: user.Name,
                username: user.userName,
                userId: user.id
            });
        });

        // Playlist
        playlists.forEach((pl) => {
            bulkBody.push({ index: { _index: 'search_entities', _id: `playlist_${pl.id}`} });
            bulkBody.push({
                type: 'playlist',
                title: pl.title,
                playlistId: pl.id,
                userId: pl.userId,
                imageUrl: pl.imageUrl
            });
        });

        // Track
        tracks.forEach((track) => {
            bulkBody.push({ index: { _index: 'search_entities', _id: `track_${track.id}` } });
            bulkBody.push({
                type: 'track',
                title: track.Metadatum?.trackname || 'unknown',
                artist: track.uploader?.name || 'unknown',
                uploaderId: track.uploaderId,
                trackId: track.id,
                imageUrl: track.imageUrl,       // thêm đường dẫn ảnh
                trackUrl: track.trackUrl        // thêm đường dẫn audio
            });
        });

        // Gửi dữ liệu lên Elasticsearch
        const result = await es.bulk({ refresh: true, body: bulkBody });

        if (result.errors) {
            console.error('❌ Có lỗi khi index:', result.body.items);
        } else {
            console.log('✅ Đã import toàn bộ dữ liệu vào Elasticsearch.');
        }
    } catch (err) {
        console.error('❌ Lỗi khi import:', err);
    }
}

importToElastic();
