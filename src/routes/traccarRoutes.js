// routes/userRoutes.js
const express = require('express');
const router = express.Router();
const traccarController = require('../controllers/traccarController');
const { authMiddleware, authRole } = require('../middleware/auth');

// Semua route di bawah ini memerlukan authentication
router.use(authMiddleware);

// GET /users - Get all users (hanya admin)
router.get('/', traccarController.getAllTraccar);

// GET /users/:id - Get user by ID
router.get('/:id', traccarController.getTraccarById);

module.exports = router;