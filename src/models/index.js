// models/index.js
const User = require('./userModel');
const Device = require('./deviceModel');
const Traccar = require('./traccarModel');
const Vehicle = require('./vehicleModel');
const Histories = require('./historiesModel');
// Export semua model
module.exports = {
  User,
  Device,
  Vehicle,
  Histories,
  Traccar,
};