// routes/permissionRoutes.js
const express = require('express');
const router = express.Router();
const {
  getAllPermissions,
  getUserPermissions,
  addUserPermission,
  removeUserPermission,
  createPermission,
  updateUserPermissionsBulk
} = require('../controllers/permissionController');
const { authMiddleware, requireSuperAdmin } = require('../middleware/auth');

// Semua route di bawah ini memerlukan autentikasi
router.use(authMiddleware);

// Hanya super admin yang bisa mengelola permissions
router.get('/', requireSuperAdmin, getAllPermissions);
router.post('/', requireSuperAdmin, createPermission);
router.get('/user/:userId', requireSuperAdmin, getUserPermissions);
router.post('/user', requireSuperAdmin, addUserPermission);
router.delete('/user', requireSuperAdmin, removeUserPermission);
router.put('/user/bulk', requireSuperAdmin, updateUserPermissionsBulk);

module.exports = router;