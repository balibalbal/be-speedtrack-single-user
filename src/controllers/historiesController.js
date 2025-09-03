// controllers/historiesController.js
const { Histories } = require('../models');

const historiesController = {
  // Get Histories by Nopol
  getHistoriesByNopol: async (req, res) => {
    try {
      const history = await Histories.getByNopol(req.params.id);

      if (!history || history.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Vehicle tidak ditemukan'
        });
      }

      // summary
      const totalVehicles = await Histories.totalVehicles();
      const totalOnline = await Histories.totalOnline();
      const totalOffline = await Histories.totalOffline();
      const totalMoving = await Histories.totalMoving();

      res.json({
        success: true,
        total: history.length,
          totalVehicles,
          totalOnline,
          totalOffline,
          totalMoving,
        data: history
      });
    } catch (error) {
      console.error("❌ Error getHistoriesByNopol:", error);
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  },

  // Endpoint khusus summary saja
  getSummary: async (req, res) => {
    try {
      const totalVehicles = await Histories.totalVehicles();
      const totalOnline = await Histories.totalOnline();
      const totalOffline = await Histories.totalOffline();
      const totalMoving = await Histories.totalMoving();

      res.json({
        success: true,
        summary: {
          totalVehicles,
          totalOnline,
          totalOffline,
          totalMoving
        }
      });
    } catch (error) {
      console.error("❌ Error getSummary:", error);
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  },

  getTrackingHistory: async (req, res) => {
    try {
      const { vehicleId, start, end } = req.query;

      const points = await Histories.getTrackPoints(vehicleId, start, end);
      const line = await Histories.getTrackLine(vehicleId, start, end);

      res.json({
        success: true,
        vehicle_id: vehicleId,
        points,
        track: line ? JSON.parse(line.track_line) : null
      });
    } catch (error) {
      console.error("❌ Error getTrackingHistory:", error);
      res.status(500).json({ success: false, message: error.message });
    }
  }  

};

module.exports = historiesController;
