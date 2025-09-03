// controllers/userController.js
const { User } = require('../models');

const userController = {
  // Get all users
  getAllUsers: async (req, res) => {
    try {
      const users = await User.getAll();
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

  // Get user by ID
  getUserById: async (req, res) => {
    try {
      const user = await User.getById(req.params.id);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User tidak ditemukan'
        });
      }
      res.json({
        success: true,
        data: user
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  },

  // Create new user
  createUser: async (req, res) => {
    try {
      const newUser = await User.create(req.body);
      res.status(201).json({
        success: true,
        data: newUser
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  },

  // Update user
  updateUser: async (req, res) => {
    try {
      const updatedUser = await User.update(req.params.id, req.body);
      if (!updatedUser) {
        return res.status(404).json({
          success: false,
          message: 'User tidak ditemukan'
        });
      }
      res.json({
        success: true,
        data: updatedUser
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  },

  // Delete user
  deleteUser: async (req, res) => {
    try {
      const deletedUser = await User.delete(req.params.id);
      if (!deletedUser) {
        return res.status(404).json({
          success: false,
          message: 'User tidak ditemukan'
        });
      }
      res.json({
        success: true,
        message: 'User berhasil dihapus'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
};

module.exports = userController;