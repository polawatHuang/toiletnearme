const path = require('path');
const fs   = require('fs');
const pool = require('../config/database');

/* Haversine distance in km */
const haversine = (lat1, lng1, lat2, lng2) => {
  const R = 6371, toRad = d => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1), dLng = toRad(lng2 - lng1);
  const a = Math.sin(dLat / 2) ** 2 +
            Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

// ── GET /api/toilets ──────────────────────────────────────────
const getToilets = async (req, res) => {
  try {
    const { lat, lng, radius = 5, search, status = 'active', page = 1, limit = 100 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);
    const isAdmin = req.user?.role === 'admin';

    let sql = `SELECT t.*, u.name AS user_name FROM toilets t LEFT JOIN users u ON t.user_id = u.id WHERE 1=1`;
    const params = [];

    if (isAdmin) {
      if (status !== 'all') { sql += ' AND t.status = ?'; params.push(status); }
    } else {
      sql += ' AND t.status = "active"';
    }

    if (search) {
      sql += ' AND (t.name LIKE ? OR t.address LIKE ? OR t.description LIKE ?)';
      const s = `%${search}%`;
      params.push(s, s, s);
    }

    if (lat && lng) {
      sql += ` AND (6371 * ACOS(COS(RADIANS(?)) * COS(RADIANS(t.lat)) * COS(RADIANS(t.lng) - RADIANS(?)) + SIN(RADIANS(?)) * SIN(RADIANS(t.lat)))) <= ?`;
      params.push(parseFloat(lat), parseFloat(lng), parseFloat(lat), parseFloat(radius));
    }

    sql += ' ORDER BY t.avg_rating DESC, t.created_at DESC';
    sql += ` LIMIT ${parseInt(limit)} OFFSET ${offset}`;

    const [toilets] = await pool.query(sql, params);

    if (lat && lng) {
      toilets.forEach(t => {
        t.distance = Math.round(haversine(parseFloat(lat), parseFloat(lng), parseFloat(t.lat), parseFloat(t.lng)) * 10) / 10;
      });
      toilets.sort((a, b) => a.distance - b.distance);
    }

    res.json({ toilets, total: toilets.length });
  } catch (err) {
    console.error('getToilets:', err);
    res.status(500).json({ message: 'Failed to fetch toilets' });
  }
};

// ── GET /api/toilets/:id ──────────────────────────────────────
const getToilet = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT t.*, u.name AS user_name FROM toilets t LEFT JOIN users u ON t.user_id = u.id WHERE t.id = ?`,
      [req.params.id],
    );
    if (!rows.length) return res.status(404).json({ message: 'Toilet not found' });
    res.json({ toilet: rows[0] });
  } catch (err) {
    console.error('getToilet:', err);
    res.status(500).json({ message: 'Failed to fetch toilet' });
  }
};

// ── POST /api/toilets ─────────────────────────────────────────
const createToilet = async (req, res) => {
  try {
    const { name, description, address, lat, lng, has_fee, fee_amount, is_wheelchair_accessible, opening_hours } = req.body;
    if (!name || !lat || !lng)
      return res.status(400).json({ message: 'Name, latitude, and longitude are required' });

    const photo_url = req.file ? `/uploads/${req.file.filename}` : null;
    const status    = req.user.role === 'admin' ? 'active' : 'pending';

    const [result] = await pool.query(
      `INSERT INTO toilets (name,description,address,lat,lng,photo_url,status,has_fee,fee_amount,is_wheelchair_accessible,opening_hours,user_id)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`,
      [name, description || null, address || null, lat, lng, photo_url, status,
       has_fee ? 1 : 0, fee_amount || null, is_wheelchair_accessible ? 1 : 0, opening_hours || null, req.user.id],
    );

    const [[toilet]] = await pool.query('SELECT * FROM toilets WHERE id = ?', [result.insertId]);
    res.status(201).json({ message: 'Toilet added successfully', toilet });
  } catch (err) {
    console.error('createToilet:', err);
    res.status(500).json({ message: 'Failed to create toilet' });
  }
};

// ── PUT /api/toilets/:id ──────────────────────────────────────
const updateToilet = async (req, res) => {
  try {
    const { id } = req.params;
    const [[toilet]] = await pool.query('SELECT * FROM toilets WHERE id = ?', [id]);
    if (!toilet) return res.status(404).json({ message: 'Toilet not found' });

    if (req.user.role !== 'admin' && toilet.user_id !== req.user.id)
      return res.status(403).json({ message: 'Permission denied' });

    const { name, description, address, lat, lng, status, has_fee, fee_amount, is_wheelchair_accessible, opening_hours } = req.body;

    let photo_url = toilet.photo_url;
    if (req.file) {
      if (toilet.photo_url) {
        const old = path.join(__dirname, '../../', toilet.photo_url);
        if (fs.existsSync(old)) fs.unlinkSync(old);
      }
      photo_url = `/uploads/${req.file.filename}`;
    }

    const base = [name, description || null, address || null, lat, lng, photo_url,
                  has_fee ? 1 : 0, fee_amount || null, is_wheelchair_accessible ? 1 : 0, opening_hours || null];

    if (req.user.role === 'admin') {
      await pool.query(
        `UPDATE toilets SET name=?,description=?,address=?,lat=?,lng=?,photo_url=?,has_fee=?,fee_amount=?,is_wheelchair_accessible=?,opening_hours=?,status=?,updated_at=NOW() WHERE id=?`,
        [...base, status, id],
      );
    } else {
      await pool.query(
        `UPDATE toilets SET name=?,description=?,address=?,lat=?,lng=?,photo_url=?,has_fee=?,fee_amount=?,is_wheelchair_accessible=?,opening_hours=?,updated_at=NOW() WHERE id=?`,
        [...base, id],
      );
    }

    const [[updated]] = await pool.query('SELECT * FROM toilets WHERE id = ?', [id]);
    res.json({ message: 'Toilet updated successfully', toilet: updated });
  } catch (err) {
    console.error('updateToilet:', err);
    res.status(500).json({ message: 'Failed to update toilet' });
  }
};

// ── DELETE /api/toilets/:id ───────────────────────────────────
const deleteToilet = async (req, res) => {
  try {
    const { id } = req.params;
    const [[toilet]] = await pool.query('SELECT * FROM toilets WHERE id = ?', [id]);
    if (!toilet) return res.status(404).json({ message: 'Toilet not found' });

    if (toilet.photo_url) {
      const p = path.join(__dirname, '../../', toilet.photo_url);
      if (fs.existsSync(p)) fs.unlinkSync(p);
    }

    await pool.query('DELETE FROM toilets WHERE id = ?', [id]);
    res.json({ message: 'Toilet deleted successfully' });
  } catch (err) {
    console.error('deleteToilet:', err);
    res.status(500).json({ message: 'Failed to delete toilet' });
  }
};

// ── PATCH /api/toilets/:id/status ────────────────────────────
const updateStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!['active', 'inactive', 'pending'].includes(status))
      return res.status(400).json({ message: 'Invalid status' });

    const [result] = await pool.query(
      'UPDATE toilets SET status=?, updated_at=NOW() WHERE id=?',
      [status, req.params.id],
    );
    if (!result.affectedRows) return res.status(404).json({ message: 'Toilet not found' });
    res.json({ message: 'Status updated' });
  } catch (err) {
    console.error('updateStatus:', err);
    res.status(500).json({ message: 'Failed to update status' });
  }
};

// ── GET /api/toilets/stats (admin) ────────────────────────────
const getStats = async (_req, res) => {
  try {
    const [[counts]] = await pool.query(`
      SELECT
        COUNT(*) AS total,
        SUM(status = 'active')   AS active,
        SUM(status = 'pending')  AS pending,
        SUM(status = 'inactive') AS inactive
      FROM toilets
    `);
    const [[{ users }]]   = await pool.query('SELECT COUNT(*) AS users FROM users');
    const [[{ reviews }]] = await pool.query('SELECT COUNT(*) AS reviews FROM reviews');
    res.json({ ...counts, users, reviews });
  } catch (err) {
    console.error('getStats:', err);
    res.status(500).json({ message: 'Failed to fetch stats' });
  }
};

module.exports = { getToilets, getToilet, createToilet, updateToilet, deleteToilet, updateStatus, getStats };
