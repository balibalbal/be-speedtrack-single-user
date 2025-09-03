// routes/vehicleRoutes.js
const express = require('express');
const router = express.Router();
const vehicleController = require('../controllers/vehicleController');
const { authMiddleware } = require('../middleware/auth');

// Semua route di bawah ini memerlukan authentication
router.use(authMiddleware);

// GET /vehicles - Ambil semua kendaraan
router.get('/', vehicleController.getAllVehicle);
router.get('/select', vehicleController.getAllSelect);

// GET /vehicles/:id - Ambil kendaraan berdasarkan ID
router.get('/:id', vehicleController.getVehicleById);

// POST /vehicles - Tambah kendaraan baru
router.post('/', vehicleController.createVehicle);

// PUT /vehicles/:id - Update data kendaraan
router.put('/:id', vehicleController.updateVehicle);

// DELETE /vehicles/:id - Hapus kendaraan
router.delete('/:id', vehicleController.deleteVehicle);

module.exports = router;
