// routes/historiesRoutes.js
const express = require('express');
const router = express.Router();
const historiesController = require('../controllers/historiesController');
const { authMiddleware } = require('../middleware/auth');

// Semua route di bawah ini memerlukan authentication
router.use(authMiddleware);

// Ambil history berdasarkan Nopol
// router.get('/:id', historiesController.getHistoriesByNopol);

// Ambil tracking history berdasarkan vehicle_id dengan optional query start & end
router.get('/tracking', historiesController.getTrackingHistory);

// Summary (misal tidak butuh parameter id)
router.get('/summary', historiesController.getSummary);


module.exports = router;
