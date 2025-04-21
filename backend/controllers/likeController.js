// controllers/likeController.js
const { sql, getPool } = require('../config/database');

async function getAllLikes(req, res) {
  try {
    const likes = await getAllLikesRaw();
    res.json(likes);
  } catch (err) {
    console.error('Error fetching likes:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}

async function getAllLikesRaw() {
  const pool = await getPool();
  const result = await pool.request().query('SELECT * FROM Likes');
  return result.recordset;
}

async function getLikeById(req, res) {
  try {
    const { id } = req.params;
    const pool = await getPool();
    const result = await pool.request()
      .input('LikeID', sql.Int, id)
      .query('SELECT * FROM Likes WHERE LikeID = @LikeID');

    if (result.recordset.length === 0) {
      return res.status(404).json({ error: 'Like not found' });
    }
    res.json(result.recordset[0]);
  } catch (err) {
    console.error('Error fetching like:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}

async function createLike(req, res) {
  try {
    const { UserID, TrackID } = req.body;
    const pool = await getPool();
    const result = await pool.request()
      .input('UserID', sql.Int, UserID)
      .input('TrackID', sql.Int, TrackID)
      .query(`
        INSERT INTO Likes (UserID, TrackID)
        VALUES (@UserID, @TrackID);
        SELECT SCOPE_IDENTITY() as NewLikeID;
      `);

    const newLikeID = result.recordset[0].NewLikeID;
    res.status(201).json({ message: 'Like created successfully', LikeID: newLikeID });
  } catch (err) {
    console.error('Error creating like:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}

// Cập nhật Like (thay đổi TrackID hay UserID chẳng hạn)
async function updateLike(req, res) {
  try {
    const { id } = req.params;
    const { UserID, TrackID } = req.body;
    const pool = await getPool();
    const result = await pool.request()
      .input('LikeID', sql.Int, id)
      .input('UserID', sql.Int, UserID)
      .input('TrackID', sql.Int, TrackID)
      .query(`
        UPDATE Likes
        SET UserID = @UserID,
            TrackID = @TrackID
        WHERE LikeID = @LikeID
      `);

    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({ error: 'Like not found' });
    }
    res.json({ message: 'Like updated successfully' });
  } catch (err) {
    console.error('Error updating like:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}

async function deleteLike(req, res) {
  try {
    const { id } = req.params;
    const pool = await getPool();
    const result = await pool.request()
      .input('LikeID', sql.Int, id)
      .query('DELETE FROM Likes WHERE LikeID = @LikeID');

    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({ error: 'Like not found' });
    }
    res.json({ message: 'Like deleted successfully' });
  } catch (err) {
    console.error('Error deleting like:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}

module.exports = {
  getAllLikes,
  getAllLikesRaw,
  getLikeById,
  createLike,
  updateLike,
  deleteLike,
};
