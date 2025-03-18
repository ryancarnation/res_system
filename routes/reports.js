const express = require('express');
const router = express.Router();
const { Pool } = require('pg');
const { Parser } = require('json2csv');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Helper to generate the report
const generateAvailabilityReport = async () => {
  const properties = await pool.query('SELECT * FROM properties');

  const report = [];

  for (let property of properties.rows) {
    const { id, title } = property;

    const reservations = await pool.query(
      `SELECT check_in, check_out FROM reservations
       WHERE property_id = $1
       ORDER BY check_in ASC`,
      [id]
    );

    const today = new Date();
    const dateRange = 30;
    const bookedDates = reservations.rows.map(res => ({
      from: res.check_in,
      to: res.check_out
    }));

    report.push({
      property_id: id,
      property_title: title,
      next_available_date: reservations.rows.length === 0
        ? today.toISOString().split('T')[0]
        : new Date(reservations.rows[reservations.rows.length - 1].check_out).toISOString().split('T')[0],
      booked_dates: JSON.stringify(bookedDates)
    });
  }

  return report;
};

// JSON Report (For API/Frontend)
router.get('/availability', async (req, res) => {
    try {
      const report = await generateAvailabilityReport();
      res.json(report);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to generate availability report' });
    }
});

// CSV Report (For Download/Export)
router.get('/availability/csv', async (req, res) => {
    try {
      const report = await generateAvailabilityReport();
  
      // Use json2csv to convert the report
      const json2csvParser = new Parser();
      const csv = json2csvParser.parse(report);
  
      res.header('Content-Type', 'text/csv');
      res.attachment('availability_report.csv');
      res.send(csv);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to generate CSV report' });
    }
});

module.exports = router;