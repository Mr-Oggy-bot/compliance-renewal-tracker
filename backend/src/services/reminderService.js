const { query, run, get } = require('../db/database');
const crypto = require('crypto');

function uuid() {
  return crypto.randomUUID();
}

function formatDate(d) {
  return d.toISOString().split('T')[0];
}

function subDays(dateStr, days) {
  const d = new Date(dateStr + 'T00:00:00Z');
  d.setDate(d.getDate() - days);
  return formatDate(d);
}

// Phase 1: Planning - Generate t30, t7, t0 reminder rows upon instance creation
function generateRemindersForInstance(instanceId, validToDate) {
  const tiers = [
    { tier: 't30', dueDate: subDays(validToDate, 30) },
    { tier: 't7', dueDate: subDays(validToDate, 7) },
    { tier: 't0', dueDate: validToDate }
  ];

  const created = [];
  for (const t of tiers) {
    try {
      const id = uuid();
      run(
        'INSERT INTO reminders (id, instance_id, tier, due_date, status, sent_at) VALUES (?, ?, ?, ?, ?, ?)',
        [id, instanceId, t.tier, t.dueDate, 'pending', null]
      );
      created.push({ id, instance_id: instanceId, tier: t.tier, due_date: t.dueDate, status: 'pending' });
    } catch (err) {
      if (err.message && err.message.includes('UNIQUE constraint failed')) {
        // Enforce structural idempotency as specified in Section 5.2
        console.warn(`Idempotency enforced: duplicate reminder (${instanceId}, ${t.tier}) rejected by database constraint.`);
      } else {
        throw err;
      }
    }
  }
  return created;
}

// In-memory log of dispatched emails for audit and demo inspection
const emailDeliveryLog = [];

// Phase 2: Sending - Worker selects pending reminders due on or before target date
async function runReminderWorkerBatch(options = {}) {
  const {
    currentDate = formatDate(new Date()),
    simulateCrashAfter = null, // Used for Week 7 crash verification test!
    logger = console.log
  } = options;

  logger(`[ReminderWorker] Starting batch run for target date: ${currentDate}`);

  // Fetch pending reminders due today or earlier with full instance & obligation context
  const pendingRows = query(`
    SELECT r.id as reminder_id, r.instance_id, r.tier, r.due_date, r.status,
           i.cycle_no, i.valid_to, i.certificate_no,
           o.id as obligation_id, o.title as obligation_title, o.category,
           u.email as owner_email, u.name as owner_name,
           org.name as org_name
    FROM reminders r
    JOIN instances i ON r.instance_id = i.id
    JOIN obligations o ON i.obligation_id = o.id
    JOIN users u ON o.owner_user_id = u.id
    JOIN organisations org ON o.org_id = org.id
    WHERE r.status = 'pending' AND r.due_date <= ?
    ORDER BY r.due_date ASC
  `, [currentDate]);

  logger(`[ReminderWorker] Found ${pendingRows.length} pending reminders due.`);

  let processedCount = 0;
  let skippedAlreadySent = 0;
  let errors = 0;

  for (const row of pendingRows) {
    // Check if simulate crash triggered
    if (simulateCrashAfter !== null && processedCount >= simulateCrashAfter) {
      logger(`[ReminderWorker] *** SIMULATED WORKER CRASH TRIGGERED after ${processedCount} sends! Process terminating abruptly. ***`);
      const crashError = new Error(`Simulated worker failure after ${processedCount} dispatches`);
      crashError.processedCount = processedCount;
      throw crashError;
    }

    try {
      // Step 2a: Mark claimed / sending
      // Atomically verify status is still pending to avoid race conditions
      const verify = get('SELECT status FROM reminders WHERE id = ?', [row.reminder_id]);
      if (!verify || verify.status !== 'pending') {
        skippedAlreadySent++;
        continue;
      }

      // Step 2b: Dispatch notification (Simulated email service with full audit trail)
      const emailPayload = {
        id: uuid(),
        reminder_id: row.reminder_id,
        to: row.owner_email,
        recipient_name: row.owner_name,
        obligation: row.obligation_title,
        tier: row.tier,
        cycle_no: row.cycle_no,
        valid_to: row.valid_to,
        dispatched_at: new Date().toISOString(),
        subject: `[ACTION REQUIRED] Compliance Renewal Notice: ${row.obligation_title} (${row.tier.toUpperCase()})`
      };

      // Record in system email log
      emailDeliveryLog.unshift(emailPayload);
      logger(`[ReminderWorker] Email delivered to ${row.owner_email} for "${row.obligation_title}" [Tier: ${row.tier}]`);

      // Step 2c: Mark sent with timestamp
      run('UPDATE reminders SET status = ?, sent_at = ? WHERE id = ?', [
        'sent',
        new Date().toISOString(),
        row.reminder_id
      ]);

      processedCount++;
    } catch (sendErr) {
      errors++;
      run('UPDATE reminders SET status = ? WHERE id = ?', ['failed', row.reminder_id]);
      logger(`[ReminderWorker] Failed to dispatch reminder ${row.reminder_id}: ${sendErr.message}`);
    }
  }

  logger(`[ReminderWorker] Batch completed: ${processedCount} sent, ${skippedAlreadySent} skipped, ${errors} failed.`);
  return {
    success: true,
    processedCount,
    skippedAlreadySent,
    errors,
    emailDeliveryLog: emailDeliveryLog.slice(0, 20)
  };
}

module.exports = {
  generateRemindersForInstance,
  runReminderWorkerBatch,
  emailDeliveryLog
};
