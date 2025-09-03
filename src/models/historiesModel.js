// models/historiesModel.js
const pool = require('../config/database');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const Histories = {
  getByNopol: async (id) => {
    const result = await pool.query(
      'SELECT * FROM histories WHERE vehicle_id = $1', 
      [id]
    );
    return result.rows; 
  },

  // Ambil titik-titik history (raw points)
  getTrackPoints: async (vehicleId, startTime, endTime) => {
    console.log("Query Parameters:", { vehicleId, startTime, endTime });

    const result = await pool.query(
      `SELECT id, vehicle_id, no_pol, latitude, longitude, speed, course, address, status, time, 
              ST_AsGeoJSON(geom) AS geojson
       FROM histories
       WHERE vehicle_id = $1
         AND time BETWEEN $2 AND $3
       ORDER BY time ASC`,
      [vehicleId, startTime, endTime]
    );
    return result.rows;
  },

  // Ambil garis lintasan (polyline)
  getTrackLine: async (vehicleId, startTime, endTime) => {
    const result = await pool.query(
      `SELECT vehicle_id, 
              ST_AsGeoJSON(ST_MakeLine(geom ORDER BY time)) AS track_line
       FROM histories
       WHERE vehicle_id = $1
         AND time BETWEEN $2 AND $3
       GROUP BY vehicle_id`,
      [vehicleId, startTime, endTime]
    );
    return result.rows[0];
  },

  // Hitung total kendaraan
  totalVehicles: async () => {
    const result = await pool.query(
      'SELECT COUNT(*) AS total FROM traccars where active = 1'
    );
    return parseInt(result.rows[0].total);
  },

  // Hitung total online
  totalOnline: async () => {
    const result = await pool.query(
      "SELECT COUNT(*) AS total FROM traccars WHERE status = 'berhenti'"
    );
    return parseInt(result.rows[0].total);
  },

  // Hitung total offline
  totalOffline: async () => {
    const result = await pool.query(
      "SELECT COUNT(*) AS total FROM traccars WHERE status = 'mati'"
    );
    return parseInt(result.rows[0].total);
  },

  // Hitung total kendaraan bergerak
  totalMoving: async () => {
    const result = await pool.query(
      "SELECT COUNT(*) AS total FROM traccars WHERE status = 'bergerak'"
    );
    return parseInt(result.rows[0].total);
  }
  
};

module.exports = Histories