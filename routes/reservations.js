const express = require('express');
const router = express.Router();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// GET all reservations
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM reservations ORDER BY check_in ASC');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch reservations' });
  }
});

// POST create a reservation
router.post('/', async (req, res) => {
  const { property_id, guest_name, source_platform, check_in, check_out } = req.body;

  try {
    const result = await pool.query(
      `INSERT INTO reservations (property_id, guest_name, source_platform, check_in, check_out)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [property_id, guest_name, source_platform, check_in, check_out]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create reservation' });
  }
});

// DELETE a reservation
router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    await pool.query('DELETE FROM reservations WHERE id = $1', [id]);
    res.json({ message: 'Reservation deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete reservation' });
  }
});

// PUT for updating a reservation
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { property_id, guest_name, source_platform, check_in, check_out } = req.body;

  try {
    const result = await pool.query(
      `UPDATE reservations
       SET property_id = $1, guest_name = $2, source_platform = $3, check_in = $4, check_out = $5
       WHERE id = $6
       RETURNING *`,
      [property_id, guest_name, source_platform, check_in, check_out, id]
    );

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update reservation' });
  }
});


module.exports = router;
