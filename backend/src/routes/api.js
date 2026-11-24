const express = require('express');
const router = express.Router();

const { authenticate } = require('../middleware/auth');
const tenantScope = require('../middleware/tenantScope');
const { requireRole } = require('../middleware/rbac');
const upload = require('../middleware/upload');

const authController = require('../controllers/authController');
const obligationController = require('../controllers/obligationController');
const documentController = require('../controllers/documentController');
const dashboardController = require('../controllers/dashboardController');

// --- Auth Routes ---
router.post('/auth/register', authController.register);
router.post('/auth/login', authController.login);
router.post('/auth/refresh', authController.refresh);
router.get('/auth/me', authenticate, authController.me);
router.get('/auth/users', authenticate, tenantScope, authController.getOrgUsers);

// --- Obligations & Ledger Routes ---
router.get('/obligations', authenticate, tenantScope, obligationController.listObligations);
router.get('/obligations/:id', authenticate, tenantScope, obligationController.getObligationById);
router.post('/obligations', authenticate, tenantScope, requireRole('admin', 'manager'), obligationController.createObligation);
router.post('/obligations/:id/renew', authenticate, tenantScope, obligationController.renewObligation);
router.delete('/obligations/:id', authenticate, tenantScope, requireRole('admin'), obligationController.deleteObligation);

// --- Document Management Routes ---
router.post('/documents/upload', authenticate, tenantScope, upload.single('file'), documentController.uploadDocument);
router.get('/documents/:id/download', authenticate, tenantScope, documentController.downloadDocument);

// --- Dashboard & Worker Routes ---
router.get('/dashboard/summary', authenticate, tenantScope, dashboardController.getDashboardSummary);
router.get('/dashboard/my-tasks', authenticate, tenantScope, dashboardController.getMyTasks);
router.post('/dashboard/run-worker', authenticate, tenantScope, dashboardController.triggerWorkerRun);
router.get('/dashboard/email-logs', authenticate, tenantScope, dashboardController.getEmailLogs);

module.exports = router;
