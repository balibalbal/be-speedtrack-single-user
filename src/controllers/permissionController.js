// controllers/permissionController.js
const pool = require('../config/database');

// Dapatkan semua permissions
const getAllPermissions = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM permissions ORDER BY name');
    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Error getting permissions:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan saat mengambil data permissions.'
    });
  }
};

// Dapatkan permissions user tertentu
const getUserPermissions = async (req, res) => {
  try {
    const { userId } = req.params;
    
    const result = await pool.query(`
      SELECT p.* 
      FROM permissions p
      INNER JOIN user_permissions up ON p.id = up.permission_id
      WHERE up.user_id = $1
      ORDER BY p.name
    `, [userId]);
    
    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Error getting user permissions:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan saat mengambil permissions user.'
    });
  }
};

// Tambahkan permission ke user
const addUserPermission = async (req, res) => {
  try {
    const { userId, permissionId } = req.body;
    
    // Cek apakah permission sudah ada
    const existingPermission = await pool.query(
      'SELECT * FROM user_permissions WHERE user_id = $1 AND permission_id = $2',
      [userId, permissionId]
    );
    
    if (existingPermission.rows.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'User sudah memiliki permission ini.'
      });
    }
    
    // Tambahkan permission
    await pool.query(
      'INSERT INTO user_permissions (user_id, permission_id) VALUES ($1, $2)',
      [userId, permissionId]
    );
    
    res.json({
      success: true,
      message: 'Permission berhasil ditambahkan ke user.'
    });
  } catch (error) {
    console.error('Error adding user permission:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan saat menambahkan permission.'
    });
  }
};

// Hapus permission dari user
const removeUserPermission = async (req, res) => {
  try {
    const { userId, permissionId } = req.body;
    
    await pool.query(
      'DELETE FROM user_permissions WHERE user_id = $1 AND permission_id = $2',
      [userId, permissionId]
    );
    
    res.json({
      success: true,
      message: 'Permission berhasil dihapus dari user.'
    });
  } catch (error) {
    console.error('Error removing user permission:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan saat menghapus permission.'
    });
  }
};

// Buat permission baru
const createPermission = async (req, res) => {
  try {
    const { name, description } = req.body;
    
    // Cek apakah permission sudah ada
    const existingPermission = await pool.query(
      'SELECT * FROM permissions WHERE name = $1',
      [name]
    );
    
    if (existingPermission.rows.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Permission dengan nama ini sudah ada.'
      });
    }
    
    // Buat permission baru
    const result = await pool.query(
      'INSERT INTO permissions (name, description) VALUES ($1, $2) RETURNING *',
      [name, description]
    );
    
    res.status(201).json({
      success: true,
      message: 'Permission berhasil dibuat.',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error creating permission:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan saat membuat permission.'
    });
  }
};

// Update multiple permissions sekaligus (bulk operation)
// controllers/permissionController.js - perbaiki function updateUserPermissionsBulk
const updateUserPermissionsBulk = async (req, res) => {
  try {
    const { userId, permissionIds } = req.body;

    console.log('Bulk update request:', { userId, permissionIds });

    // Validasi input
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID diperlukan'
      });
    }

    if (!Array.isArray(permissionIds)) {
      return res.status(400).json({
        success: false,
        message: 'Permission IDs harus berupa array'
      });
    }

    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');

      // 1. Hapus semua permissions user yang existing
      const deleteResult = await client.query(
        'DELETE FROM user_permissions WHERE user_id = $1 RETURNING *',
        [userId]
      );
      console.log('Deleted permissions:', deleteResult.rows.length);

      // 2. Tambahkan permissions baru (jika ada)
      if (permissionIds.length > 0) {
        // Buat query untuk multiple insert
        const values = permissionIds.map((permissionId, index) => 
          `($1, $${index + 2})`
        ).join(', ');

        const params = [userId, ...permissionIds];

        console.log('Insert query values:', values);
        console.log('Insert query params:', params);

        const insertResult = await client.query(
          `INSERT INTO user_permissions (user_id, permission_id) VALUES ${values} RETURNING *`,
          params
        );

        console.log('Inserted permissions:', insertResult.rows);
      }

      await client.query('COMMIT');
      
      // 3. Verifikasi data yang tersimpan
      const verifyResult = await client.query(
        `SELECT p.id, p.name 
         FROM user_permissions up 
         JOIN permissions p ON up.permission_id = p.id 
         WHERE up.user_id = $1`,
        [userId]
      );
      
      console.log('Final permissions for user:', verifyResult.rows);

      res.json({
        success: true,
        message: 'Permissions berhasil diupdate',
        data: {
          deleted: deleteResult.rows.length,
          inserted: permissionIds.length,
          currentPermissions: verifyResult.rows
        }
      });

    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Transaction error:', error);
      throw error;
    } finally {
      client.release();
    }

  } catch (error) {
    console.error('Error updating user permissions in bulk:', error);
    
    if (error.code === '23503') { // Foreign key violation
      return res.status(400).json({
        success: false,
        message: 'User ID atau Permission ID tidak valid'
      });
    }

    if (error.code === '23505') { // Unique violation
      return res.status(400).json({
        success: false,
        message: 'Duplicate permission entries'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan saat mengupdate permissions: ' + error.message
    });
  }
};


module.exports = {
  getAllPermissions,
  getUserPermissions,
  addUserPermission,
  removeUserPermission,
  createPermission,
  updateUserPermissionsBulk
};