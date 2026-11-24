const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const config = require('../config');
const { query, get, run } = require('../db/database');

function uuid() {
  return crypto.randomUUID();
}

// Upload certificate linked to an instance
async function uploadDocument(req, res) {
  try {
    const { instance_id } = req.body;
    if (!instance_id) {
      return res.status(400).json({ error: 'instance_id is required' });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded or file rejected by validator' });
    }

    // Verify instance belongs to user organisation
    const instance = get(`
      SELECT i.id, o.org_id
      FROM instances i
      JOIN obligations o ON i.obligation_id = o.id
      WHERE i.id = ? AND o.org_id = ?
    `, [instance_id, req.org_id]);

    if (!instance) {
      // Remove uploaded file if unauthorized
      fs.unlinkSync(req.file.path);
      return res.status(404).json({ error: 'Instance not found in your organization' });
    }

    const docId = uuid();
    const relativeKey = path.relative(path.join(__dirname, '../../../'), req.file.path).replace(/\\/g, '/');

    run(`
      INSERT INTO documents (id, instance_id, file_key, file_name, uploaded_by)
      VALUES (?, ?, ?, ?, ?)
    `, [docId, instance_id, relativeKey, req.file.originalname, req.user.id]);

    return res.status(201).json({
      message: 'Certificate uploaded and linked to renewal cycle successfully',
      document: {
        id: docId,
        instance_id,
        file_name: req.file.originalname,
        file_key: relativeKey,
        uploaded_by: req.user.id,
        size_bytes: req.file.size
      }
    });
  } catch (err) {
    console.error('uploadDocument error:', err);
    return res.status(500).json({ error: 'Failed to upload document' });
  }
}

// GET /api/documents/:id/download
async function downloadDocument(req, res) {
  try {
    const { id } = req.params;
    const doc = get(`
      SELECT d.*, o.org_id
      FROM documents d
      JOIN instances i ON d.instance_id = i.id
      JOIN obligations o ON i.obligation_id = o.id
      WHERE d.id = ? AND o.org_id = ?
    `, [id, req.org_id]);

    if (!doc) {
      return res.status(404).json({ error: 'Document not found' });
    }

    const absPath = path.resolve(__dirname, '../../../', doc.file_key);
    if (!fs.existsSync(absPath)) {
      return res.status(404).json({ error: 'File content missing on storage volume' });
    }

    return res.download(absPath, doc.file_name);
  } catch (err) {
    console.error('downloadDocument error:', err);
    return res.status(500).json({ error: 'Failed to download document' });
  }
}

module.exports = {
  uploadDocument,
  downloadDocument
};
