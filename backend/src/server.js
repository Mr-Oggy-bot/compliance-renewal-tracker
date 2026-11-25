const express = require('express');
const cors = require('cors');
const path = require('path');
const config = require('./config');
const apiRoutes = require('./routes/api');
const database = require('./db/database');

const app = express();

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static uploads
app.use('/uploads', express.static(config.UPLOAD_DIR));

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'Compliance Renewal Tracker API',
    timestamp: new Date().toISOString()
  });
});

// API router
app.use('/api', (req, res, next) => {
  database.initialize().then(() => next()).catch(next);
});
app.use('/api', apiRoutes);

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error'
  });
});

if (require.main === module) {
  app.listen(config.PORT, () => {
    console.log(`=======================================================`);
    console.log(`  Compliance Renewal Tracker API Server`);
    console.log(`  Listening on http://localhost:${config.PORT}`);
    console.log(`  Health check: http://localhost:${config.PORT}/health`);
    console.log(`=======================================================`);
  });
}

module.exports = app;
