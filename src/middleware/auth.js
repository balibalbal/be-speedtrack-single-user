// middleware/auth.js
const jwt = require('jsonwebtoken');
const pool = require('../config/database');  

const authMiddleware = async (req, res, next) => {
  try {
    // Ambil token dari header Authorization
    const authHeader = req.header('Authorization');
    
    // Cek jika token tidak ada
    if (!authHeader) {
      return res.status(401).json({
        success: false,
        message: 'Akses ditolak. Token tidak provided.'
      });
    }

    // Cek format token (harus Bearer token)
    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      return res.status(401).json({
        success: false,
        message: 'Format token tidak valid. Gunakan: Bearer <token>'
      });
    }

    const token = parts[1];

    // Verifikasi token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Ambil data user beserta permissions-nya
    const userQuery = `
      SELECT 
        u.*,
        COALESCE(
          JSON_AGG(DISTINCT p.name) FILTER (WHERE p.name IS NOT NULL),
          '[]'
        ) as permissions
      FROM users u
      LEFT JOIN user_permissions up ON u.id = up.user_id
      LEFT JOIN permissions p ON up.permission_id = p.id
      WHERE u.id = $1 AND u.token = $2
      GROUP BY u.id
    `;
    
    const result = await pool.query(userQuery, [decoded.userId, token]);

    if (result.rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Token tidak valid atau user sudah logout.'
      });
    }

    // Tambahkan user info ke request object
    req.user = result.rows[0];
    req.token = token;
    
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token sudah kadaluarsa.'
      });
    }
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Token tidak valid.'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan pada server.'
    });
  }
};

// Middleware untuk mengecek role user
const authRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Akses ditolak. User tidak terautentikasi.'
      });
    }

    if (!roles.includes(req.user.role) && !req.user.is_superuser) {
      return res.status(403).json({
        success: false,
        message: 'Akses ditolak. Anda tidak memiliki izin untuk mengakses resource ini.'
      });
    }

    next();
  };
};

// Middleware untuk mengecek permission
const authPermission = (permissions) => {
  return async (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Akses ditolak. User tidak terautentikasi.'
      });
    }

    // Super user memiliki semua permission
    if (req.user.is_superuser) {
      return next();
    }

    // Cek apakah user memiliki semua permission yang diperlukan
    const hasAllPermissions = permissions.every(permission => 
      req.user.permissions.includes(permission)
    );

    if (!hasAllPermissions) {
      return res.status(403).json({
        success: false,
        message: 'Akses ditolak. Anda tidak memiliki izin yang cukup.'
      });
    }

    next();
  };
};

// Middleware khusus untuk super user
const requireSuperAdmin = (req, res, next) => {
  if (!req.user || !req.user.is_superuser) {
    return res.status(403).json({
      success: false,
      message: 'Akses ditolak. Hanya super admin yang dapat mengakses resource ini.'
    });
  }
  next();
};

module.exports = { 
  authMiddleware, 
  authRole, 
  authPermission,
  requireSuperAdmin
};