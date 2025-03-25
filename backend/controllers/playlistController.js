// controllers/playlistController.js
const { sql, getPool } = require('../config/database');

async function getAllPlaylists(req, res) {
  try {
    const playlists = await getAllPlaylistsRaw();
    res.json(playlists);
  } catch (err) {
    console.error('Error fetching playlists:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}

async function getAllPlaylistsRaw() {
  const pool = await getPool();
  const result = await pool.request().query('SELECT * FROM Playlists');
  return result.recordset;
}

async function getPlaylistById(req, res) {
  try {
    const { id } = req.params;
    const pool = await getPool();
    const result = await pool.request()
      .input('PlaylistID', sql.Int, id)
      .query('SELECT * FROM Playlists WHERE PlaylistID = @PlaylistID');

    if (result.recordset.length === 0) {
      return res.status(404).json({ error: 'Playlist not found' });
    }
    res.json(result.recordset[0]);
  } catch (err) {
    console.error('Error fetching playlist:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}

async function createPlaylist(req, res) {
  try {
    const { UserID, Title } = req.body;
    const pool = await getPool();
    const result = await pool.request()
      .input('UserID', sql.Int, UserID)
      .input('Title', sql.VarChar(255), Title)
      .query(`
        INSERT INTO Playlists (UserID, Title)
        VALUES (@UserID, @Title);
        SELECT SCOPE_IDENTITY() as NewPlaylistID;
      `);

    const newPlaylistID = result.recordset[0].NewPlaylistID;
    res.status(201).json({ message: 'Playlist created successfully', PlaylistID: newPlaylistID });
  } catch (err) {
    console.error('Error creating playlist:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}

async function updatePlaylist(req, res) {
  try {
    const { id } = req.params;
    const { UserID, Title } = req.body;
    const pool = await getPool();
    const result = await pool.request()
      .input('PlaylistID', sql.Int, id)
      .input('UserID', sql.Int, UserID)
      .input('Title', sql.VarChar(255), Title)
      .query(`
        UPDATE Playlists
        SET UserID = @UserID,
            Title = @Title
        WHERE PlaylistID = @PlaylistID
      `);

    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({ error: 'Playlist not found' });
    }
    res.json({ message: 'Playlist updated successfully' });
  } catch (err) {
    console.error('Error updating playlist:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}

async function deletePlaylist(req, res) {
  try {
    const { id } = req.params;
    const pool = await getPool();
    const result = await pool.request()
      .input('PlaylistID', sql.Int, id)
      .query('DELETE FROM Playlists WHERE PlaylistID = @PlaylistID');

    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({ error: 'Playlist not found' });
    }
    res.json({ message: 'Playlist deleted successfully' });
  } catch (err) {
    console.error('Error deleting playlist:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}

module.exports = {
  getAllPlaylists,
  getAllPlaylistsRaw,
  getPlaylistById,
  createPlaylist,
  updatePlaylist,
  deletePlaylist,
};
