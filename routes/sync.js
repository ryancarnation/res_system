const express = require('express');
const router = express.Router();
const { syncReservations } = require('../src/services/syncService');

router.post('/sync-reservations', async (req, res) => {
  try {
    await syncReservations();
    res.json({ message: 'Manual sync complete!' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Manual sync failed' });
  }
});

module.exports = router;
