// controllers/trackController.js
const { sql, getPool } = require('../config/database');

// Lấy tất cả Tracks (dùng trong API)
async function getAllTracks(req, res) {
  try {
    const tracks = await getAllTracksRaw();
    res.json(tracks);
  } catch (err) {
    console.error('Error fetching tracks:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}

// Lấy tất cả Tracks (dùng nội bộ, trả về mảng recordset)
async function getAllTracksRaw() {
  const pool = await getPool();
  const result = await pool.request().query('SELECT * FROM Tracks');
  return result.recordset;
}

// Lấy Track theo ID
async function getTrackById(req, res) {
  try {
    const { id } = req.params;
    const pool = await getPool();
    const result = await pool.request()
      .input('TrackID', sql.Int, id)
      .query('SELECT * FROM Tracks WHERE TrackID = @TrackID');

    if (result.recordset.length === 0) {
      return res.status(404).json({ error: 'Track not found' });
    }
    res.json(result.recordset[0]);
  } catch (err) {
    console.error('Error fetching track:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}

// Tạo mới Track
async function createTrack(req, res) {
  try {
    const { Title, UserID, Duration, ReleaseDate, Avarta, LinkFile } = req.body;
    const pool = await getPool();
    const result = await pool.request()
      .input('Title', sql.VarChar(255), Title)
      .input('UserID', sql.Int, UserID)
      .input('Duration', sql.Int, Duration)
      .input('ReleaseDate', sql.Date, ReleaseDate)
      .input('Avarta', sql.VarChar(255), Avarta)
      .input('LinkFile', sql.VarChar(255), LinkFile)
      .query(`
        INSERT INTO Tracks (Title, UserID, Duration, ReleaseDate, Avarta, LinkFile)
        VALUES (@Title, @UserID, @Duration, @ReleaseDate, @Avarta, @LinkFile);
        SELECT SCOPE_IDENTITY() as NewTrackID;
      `);

    const newTrackID = result.recordset[0].NewTrackID;
    res.status(201).json({ message: 'Track created successfully', TrackID: newTrackID });
  } catch (err) {
    console.error('Error creating track:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}

// Cập nhật Track
async function updateTrack(req, res) {
  try {
    const { id } = req.params;
    const { Title, UserID, Duration, ReleaseDate, Avarta, LinkFile } = req.body;
    const pool = await getPool();
    const result = await pool.request()
      .input('TrackID', sql.Int, id)
      .input('Title', sql.VarChar(255), Title)
      .input('UserID', sql.Int, UserID)
      .input('Duration', sql.Int, Duration)
      .input('ReleaseDate', sql.Date, ReleaseDate)
      .input('Avarta', sql.VarChar(255), Avarta)
      .input('LinkFile', sql.VarChar(255), LinkFile)
      .query(`
        UPDATE Tracks
        SET Title = @Title,
            UserID = @UserID,
            Duration = @Duration,
            ReleaseDate = @ReleaseDate,
            Avarta = @Avarta,
            LinkFile = @LinkFile
        WHERE TrackID = @TrackID
      `);

    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({ error: 'Track not found' });
    }
    res.json({ message: 'Track updated successfully' });
  } catch (err) {
    console.error('Error updating track:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}

// Xoá Track
async function deleteTrack(req, res) {
  try {
    const { id } = req.params;
    const pool = await getPool();
    const result = await pool.request()
      .input('TrackID', sql.Int, id)
      .query('DELETE FROM Tracks WHERE TrackID = @TrackID');

    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({ error: 'Track not found' });
    }
    res.json({ message: 'Track deleted successfully' });
  } catch (err) {
    console.error('Error deleting track:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}

module.exports = {
  getAllTracks,
  getAllTracksRaw,
  getTrackById,
  createTrack,
  updateTrack,
  deleteTrack,
};
