import { searchEntities } from '../services/search_service.js';

export const handleSearch = async (req, res) => {
  const { q } = req.query;
  if (!q) return res.status(400).json({ error: 'Missing query' });

  try {
    const results = await searchEntities(q);
    res.json(results);
  } catch (err) {
    console.error('Lỗi tìm kiếm:', err);
    res.status(500).json({ error: 'Lỗi khi tìm kiếm' });
  }
};
