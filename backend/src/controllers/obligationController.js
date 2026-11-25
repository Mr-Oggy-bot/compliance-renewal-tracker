const crypto = require('crypto');
const { query, get, run } = require('../db/database');
const { generateRemindersForInstance } = require('../services/reminderService');

function uuid() {
  return crypto.randomUUID();
}

function formatDate(d) {
  return d.toISOString().split('T')[0];
}

function calculateNextEndDate(startDateStr, frequency) {
  const d = new Date(startDateStr + 'T00:00:00Z');
  switch (frequency) {
    case 'monthly':
      d.setMonth(d.getMonth() + 1);
      break;
    case 'quarterly':
      d.setMonth(d.getMonth() + 3);
      break;
    case 'yearly':
      d.setFullYear(d.getFullYear() + 1);
      break;
    case 'three_yearly':
      d.setFullYear(d.getFullYear() + 3);
      break;
    default:
      d.setFullYear(d.getFullYear() + 1);
  }
  // Subtract 1 day so if from 2025-04-01, yearly ends 2026-03-31
  d.setDate(d.getDate() - 1);
  return formatDate(d);
}

function addDays(dateStr, days) {
  const d = new Date(dateStr + 'T00:00:00Z');
  d.setDate(d.getDate() + days);
  return formatDate(d);
}

// GET /api/obligations - list all obligations for current tenant
async function listObligations(req, res) {
  try {
    const { category, ownerId, status } = req.query;
    let sql = `
      SELECT o.*, u.name as owner_name, u.email as owner_email,
             i.id as current_instance_id, i.cycle_no, i.valid_from, i.valid_to,
             i.status as instance_status, i.certificate_no
      FROM obligations o
      LEFT JOIN users u ON o.owner_user_id = u.id
      LEFT JOIN instances i ON i.obligation_id = o.id AND i.cycle_no = (
        SELECT MAX(cycle_no) FROM instances WHERE obligation_id = o.id
      )
      WHERE o.org_id = ?
    `;
    const params = [req.org_id];

    if (category) {
      sql += ' AND o.category = ?';
      params.push(category);
    }
    if (ownerId) {
      sql += ' AND o.owner_user_id = ?';
      params.push(ownerId);
    }

    sql += ' ORDER BY o.title ASC';
    const rows = await query(sql, params);

    // Compute dynamic compliance status (traffic light)
    const today = formatDate(new Date());
    const enriched = rows.map(item => {
      let traffic = 'green'; // compliant
      if (!item.valid_to) {
        traffic = 'red';
      } else if (item.valid_to < today) {
        traffic = 'red'; // expired
      } else {
        const warningDate = addDays(today, item.lead_days || 30);
        if (item.valid_to <= warningDate) {
          traffic = 'amber'; // action needed
        }
      }
      return {
        ...item,
        compliance_traffic: traffic
      };
    });

    return res.json({ obligations: enriched });
  } catch (err) {
    console.error('listObligations error:', err);
    return res.status(500).json({ error: 'Failed to retrieve obligations' });
  }
}

// GET /api/obligations/:id - obligation detail with full append-only ledger history
async function getObligationById(req, res) {
  try {
    const { id } = req.params;
    const { asOfDate } = req.query; // Audit query capability!

    const obligation = await get(`
      SELECT o.*, u.name as owner_name, u.email as owner_email
      FROM obligations o
      LEFT JOIN users u ON o.owner_user_id = u.id
      WHERE o.id = ? AND o.org_id = ?
    `, [id, req.org_id]);

    if (!obligation) {
      return res.status(404).json({ error: 'Obligation not found' });
    }

    // Retrieve all instances ordered by cycle_no (The Immutable Ledger)
    const instances = await query(`
      SELECT * FROM instances
      WHERE obligation_id = ?
      ORDER BY cycle_no DESC
    `, [id]);

    // For each instance, load reminders and documents
    const instancesWithDetails = await Promise.all(instances.map(async inst => {
      const reminders = await query('SELECT * FROM reminders WHERE instance_id = ? ORDER BY due_date ASC', [inst.id]);
      const documents = await query(`
        SELECT d.id, d.instance_id, d.file_key, d.file_name, d.uploaded_by, d.uploaded_at, u.name as uploaded_by_name
        FROM documents d
        LEFT JOIN users u ON d.uploaded_by = u.id
        WHERE d.instance_id = ?
        ORDER BY d.uploaded_at DESC
      `, [inst.id]);
      return {
        ...inst,
        reminders,
        documents
      };
    }));

    // If asOfDate audit query is provided (answering viva question: Was org compliant on date X?)
    let auditResult = null;
    if (asOfDate) {
      const validInstance = instances.find(inst => inst.valid_from <= asOfDate && asOfDate <= inst.valid_to);
      auditResult = {
        asOfDate,
        isCompliant: !!validInstance,
        matchingInstance: validInstance || null,
        verdict: validInstance
          ? `Compliant: Covered by Cycle #${validInstance.cycle_no} (Cert: ${validInstance.certificate_no || 'N/A'})`
          : 'NON-COMPLIANT: No valid certificate active on this historical date (Compliance Gap Detected)'
      };
    }

    return res.json({
      obligation,
      instances: instancesWithDetails,
      auditResult
    });
  } catch (err) {
    console.error('getObligationById error:', err);
    return res.status(500).json({ error: 'Failed to retrieve obligation details' });
  }
}

// POST /api/obligations - create new standing obligation + initial instance
async function createObligation(req, res) {
  try {
    const {
      title,
      category,
      authority,
      frequency,
      lead_days = 30,
      owner_user_id,
      initial_valid_from,
      initial_valid_to,
      initial_certificate_no
    } = req.body;

    if (!title || !category || !authority || !frequency || !owner_user_id) {
      return res.status(400).json({ error: 'Missing required obligation fields' });
    }

    // Verify owner belongs to same tenant
    const owner = await get('SELECT id FROM users WHERE id = ? AND org_id = ?', [owner_user_id, req.org_id]);
    if (!owner) {
      return res.status(400).json({ error: 'Assigned owner does not belong to your organization' });
    }

    const obligationId = uuid();
    await run(`
      INSERT INTO obligations (id, org_id, title, category, authority, frequency, lead_days, owner_user_id, is_active)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1)
    `, [obligationId, req.org_id, title, category, authority, frequency, Number(lead_days), owner_user_id]);

    // Create Initial Instance (Cycle 1)
    const validFrom = initial_valid_from || formatDate(new Date());
    const validTo = initial_valid_to || calculateNextEndDate(validFrom, frequency);
    const instanceId = uuid();

    const today = formatDate(new Date());
    const instanceStatus = validTo < today ? 'expired' : 'active';

    await run(`
      INSERT INTO instances (id, obligation_id, cycle_no, valid_from, valid_to, status, certificate_no)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [instanceId, obligationId, 1, validFrom, validTo, instanceStatus, initial_certificate_no || null]);

    // Phase 1: Pre-generate reminders for this new instance
    const reminders = await generateRemindersForInstance(instanceId, validTo);

    return res.status(201).json({
      message: 'Obligation and initial renewal cycle created successfully',
      obligation_id: obligationId,
      instance_id: instanceId,
      reminders_created: reminders.length
    });
  } catch (err) {
    console.error('createObligation error:', err);
    return res.status(500).json({ error: 'Failed to create obligation' });
  }
}

// POST /api/obligations/:id/renew - The Core Ledger Renewal Flow
// Preserves previous instance untouched, marks it 'renewed', creates new instance row + reminders
async function renewObligation(req, res) {
  try {
    const { id } = req.params;
    const { certificate_no, valid_from, valid_to } = req.body;

    const obligation = await get('SELECT * FROM obligations WHERE id = ? AND org_id = ?', [id, req.org_id]);
    if (!obligation) {
      return res.status(404).json({ error: 'Obligation not found' });
    }

    // Get current latest instance
    const currentInstance = await get(`
      SELECT * FROM instances
      WHERE obligation_id = ?
      ORDER BY cycle_no DESC
      LIMIT 1
    `, [id]);

    const newCycleNo = currentInstance ? currentInstance.cycle_no + 1 : 1;

    // Mark previous instance as renewed
    if (currentInstance) {
      await run('UPDATE instances SET status = ? WHERE id = ?', ['renewed', currentInstance.id]);
    }

    // Calculate new validity range
    let newValidFrom = valid_from;
    if (!newValidFrom) {
      // Start the day after the old validity ended, or today
      newValidFrom = currentInstance ? addDays(currentInstance.valid_to, 1) : formatDate(new Date());
    }

    const newValidTo = valid_to || calculateNextEndDate(newValidFrom, obligation.frequency);
    const newInstanceId = uuid();

    await run(`
      INSERT INTO instances (id, obligation_id, cycle_no, valid_from, valid_to, status, certificate_no)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [newInstanceId, id, newCycleNo, newValidFrom, newValidTo, 'active', certificate_no || null]);

    // Pre-create tiered reminders for the new cycle
    const reminders = await generateRemindersForInstance(newInstanceId, newValidTo);

    return res.status(201).json({
      message: `Cycle #${newCycleNo} created successfully in append-only ledger`,
      instance: {
        id: newInstanceId,
        cycle_no: newCycleNo,
        valid_from: newValidFrom,
        valid_to: newValidTo,
        status: 'active',
        certificate_no
      },
      reminders_generated: reminders.length
    });
  } catch (err) {
    console.error('renewObligation error:', err);
    return res.status(500).json({ error: 'Failed to renew obligation' });
  }
}

// DELETE /api/obligations/:id
async function deleteObligation(req, res) {
  try {
    const { id } = req.params;
    const ob = await get('SELECT id FROM obligations WHERE id = ? AND org_id = ?', [id, req.org_id]);
    if (!ob) {
      return res.status(404).json({ error: 'Obligation not found' });
    }
    await run('DELETE FROM obligations WHERE id = ?', [id]);
    return res.json({ message: 'Obligation and linked records deleted' });
  } catch (err) {
    console.error('deleteObligation error:', err);
    return res.status(500).json({ error: 'Failed to delete obligation' });
  }
}

module.exports = {
  listObligations,
  getObligationById,
  createObligation,
  renewObligation,
  deleteObligation
};
