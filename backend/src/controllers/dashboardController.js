const { query } = require('../db/database');
const { runReminderWorkerBatch, emailDeliveryLog } = require('../services/reminderService');

function formatDate(d) {
  return d.toISOString().split('T')[0];
}

function addDays(d, days) {
  const copy = new Date(d);
  copy.setDate(copy.getDate() + days);
  return copy;
}

// GET /api/dashboard/summary
async function getDashboardSummary(req, res) {
  try {
    const today = formatDate(new Date());
    const orgId = req.org_id;

    // Fetch latest instance for every obligation
    const items = query(`
      SELECT o.id, o.title, o.category, o.frequency, o.lead_days, o.owner_user_id,
             u.name as owner_name,
             i.id as instance_id, i.cycle_no, i.valid_from, i.valid_to, i.status as instance_status, i.certificate_no
      FROM obligations o
      LEFT JOIN users u ON o.owner_user_id = u.id
      LEFT JOIN instances i ON i.obligation_id = o.id AND i.cycle_no = (
        SELECT MAX(cycle_no) FROM instances WHERE obligation_id = o.id
      )
      WHERE o.org_id = ?
    `, [orgId]);

    let greenCount = 0;
    let amberCount = 0;
    let redCount = 0;

    const timeline90Days = [];
    const windowEnd = formatDate(addDays(new Date(), 90));

    const enriched = items.map(item => {
      let statusTraffic = 'green';
      if (!item.valid_to || item.valid_to < today) {
        statusTraffic = 'red';
        redCount++;
      } else {
        const leadDate = formatDate(addDays(new Date(), item.lead_days || 30));
        if (item.valid_to <= leadDate) {
          statusTraffic = 'amber';
          amberCount++;
        } else {
          greenCount++;
        }
      }

      // 90-day timeline grouping
      if (item.valid_to && item.valid_to <= windowEnd) {
        timeline90Days.push({
          obligation_id: item.id,
          title: item.title,
          category: item.category,
          valid_to: item.valid_to,
          traffic: statusTraffic,
          owner_name: item.owner_name
        });
      }

      return {
        ...item,
        traffic: statusTraffic
      };
    });

    timeline90Days.sort((a, b) => a.valid_to.localeCompare(b.valid_to));

    return res.json({
      metrics: {
        totalObligations: items.length,
        green: greenCount,
        amber: amberCount,
        red: redCount,
        complianceRate: items.length > 0 ? Math.round((greenCount / items.length) * 100) : 100
      },
      timeline90Days,
      obligations: enriched
    });
  } catch (err) {
    console.error('getDashboardSummary error:', err);
    return res.status(500).json({ error: 'Failed to generate dashboard summary' });
  }
}

// GET /api/dashboard/my-tasks
async function getMyTasks(req, res) {
  try {
    const today = formatDate(new Date());
    const tasks = query(`
      SELECT o.id as obligation_id, o.title, o.category, o.frequency, o.lead_days,
             i.id as instance_id, i.cycle_no, i.valid_from, i.valid_to, i.certificate_no,
             r.id as reminder_id, r.tier, r.due_date, r.status as reminder_status
      FROM obligations o
      JOIN instances i ON i.obligation_id = o.id AND i.cycle_no = (
        SELECT MAX(cycle_no) FROM instances WHERE obligation_id = o.id
      )
      LEFT JOIN reminders r ON r.instance_id = i.id AND r.status = 'pending'
      WHERE o.org_id = ? AND o.owner_user_id = ?
      ORDER BY i.valid_to ASC
    `, [req.org_id, req.user.id]);

    return res.json({ tasks });
  } catch (err) {
    console.error('getMyTasks error:', err);
    return res.status(500).json({ error: 'Failed to retrieve tasks' });
  }
}

// POST /api/dashboard/run-worker (On-demand trigger for testing & verification)
async function triggerWorkerRun(req, res) {
  try {
    const { simulateCrashAfter = null, targetDate = formatDate(new Date()) } = req.body;

    const result = await runReminderWorkerBatch({
      currentDate: targetDate,
      simulateCrashAfter: simulateCrashAfter !== null ? Number(simulateCrashAfter) : null,
      logger: console.log
    });

    return res.json({
      message: 'Worker execution finished',
      ...result
    });
  } catch (err) {
    return res.status(500).json({
      error: err.message,
      isSimulatedCrash: err.message.includes('Simulated worker failure'),
      partialProcessed: err.processedCount || 0
    });
  }
}

// GET /api/dashboard/email-logs
async function getEmailLogs(req, res) {
  return res.json({ logs: emailDeliveryLog });
}

module.exports = {
  getDashboardSummary,
  getMyTasks,
  triggerWorkerRun,
  getEmailLogs
};
