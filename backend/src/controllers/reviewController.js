const pool = require('../config/database');

// ── GET /api/reviews ─────────────────────────────────────────
const getReviews = async (req, res) => {
  try {
    const { toilet_id, page = 1, limit = 20 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    if (!toilet_id) {
      // Admin: all reviews
      if (req.user?.role !== 'admin')
        return res.status(400).json({ message: 'toilet_id is required' });

      const [reviews] = await pool.query(`
        SELECT r.*, u.name AS user_name, t.name AS toilet_name
        FROM reviews r
        JOIN users  u ON r.user_id   = u.id
        JOIN toilets t ON r.toilet_id = t.id
        ORDER BY r.created_at DESC
        LIMIT ${parseInt(limit)} OFFSET ${offset}
      `);
      const [[{ total }]] = await pool.query('SELECT COUNT(*) AS total FROM reviews');
      return res.json({ reviews, total });
    }

    const [reviews] = await pool.query(`
      SELECT r.*, u.name AS user_name, u.avatar_url AS user_avatar
      FROM reviews r
      JOIN users u ON r.user_id = u.id
      WHERE r.toilet_id = ?
      ORDER BY r.created_at DESC
      LIMIT ${parseInt(limit)} OFFSET ${offset}
    `, [toilet_id]);

    const [[{ total }]] = await pool.query(
      'SELECT COUNT(*) AS total FROM reviews WHERE toilet_id = ?', [toilet_id],
    );
    res.json({ reviews, total });
  } catch (err) {
    console.error('getReviews:', err);
    res.status(500).json({ message: 'Failed to fetch reviews' });
  }
};

// ── POST /api/reviews ─────────────────────────────────────────
const createReview = async (req, res) => {
  try {
    const { toilet_id, rating, comment } = req.body;
    if (!toilet_id || !rating)
      return res.status(400).json({ message: 'toilet_id and rating are required' });
    if (rating < 1 || rating > 5)
      return res.status(400).json({ message: 'Rating must be 1–5' });

    const [[t]] = await pool.query('SELECT id FROM toilets WHERE id = ?', [toilet_id]);
    if (!t) return res.status(404).json({ message: 'Toilet not found' });

    const [existing] = await pool.query(
      'SELECT id FROM reviews WHERE toilet_id = ? AND user_id = ?',
      [toilet_id, req.user.id],
    );
    if (existing.length)
      return res.status(409).json({ message: 'You have already reviewed this toilet' });

    const [result] = await pool.query(
      'INSERT INTO reviews (toilet_id, user_id, rating, comment) VALUES (?, ?, ?, ?)',
      [toilet_id, req.user.id, rating, comment || null],
    );

    await recalc(toilet_id);

    const [[review]] = await pool.query(
      `SELECT r.*, u.name AS user_name FROM reviews r JOIN users u ON r.user_id = u.id WHERE r.id = ?`,
      [result.insertId],
    );
    res.status(201).json({ message: 'Review added', review });
  } catch (err) {
    console.error('createReview:', err);
    res.status(500).json({ message: 'Failed to create review' });
  }
};

// ── PUT /api/reviews/:id ──────────────────────────────────────
const updateReview = async (req, res) => {
  try {
    const { id } = req.params;
    const [[review]] = await pool.query('SELECT * FROM reviews WHERE id = ?', [id]);
    if (!review) return res.status(404).json({ message: 'Review not found' });

    if (req.user.role !== 'admin' && review.user_id !== req.user.id)
      return res.status(403).json({ message: 'Permission denied' });

    const { rating, comment } = req.body;
    await pool.query(
      'UPDATE reviews SET rating=?, comment=?, updated_at=NOW() WHERE id=?',
      [rating ?? review.rating, comment !== undefined ? comment : review.comment, id],
    );
    await recalc(review.toilet_id);
    res.json({ message: 'Review updated' });
  } catch (err) {
    console.error('updateReview:', err);
    res.status(500).json({ message: 'Failed to update review' });
  }
};

// ── DELETE /api/reviews/:id ───────────────────────────────────
const deleteReview = async (req, res) => {
  try {
    const { id } = req.params;
    const [[review]] = await pool.query('SELECT * FROM reviews WHERE id = ?', [id]);
    if (!review) return res.status(404).json({ message: 'Review not found' });

    if (req.user.role !== 'admin' && review.user_id !== req.user.id)
      return res.status(403).json({ message: 'Permission denied' });

    await pool.query('DELETE FROM reviews WHERE id = ?', [id]);
    await recalc(review.toilet_id);
    res.json({ message: 'Review deleted' });
  } catch (err) {
    console.error('deleteReview:', err);
    res.status(500).json({ message: 'Failed to delete review' });
  }
};

/* helper – recompute avg_rating & review_count on the parent toilet */
async function recalc(toiletId) {
  await pool.query(`
    UPDATE toilets
    SET
      avg_rating   = COALESCE((SELECT AVG(rating) FROM reviews WHERE toilet_id = ?), 0),
      review_count = (SELECT COUNT(*) FROM reviews WHERE toilet_id = ?),
      updated_at   = NOW()
    WHERE id = ?
  `, [toiletId, toiletId, toiletId]);
}

module.exports = { getReviews, createReview, updateReview, deleteReview };
