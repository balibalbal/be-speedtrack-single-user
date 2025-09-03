// routes/userRoutes.js
const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authMiddleware, authRole } = require('../middleware/auth');

// Semua route di bawah ini memerlukan authentication
router.use(authMiddleware);

// GET /users - Get all users (hanya admin)
// router.get('/', authRole([0]), userController.getAllUsers);
router.get('/', userController.getAllUsers);

// GET /users/:id - Get user by ID
router.get('/:id', userController.getUserById);

// PUT /users/:id - Update user
router.put('/:id', userController.updateUser);

// DELETE /users/:id - Delete user (hanya admin)
router.delete('/:id', authRole([0]), userController.deleteUser);

module.exports = router;