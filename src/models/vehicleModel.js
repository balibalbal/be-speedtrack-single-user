// models/vehicleModel.js
const pool = require('../config/database');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const Vehicle = {
  // Mendapatkan semua Vehicle
  getAllVehicleForSelect: async () => {
    const result = await pool.query(`
      SELECT 
        *
      FROM vehicles where status = 1
    `);
    return result.rows;
  },

  getAll: async (page = 1, limit = 10, search = '') => {
    const offset = (page - 1) * limit;
    
    let query = `
      SELECT 
        v.id, 
        v.latitude, 
        v.longitude, 
        v.warna, 
        v.type, 
        g.name as group_name,    
        v.group_id, 
        v.no_pol,  
        v.status, 
        v.created_at,
        COUNT(*) OVER() as total_count
      FROM vehicles v
      LEFT JOIN groups g ON v.group_id = g.id
    `;

    let whereConditions = [];
    let queryParams = [];
    let paramCount = 0;

    // Tambahkan kondisi search jika ada
    if (search) {
      paramCount++;
      whereConditions.push(`(v.no_pol ILIKE $${paramCount} OR v.status ILIKE $${paramCount} OR g.group_name ILIKE $${paramCount})`);
      queryParams.push(`%${search}%`);
    }

    // Gabungkan kondisi WHERE jika ada
    if (whereConditions.length > 0) {
      query += ` WHERE ${whereConditions.join(' AND ')}`;
    }

    query += `
      ORDER BY v.created_at DESC
      LIMIT $${paramCount + 1}
      OFFSET $${paramCount + 2}
    `;

    queryParams.push(limit, offset);

    const result = await pool.query(query, queryParams);
    
    return {
      vehicles: result.rows,
      totalCount: result.rows.length > 0 ? parseInt(result.rows[0].total_count) : 0
    };
  },

  // Mendapatkan const Vehicle = { by ID
  getById: async (id) => {
    const result = await pool.query(
      'SELECT * FROM vehicles WHERE id = $1', 
      [id]
    );
    return result.rows[0];
  },

  
  // Membuat vehicles baru
  create: async (vehicleData) => {
    const { name, imei, sim_number, dump_truck } = vehicleData;
    const result = await pool.query(
      'INSERT INTO vehicles (name, imei, sim_number, dump_truck) VALUES ($1, $2, $3, $4) RETURNING id, name, imei, sim_number, dump_truck',
      [name, imei, sim_number, dump_truck]
    );
    return result.rows[0];
  },

  // Update vehicles
  update: async (id, vehicleData) => {
    const { name, imei } = vehicleData;
    const result = await pool.query(
      'UPDATE vehicles SET name = $1, imei = $2 WHERE id = $3 RETURNING id, name, imei, user_type, created_at',
      [name, imei, id]
    );
    return result.rows[0];
  },

  // Hapus Vehicle
  delete: async (id) => {
    const result = await pool.query(
      'DELETE FROM vehicles WHERE id = $1 RETURNING id, name, imei', 
      [id]
    );
    return result.rows[0];
  },
};

module.exports = Vehicle;