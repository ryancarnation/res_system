const express = require('express');
const router = express.Router();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// GET all properties
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM properties ORDER BY id ASC');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch properties' });
  }
});

// POST a new property
router.post('/', async (req, res) => {
  const { user_id, title, description, location } = req.body;

  try {
    const result = await pool.query(
      `INSERT INTO properties (user_id, title, description, location)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [user_id, title, description, location]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create property' });
  }
});

// DELETE a property by ID
router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    await pool.query('DELETE FROM properties WHERE id = $1', [id]);
    res.json({ message: 'Property deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete property' });
  }
});

// PUT update a property by ID
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { title, description, location } = req.body;

  try {
    const result = await pool.query(
      `UPDATE properties
       SET title = $1, description = $2, location = $3
       WHERE id = $4
       RETURNING *`,
      [title, description, location, id]
    );

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update property' });
  }
});

module.exports = router;
