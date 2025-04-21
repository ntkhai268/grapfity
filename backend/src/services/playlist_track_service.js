import db from '../models/index.js';

const addTrackToPlaylist = async (playlistId, trackId) => {
    console.log(">> PlaylistID: ", playlistId);
    const exist = await db.PlaylistTrack.findOne({
        where: { playlistId, trackId }
    });

    if (exist) {
        throw new Error("Bài hát đã có trong Playlist");
    }

    return await db.PlaylistTrack.create({ playlistId, trackId });
};

const removeTrackFromPlaylist = async (playlistId, trackId) => {
    const deleted = await db.PlaylistTrack.destroy({
        where: { playlistId, trackId }
    });

    return deleted;
};

const getTracksInPlaylist = async (playlistId) => {
    const results = await db.PlaylistTrack.findAll({
        where: { playlistId },
        include: [
            {
                model: db.Track,
                attributes: ['id', 'trackUrl', 'imageUrl'],
                include: [
                    {
                        model: db.User,
                        attributes: ['userName']
                    }
                ]
            }
        ]
    });

    console.log(results.map((r) => r.Track));
    return results.map((r) => r.Track);
};

export {
    addTrackToPlaylist,
    removeTrackFromPlaylist,
    getTracksInPlaylist
};
