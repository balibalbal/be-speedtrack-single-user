// models/userModel.js
const pool = require('../config/database');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const User = {
  // Mendapatkan semua user
  getAll: async () => {
    const result = await pool.query('SELECT id, name, email, jabatan, akses, status, settings, user_type, created_at FROM users');
    return result.rows;
  },

  // Mendapatkan user by ID
  getById: async (id) => {
    const result = await pool.query(
      'SELECT id, name, email, user_type, status, akses, role, is_superuser, settings, created_at FROM users WHERE id = $1', 
      [id]
    );
    return result.rows[0];
  },

  // Mencari user by email (untuk login)
  getByEmail: async (email) => {
    const userQuery = `
      SELECT 
        id, name, email, password, user_type, status, akses, settings, created_at
      FROM users
      WHERE email = $1
    `;

    const userResult = await pool.query(userQuery, [email]);
    if (userResult.rowCount === 0) return null;

    const user = userResult.rows[0];

    // Ambil nama-nama permission sebagai array string
    const permissionsQuery = `
      SELECT p.name
      FROM user_permissions up
      JOIN permissions p ON p.id = up.permission_id
      WHERE up.user_id = $1
    `;

    const permissionsResult = await pool.query(permissionsQuery, [user.id]);

    // Buat array string nama permission saja
    user.permissions = permissionsResult.rows.map(row => row.name);

    return user;
  },

  // Membuat user baru
  create: async (userData) => {
    const { name, email, password, user_type = 1 } = userData;
    
    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    
    const result = await pool.query(
      'INSERT INTO users (name, email, password, user_type) VALUES ($1, $2, $3, $4) RETURNING id, name, email, user_type, created_at',
      [name, email, hashedPassword, user_type]
    );
    return result.rows[0];
  },

  // Update user
  update: async (id, userData) => {
    const { name, email } = userData;
    const result = await pool.query(
      'UPDATE users SET name = $1, email = $2 WHERE id = $3 RETURNING id, name, email, user_type, created_at',
      [name, email, id]
    );
    return result.rows[0];
  },

  // Hapus user
  delete: async (id) => {
    const result = await pool.query(
      'DELETE FROM users WHERE id = $1 RETURNING id, name, email', 
      [id]
    );
    return result.rows[0];
  },

  // Verifikasi password
  verifyPassword: async (plainPassword, hashedPassword) => {
    return await bcrypt.compare(plainPassword, hashedPassword);
  },

  // Generate JWT token
  generateAuthToken: (userId, user_type) => {
    return jwt.sign(
      { userId, user_type }, 
      process.env.JWT_SECRET, 
      { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
    );
  },

  // Simpan token ke database (untuk logout functionality)
  saveToken: async (userId, token) => {
    await pool.query(
      'UPDATE users SET token = $1 WHERE id = $2',
      [token, userId]
    );
  },

  // Hapus token dari database (logout)
  removeToken: async (userId) => {
    await pool.query(
      'UPDATE users SET token = NULL WHERE id = $1',
      [userId]
    );
  }
};

module.exports = User;