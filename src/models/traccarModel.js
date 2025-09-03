// models/userModel.js
const pool = require('../config/database');

const Traccar = {
  // Mendapatkan semua Device
  getAllTraccar: async () => {
    const result = await pool.query(`
      SELECT 
        *
      FROM traccars where active = 1
    `);
    return result.rows;
  },
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
      'SELECT * FROM traccars WHERE vehicle_id = $1 and active = 1', 
      [id]
    );
    return result.rows[0];
  }
};

module.exports = Traccar;