// routes/authRoutes.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authMiddleware } = require('../middleware/auth');

// POST /auth/register - Register user baru
router.post('/register', authController.register);

// POST /auth/login - Login user
router.post('/login', authController.login);

// POST /auth/logout - Logout user (memerlukan auth)
router.post('/logout', authMiddleware, authController.logout);

// GET /auth/profile - Get profile user (memerlukan auth)
router.get('/profile', authMiddleware, authController.getProfile);

// GET /auth/me - Alias untuk cek user dari token (memerlukan auth)
router.get('/me', authMiddleware, authController.getProfile);

module.exports = router;
