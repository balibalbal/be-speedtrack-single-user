// controllers/deviceController.js
const { Device } = require('../models');

const deviceController = {
  // Get all Device
  getAllDevices: async (req, res) => {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const search = req.query.search || '';

      // Validasi parameter
      if (page < 1) {
        return res.status(400).json({
          success: false,
          message: "Page must be greater than 0"
        });
      }

      if (limit < 1 || limit > 100) {
        return res.status(400).json({
          success: false,
          message: "Limit must be between 1 and 100"
        });
      }

      const result = await Device.getAll(page, limit, search);
      
      const totalPages = Math.ceil(result.totalCount / limit);

      res.json({
        success: true,
        data: {
          devices: result.devices,
          pagination: {
            currentPage: page,
            totalPages: totalPages,
            totalItems: result.totalCount,
            itemsPerPage: limit,
            hasNext: page < totalPages,
            hasPrev: page > 1
          }
        }
      });
    } catch (error) {
      console.error("Error in getAllDevices:", error);
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  },

  // Get Device by ID
  getDeviceById: async (req, res) => {
    try {
      const device = await Device.getById(req.params.id);
      if (!device) {
        return res.status(404).json({
          success: false,
          message: 'Device tidak ditemukan'
        });
      }
      res.json({
        success: true,
        data: device
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  },

  // Create new Device
  createDevice: async (req, res) => {
    try {
      const newDevice = await Device.create(req.body);
      res.status(201).json({
        success: true,
        data: newDevice
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  },

  // Update Device
  updateDevice: async (req, res) => {
    try {
      const updatedDevice = await Device.update(req.params.id, req.body);
      if (!updatedDevice) {
        return res.status(404).json({
          success: false,
          message: 'Device tidak ditemukan'
        });
      }
      res.json({
        success: true,
        data: updatedDevice
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  },

  // Delete Device
  deleteDevice: async (req, res) => {
    try {
      const deletedDevice = await Device.delete(req.params.id);
      if (!deletedDevice) {
        return res.status(404).json({
          success: false,
          message: 'Device tidak ditemukan'
        });
      }
      res.json({
        success: true,
        message: 'Device berhasil dihapus'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
};

module.exports = deviceController;