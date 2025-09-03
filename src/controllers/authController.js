// controllers/authController.js
const { User } = require('../models');

const authController = {
  // Register user baru
  register: async (req, res) => {
    try {
      const { name, email, password, role } = req.body;

      // Cek jika email sudah terdaftar
      const existingUser = await User.getByEmail(email);
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'Email sudah terdaftar.'
        });
      }

      // Buat user baru
      const newUser = await User.create({ name, email, password, role });

      // Generate token
      const token = User.generateAuthToken(newUser.id, newUser.role);
      
      // Simpan token ke database
      await User.saveToken(newUser.id, token);

      res.status(201).json({
        success: true,
        message: 'User berhasil didaftarkan.',
        data: {
          user: newUser,
          token
        }
      });
    } catch (error) {
      console.error('Register error:', error);
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  },

  // Login user
  login: async (req, res) => {
    try {
      const { email, password } = req.body;

      // Cek jika user exists
      const user = await User.getByEmail(email);
      if (!user) {
        return res.status(400).json({
          success: false,
          message: 'Email atau password salah.'
        });
      }

      // Verifikasi password
      const isPasswordValid = await User.verifyPassword(password, user.password);
      if (!isPasswordValid) {
        return res.status(400).json({
          success: false,
          message: 'Email atau password salah.'
        });
      }

      // Generate token
      const token = User.generateAuthToken(user.id, user.role);
      
      // Simpan token ke database
      await User.saveToken(user.id, token);

      // Hapus password dari response
      const { password: _, ...userWithoutPassword } = user;

      res.json({
        success: true,
        message: 'Login berhasil.',
        data: {
          user: userWithoutPassword,
          token
        }
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  },

  // Logout user
  logout: async (req, res) => {
    try {
      await User.removeToken(req.user.userId);
      
      res.json({
        success: true,
        message: 'Logout berhasil.'
      });
    } catch (error) {
      console.error('Logout error:', error);
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  },

  // Get profile user yang sedang login
  getProfile: async (req, res) => {
    try {
      const user = await User.getById(req.user.id);
      
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User tidak ditemukan.'
        });
      }

      res.json({
        success: true,
        data: user
      });
    } catch (error) {
      console.error('Get profile error:', error);
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
};

module.exports = authController;