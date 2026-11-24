require('dotenv').config();
const path = require('path');

module.exports = {
  PORT: process.env.PORT || 5000,
  JWT_SECRET: process.env.JWT_SECRET || 'compliance_super_secret_jwt_key_2026',
  JWT_EXPIRES_IN: '1d',
  REFRESH_SECRET: process.env.REFRESH_SECRET || 'compliance_refresh_secret_jwt_key_2026',
  REFRESH_EXPIRES_IN: '7d',
  DB_PATH: process.env.DB_PATH || path.join(__dirname, '../../compliance.db'),
  UPLOAD_DIR: process.env.UPLOAD_DIR || path.join(__dirname, '../../../uploads'),
  FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:5173'
};
