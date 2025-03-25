// controllers/searchHistoryController.js
const { sql, getPool } = require('../config/database');

async function getAllSearches(req, res) {
  try {
    const searches = await getAllSearchesRaw();
    res.json(searches);
  } catch (err) {
    console.error('Error fetching search history:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}

async function getAllSearchesRaw() {
  const pool = await getPool();
  const result = await pool.request().query('SELECT * FROM SearchHistory');
  return result.recordset;
}

async function getSearchById(req, res) {
  try {
    const { id } = req.params;
    const pool = await getPool();
    const result = await pool.request()
      .input('SearchID', sql.Int, id)
      .query('SELECT * FROM SearchHistory WHERE SearchID = @SearchID');

    if (result.recordset.length === 0) {
      return res.status(404).json({ error: 'Search not found' });
    }
    res.json(result.recordset[0]);
  } catch (err) {
    console.error('Error fetching search by ID:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}

async function createSearch(req, res) {
  try {
    const { UserID, SearchQuery } = req.body;
    const pool = await getPool();
    const result = await pool.request()
      .input('UserID', sql.Int, UserID)
      .input('SearchQuery', sql.Text, SearchQuery)
      .query(`
        INSERT INTO SearchHistory (UserID, SearchQuery)
        VALUES (@UserID, @SearchQuery);
        SELECT SCOPE_IDENTITY() as NewSearchID;
      `);

    const newSearchID = result.recordset[0].NewSearchID;
    res.status(201).json({ message: 'Search created successfully', SearchID: newSearchID });
  } catch (err) {
    console.error('Error creating search history:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}

// Tương tự, có thể thêm updateSearch nếu muốn
async function updateSearch(req, res) {
  try {
    const { id } = req.params;
    const { UserID, SearchQuery } = req.body;
    const pool = await getPool();
    const result = await pool.request()
      .input('SearchID', sql.Int, id)
      .input('UserID', sql.Int, UserID)
      .input('SearchQuery', sql.Text, SearchQuery)
      .query(`
        UPDATE SearchHistory
        SET UserID = @UserID,
            SearchQuery = @SearchQuery
        WHERE SearchID = @SearchID
      `);

    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({ error: 'Search not found' });
    }
    res.json({ message: 'Search updated successfully' });
  } catch (err) {
    console.error('Error updating search history:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}

async function deleteSearch(req, res) {
  try {
    const { id } = req.params;
    const pool = await getPool();
    const result = await pool.request()
      .input('SearchID', sql.Int, id)
      .query('DELETE FROM SearchHistory WHERE SearchID = @SearchID');

    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({ error: 'Search not found' });
    }
    res.json({ message: 'Search deleted successfully' });
  } catch (err) {
    console.error('Error deleting search history:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}

module.exports = {
  getAllSearches,
  getAllSearchesRaw,
  getSearchById,
  createSearch,
  updateSearch,
  deleteSearch,
};
