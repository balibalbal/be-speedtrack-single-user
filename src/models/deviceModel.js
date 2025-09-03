// models/userModel.js
const pool = require('../config/database');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const Device = {
  // Mendapatkan semua Device
  getAll: async (page = 1, limit = 10, search = '') => {
    const offset = (page - 1) * limit;
    
    let query = `
      SELECT 
        d.id, 
        d.name, 
        d.imei, 
        d.sim_number, 
        d.type_id, 
        dt.type,         -- dari tabel device_types
        d.vehicle_id, 
        v.no_pol,        -- dari tabel vehicles
        d.status, 
        d.created_at,
        COUNT(*) OVER() as total_count
      FROM devices d
      LEFT JOIN vehicles v ON d.vehicle_id = v.id
      LEFT JOIN device_types dt ON d.type_id = dt.id
    `;

    let whereConditions = [];
    let queryParams = [];
    let paramCount = 0;

    // Tambahkan kondisi search jika ada
    if (search) {
      paramCount++;
      whereConditions.push(`(v.no_pol ILIKE $${paramCount} OR d.imei ILIKE $${paramCount} OR d.name ILIKE $${paramCount})`);
      queryParams.push(`%${search}%`);
    }

    // Gabungkan kondisi WHERE jika ada
    if (whereConditions.length > 0) {
      query += ` WHERE ${whereConditions.join(' AND ')}`;
    }

    query += `
      ORDER BY d.created_at DESC
      LIMIT $${paramCount + 1}
      OFFSET $${paramCount + 2}
    `;

    queryParams.push(limit, offset);

    const result = await pool.query(query, queryParams);
    
    return {
      devices: result.rows,
      totalCount: result.rows.length > 0 ? parseInt(result.rows[0].total_count) : 0
    };
  },

  // Mendapatkan Device by ID
  getById: async (id) => {
    const result = await pool.query(
      'SELECT id, name, imei, sim_number, type_id, vehicle_id, status, created_at FROM devices WHERE id = $1', 
      [id]
    );
    return result.rows[0];
  },

  
  // Membuat device baru
  create: async (deviceData) => {
    const { name, imei, sim_number, dump_truck } = deviceData;
    const result = await pool.query(
      'INSERT INTO devices (name, imei, sim_number, dump_truck) VALUES ($1, $2, $3, $4) RETURNING id, name, imei, sim_number, dump_truck',
      [name, imei, sim_number, dump_truck]
    );
    return result.rows[0];
  },

  // Update devices
  update: async (id, deviceData) => {
    const { name, imei } = deviceData;
    const result = await pool.query(
      'UPDATE devices SET name = $1, imei = $2 WHERE id = $3 RETURNING id, name, imei, user_type, created_at',
      [name, imei, id]
    );
    return result.rows[0];
  },

  // Hapus Device
  delete: async (id) => {
    const result = await pool.query(
      'DELETE FROM devices WHERE id = $1 RETURNING id, name, imei', 
      [id]
    );
    return result.rows[0];
  },
};

module.exports = Device;