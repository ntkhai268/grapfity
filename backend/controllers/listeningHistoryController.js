// controllers/listeningHistoryController.js
const { sql, getPool } = require('../config/database');

async function getAllHistory(req, res) {
  try {
    const history = await getAllHistoryRaw();
    res.json(history);
  } catch (err) {
    console.error('Error fetching listening history:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}

async function getAllHistoryRaw() {
  const pool = await getPool();
  const result = await pool.request().query('SELECT * FROM ListeningHistory');
  return result.recordset;
}

async function getHistoryById(req, res) {
  try {
    const { id } = req.params;
    const pool = await getPool();
    const result = await pool.request()
      .input('HistoryID', sql.Int, id)
      .query('SELECT * FROM ListeningHistory WHERE HistoryID = @HistoryID');

    if (result.recordset.length === 0) {
      return res.status(404).json({ error: 'History not found' });
    }
    res.json(result.recordset[0]);
  } catch (err) {
    console.error('Error fetching history:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}

async function createHistory(req, res) {
  try {
    const { UserID, TrackID } = req.body;
    const pool = await getPool();
    const result = await pool.request()
      .input('UserID', sql.Int, UserID)
      .input('TrackID', sql.Int, TrackID)
      .query(`
        INSERT INTO ListeningHistory (UserID, TrackID)
        VALUES (@UserID, @TrackID);
        SELECT SCOPE_IDENTITY() as NewHistoryID;
      `);

    const newHistoryID = result.recordset[0].NewHistoryID;
    res.status(201).json({ message: 'Listening history created', HistoryID: newHistoryID });
  } catch (err) {
    console.error('Error creating listening history:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}

// Có thể thêm update nếu muốn thay đổi TrackID hay UserID, tuỳ nhu cầu
async function updateHistory(req, res) {
  try {
    const { id } = req.params;
    const { UserID, TrackID } = req.body;
    const pool = await getPool();
    const result = await pool.request()
      .input('HistoryID', sql.Int, id)
      .input('UserID', sql.Int, UserID)
      .input('TrackID', sql.Int, TrackID)
      .query(`
        UPDATE ListeningHistory
        SET UserID = @UserID,
            TrackID = @TrackID
        WHERE HistoryID = @HistoryID
      `);

    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({ error: 'History not found' });
    }
    res.json({ message: 'Listening history updated successfully' });
  } catch (err) {
    console.error('Error updating listening history:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}

async function deleteHistory(req, res) {
  try {
    const { id } = req.params;
    const pool = await getPool();
    const result = await pool.request()
      .input('HistoryID', sql.Int, id)
      .query('DELETE FROM ListeningHistory WHERE HistoryID = @HistoryID');

    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({ error: 'History not found' });
    }
    res.json({ message: 'Listening history deleted successfully' });
  } catch (err) {
    console.error('Error deleting listening history:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}

module.exports = {
  getAllHistory,
  getAllHistoryRaw,
  getHistoryById,
  createHistory,
  updateHistory,
  deleteHistory,
};
