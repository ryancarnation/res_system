const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const readMockData = (filePath) => {
  return JSON.parse(fs.readFileSync(filePath));
};

const syncReservations = async () => {
  try {
    const airbnbData = readMockData(path.join(__dirname, '../mocks/airbnb.json'));
    const vrboData = readMockData(path.join(__dirname, '../mocks/vrbo.json'));

    const allReservations = [...airbnbData, ...vrboData];

    for (let reservation of allReservations) {
      const { external_id, property_id, guest_name, check_in, check_out, source_platform } = reservation;

      // Check for overlapping bookings (better conflict handling)
      const conflictingReservations = await pool.query(
        `SELECT * FROM reservations
         WHERE property_id = $1
           AND NOT (check_out <= $2 OR check_in >= $3)`,
        [property_id, check_in, check_out]
      );

      if (conflictingReservations.rows.length === 0) {
        await pool.query(
          `INSERT INTO reservations (property_id, guest_name, source_platform, check_in, check_out)
           VALUES ($1, $2, $3, $4, $5)`,
          [property_id, guest_name, source_platform, check_in, check_out]
        );

        console.log(`Synced reservation for ${guest_name} from ${source_platform}`);

        // Call external calendar update after new reservation
        await updateExternalCalendars(property_id);

      } else {
        console.log(`Conflict detected for ${guest_name} (${source_platform}) - skipping sync.`);
      }
    }

    console.log('Sync complete!');
  } catch (err) {
    console.error('Sync failed:', err);
  }
};

const updateExternalCalendars = async (property_id) => {
    try {
      const result = await pool.query(
        `SELECT check_in, check_out FROM reservations WHERE property_id = $1 ORDER BY check_in`,
        [property_id]
      );
  
      const reservations = result.rows;
  
      // Simulate unavailable dates
      const unavailableDates = reservations.map(reservation => ({
        from: reservation.check_in,
        to: reservation.check_out
      }));
  
      console.log(`Updating external calendars for property ${property_id}...`);
      console.log('Unavailable Dates:', unavailableDates);
  
      // Simulate API calls to Airbnb, Vrbo, etc.
      console.log(`Simulated: Pushed updated availability to Airbnb`);
      console.log(`Simulated: Pushed updated availability to Vrbo`);
  
    } catch (err) {
      console.error('Failed to update external calendars:', err);
    }
};  

module.exports = { syncReservations, updateExternalCalendars };
