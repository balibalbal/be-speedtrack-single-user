// controllers/vehicleController.js
const { Vehicle } = require('../models');

const vehicleController = {
  // Get all Vehicle
  getAllSelect: async (req, res) => {
    try {
      const users = await Vehicle.getAllVehicleForSelect();
      res.json({
        success: true,
        data: users
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  },
  getAllVehicle: async (req, res) => {
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
  
        const result = await Vehicle.getAll(page, limit, search);
        
        const totalPages = Math.ceil(result.totalCount / limit);
  
        res.json({
          success: true,
          data: {
            vehicles: result.vehicles,
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
        console.error("Error in getAllVehicles:", error);
        res.status(500).json({
          success: false,
          message: error.message
        });
      }
    },

  // Get Vehicle by ID
  getVehicleById: async (req, res) => {
    try {
      const vehicle = await Vehicle.getById(req.params.id);
      if (!vehicle) {
        return res.status(404).json({
          success: false,
          message: 'Vehicle tidak ditemukan'
        });
      }
      res.json({
        success: true,
        data: vehicle
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  },

  // Create new Vehicle
  createVehicle: async (req, res) => {
    try {
      const newVehicle = await Vehicle.create(req.body);
      res.status(201).json({
        success: true,
        data: newVehicle
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  },

  // Update Vehicle
  updateVehicle: async (req, res) => {
    try {
      const updatedVehicle = await Vehicle.update(req.params.id, req.body);
      if (!updatedVehicle) {
        return res.status(404).json({
          success: false,
          message: 'Vehicle tidak ditemukan'
        });
      }
      res.json({
        success: true,
        data: updatedVehicle
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  },

  // Delete Vehicle
  deleteVehicle: async (req, res) => {
    try {
      const deletedVehicle = await Vehicle.delete(req.params.id);
      if (!deletedVehicle) {
        return res.status(404).json({
          success: false,
          message: 'Vehicle tidak ditemukan'
        });
      }
      res.json({
        success: true,
        message: 'Vehicle berhasil dihapus'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
};

module.exports = vehicleController;