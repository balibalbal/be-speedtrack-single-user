// app.js
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
//const cookieParser = require("cookie-parser");
require('dotenv').config();

// Import routes
const authRoutes = require('./src/routes/authRoutes');
const userRoutes = require('./src/routes/userRoutes');
const deviceRoutes = require('./src/routes/deviceRoutes');
const vehicleRoutes = require('./src/routes/vehicleRoutes');
const historiesRoutes = require('./src/routes/historiesRoutes');
const traccarRoutes = require('./src/routes/traccarRoutes');
const permissionRoutes = require('./src/routes/permissionRoutes');

const app = express();

// Middleware
//app.use(cookieParser());
app.use(helmet());
app.use(cors());
app.use(morgan('combined'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/permissions', permissionRoutes);
app.use('/auth', authRoutes); 
app.use('/users', userRoutes);
app.use('/devices', deviceRoutes);
app.use('/vehicles', vehicleRoutes);
app.use('/histories', historiesRoutes);
app.use('/traccars', traccarRoutes);

// Default route
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Server Express.js dengan PostgreSQL berjalan!'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint tidak ditemukan'
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Terjadi kesalahan pada server'
  });
});

module.exports = app;