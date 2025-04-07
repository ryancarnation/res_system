require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");

const app = express();
const PORT = process.env.PORT || 5000;
const reservationRoutes = require('../routes/reservations');
const propertyRoutes = require('../routes/properties');
const syncRoutes = require('../routes/sync');
const reportRoutes = require('../routes/reports')
const cron = require('node-cron');
const { syncReservations } = require('../src/services/syncService');

// PostgreSQL Connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false, // Required for production (e.g. Render)
  },
});
module.exports = pool;

// Middleware
app.use(cors({
  origin: 'https://res-system.vercel.app/', // or '*', during testing
}));
app.use(express.json());
app.use('/api/reservations', reservationRoutes);
app.use('/api/properties', propertyRoutes)
app.use('/api/sync', syncRoutes)
app.use('/api/reports', reportRoutes)

// Cron job for syncing data between Vrbo and Airbnb
cron.schedule('*/5 * * * *', () => {
  console.log('Running scheduled sync...');
  syncReservations();
});

// Test Database Connection
app.get("/test-db", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW()");
    res.json({ message: "Database connected!", time: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database connection failed" });
  }
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});