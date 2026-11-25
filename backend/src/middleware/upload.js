const multer = require('multer');
const path = require('path');
const fs = require('fs');
const config = require('../config/index.js');

// Ensure uploads directory exists
if (!process.env.VERCEL && !fs.existsSync(config.UPLOAD_DIR)) {
  fs.mkdirSync(config.UPLOAD_DIR, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, config.UPLOAD_DIR);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, 'cert-' + uniqueSuffix + ext);
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = ['application/pdf', 'image/png', 'image/jpeg', 'image/jpg'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only PDF, PNG, and JPEG documents are permitted.'), false);
  }
};

const upload = multer({
  storage: process.env.VERCEL ? multer.memoryStorage() : storage,
  // Leave room for multipart headers within Vercel's request size limit.
  limits: { fileSize: (process.env.VERCEL ? 4 : 10) * 1024 * 1024 },
  fileFilter
});

module.exports = upload;
