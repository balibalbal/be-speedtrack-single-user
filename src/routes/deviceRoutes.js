// routes/userRoutes.js
const express = require('express');
const router = express.Router();
const deviceController = require('../controllers/deviceController');
const { authMiddleware, authRole } = require('../middleware/auth');

// Semua route di bawah ini memerlukan authentication
router.use(authMiddleware);

// GET /users - Get all users (hanya admin)
router.get('/', deviceController.getAllDevices);

// GET /users/:id - Get user by ID
router.get('/:id', deviceController.getDeviceById);

// PUT /users/:id - Update user
router.put('/:id', deviceController.updateDevice);

// DELETE /users/:id - Delete user (hanya admin)
router.delete('/:id', deviceController.deleteDevice);

module.exports = router;