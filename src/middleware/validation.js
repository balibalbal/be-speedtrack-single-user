// middleware/validation.js
const { body, validationResult, param } = require('express-validator');
const { User } = require('../models');

// Middleware untuk menangani hasil validasi
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation error',
      errors: errors.array()
    });
  }
  next();
};

// Validasi untuk registrasi user
const validateRegister = [
  body('name')
    .notEmpty()
    .withMessage('Nama harus diisi')
    .isLength({ min: 2, max: 50 })
    .withMessage('Nama harus antara 2-50 karakter')
    .trim()
    .escape(),
  
  body('email')
    .isEmail()
    .withMessage('Email tidak valid')
    .normalizeEmail()
    .custom(async (email) => {
      const existingUser = await User.getByEmail(email);
      if (existingUser) {
        throw new Error('Email sudah terdaftar');
      }
    }),
  
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password minimal 6 karakter')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password harus mengandung huruf besar, huruf kecil, dan angka'),
  
  handleValidationErrors
];

// Validasi untuk login
const validateLogin = [
  body('email')
    .isEmail()
    .withMessage('Email tidak valid')
    .normalizeEmail(),
  
  body('password')
    .notEmpty()
    .withMessage('Password harus diisi'),
  
  handleValidationErrors
];

// Validasi untuk user ID parameter
const validateUserId = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('ID harus bilangan bulat positif'),
  
  handleValidationErrors
];

// Validasi untuk update user
const validateUpdateUser = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('ID harus bilangan bulat positif'),
  
  body('name')
    .optional()
    .isLength({ min: 2, max: 50 })
    .withMessage('Nama harus antara 2-50 karakter')
    .trim()
    .escape(),
  
  body('email')
    .optional()
    .isEmail()
    .withMessage('Email tidak valid')
    .normalizeEmail()
    .custom(async (email, { req }) => {
      const existingUser = await User.getByEmail(email);
      if (existingUser && existingUser.id !== parseInt(req.params.id)) {
        throw new Error('Email sudah digunakan oleh user lain');
      }
    }),
  
  handleValidationErrors
];

module.exports = {
  validateRegister,
  validateLogin,
  validateUserId,
  validateUpdateUser,
  handleValidationErrors
};