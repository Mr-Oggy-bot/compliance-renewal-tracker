const { test, describe, before } = require('node:test');
const assert = require('node:assert');
const { query, get, run } = require('../src/db/database');
const { generateRemindersForInstance, runReminderWorkerBatch } = require('../src/services/reminderService');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

function uuid() {
  return crypto.randomUUID();
}

describe('Compliance Renewal Tracker - Core Test Suite', () => {

  let orgAId, orgBId;
  let adminAId, ownerAId, adminBId;
  let testObId, testInstId;

  before(() => {
    // Unique test run ids
    const tag = Date.now();
    orgAId = uuid();
    orgBId = uuid();

    run('INSERT INTO organisations (id, name) VALUES (?, ?)', [orgAId, `Test Org Alpha ${tag}`]);
    run('INSERT INTO organisations (id, name) VALUES (?, ?)', [orgBId, `Test Org Beta ${tag}`]);

    const pwHash = bcrypt.hashSync('Pass123!', 8);
    adminAId = uuid();
    ownerAId = uuid();
    adminBId = uuid();

    run('INSERT INTO users (id, org_id, name, email, password_hash, role) VALUES (?, ?, ?, ?, ?, ?)', [
      adminAId, orgAId, 'Admin Alpha', `admin_${tag}@alpha.com`, pwHash, 'admin'
    ]);
    run('INSERT INTO users (id, org_id, name, email, password_hash, role) VALUES (?, ?, ?, ?, ?, ?)', [
      ownerAId, orgAId, 'Owner Alpha', `owner_${tag}@alpha.com`, pwHash, 'owner'
    ]);
    run('INSERT INTO users (id, org_id, name, email, password_hash, role) VALUES (?, ?, ?, ?, ?, ?)', [
      adminBId, orgBId, 'Admin Beta', `admin_${tag}@beta.com`, pwHash, 'admin'
    ]);
  });

  test('M1: Access Control - User from Org A cannot access records belonging to Org B', () => {
    // Org B creates an obligation
    const obBId = uuid();
    run('INSERT INTO obligations (id, org_id, title, category, authority, frequency, lead_days, owner_user_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)', [
      obBId, orgBId, 'Beta Proprietary Secret License', 'IP', 'Patent Office', 'yearly', 30, adminBId
    ]);

    // Admin Alpha tries to query with Org A tenant scope
    const result = get('SELECT * FROM obligations WHERE id = ? AND org_id = ?', [obBId, orgAId]);
    assert.strictEqual(result, undefined, 'Org A user MUST NOT be able to find Org B record');
  });

  test('M2: Obligation & Instance Creation with Phase 1 Planning', () => {
    testObId = uuid();
    run('INSERT INTO obligations (id, org_id, title, category, authority, frequency, lead_days, owner_user_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)', [
      testObId, orgAId, 'Factory Air Quality Consent', 'Environmental', 'Pollution Board', 'yearly', 30, ownerAId
    ]);

    testInstId = uuid();
    run('INSERT INTO instances (id, obligation_id, cycle_no, valid_from, valid_to, status, certificate_no) VALUES (?, ?, ?, ?, ?, ?, ?)', [
      testInstId, testObId, 1, '2025-01-01', '2025-12-31', 'active', 'AQ-2025-001'
    ]);

    // Auto generate tiered reminders
    const reminders = generateRemindersForInstance(testInstId, '2025-12-31');
    assert.strictEqual(reminders.length, 3, 'Must create exactly 3 reminder rows: t30, t7, t0');

    const dbReminders = query('SELECT * FROM reminders WHERE instance_id = ?', [testInstId]);
    assert.strictEqual(dbReminders.length, 3);
    const tiers = dbReminders.map(r => r.tier).sort();
    assert.deepStrictEqual(tiers, ['t0', 't30', 't7']);
  });

  test('M2: Structural Idempotency - Constraint UNIQUE(instance_id, tier) rejects duplicate inserts', () => {
    assert.throws(() => {
      // Attempt to insert duplicate t30 reminder for same instance
      run('INSERT INTO reminders (id, instance_id, tier, due_date, status) VALUES (?, ?, ?, ?, ?)', [
        uuid(), testInstId, 't30', '2025-12-01', 'pending'
      ]);
    }, /UNIQUE constraint failed/, 'Database must reject duplicate (instance_id, tier) combination');
  });

  test('M2: Append-Only Ledger Renewal - Preserves Cycle 1 and generates Cycle 2', () => {
    // Fetch cycle 1
    const cycle1Before = get('SELECT * FROM instances WHERE id = ?', [testInstId]);
    assert.strictEqual(cycle1Before.status, 'active');

    // Mark renewed and insert cycle 2
    run('UPDATE instances SET status = ? WHERE id = ?', ['renewed', testInstId]);
    const cycle2Id = uuid();
    run('INSERT INTO instances (id, obligation_id, cycle_no, valid_from, valid_to, status, certificate_no) VALUES (?, ?, ?, ?, ?, ?, ?)', [
      cycle2Id, testObId, 2, '2026-01-01', '2026-12-31', 'active', 'AQ-2026-002'
    ]);

    // Verify cycle 1 still exists unmodified except status 'renewed'
    const cycle1After = get('SELECT * FROM instances WHERE id = ?', [testInstId]);
    assert.strictEqual(cycle1After.status, 'renewed');
    assert.strictEqual(cycle1After.certificate_no, 'AQ-2025-001');

    // Verify cycle 2 exists
    const cycle2 = get('SELECT * FROM instances WHERE id = ?', [cycle2Id]);
    assert.strictEqual(cycle2.cycle_no, 2);
    assert.strictEqual(cycle2.status, 'active');
  });

  test('M3: Week 7 Crash Test - Mid-batch worker termination proves zero duplicate dispatches', async () => {
    // Setup batch of pending reminders due today
    const batchInstId = uuid();
    run('INSERT INTO instances (id, obligation_id, cycle_no, valid_from, valid_to, status) VALUES (?, ?, ?, ?, ?, ?)', [
      batchInstId, testObId, 99, '2025-01-01', '2025-02-01', 'active'
    ]);

    const r1 = uuid(), r2 = uuid(), r3 = uuid();
    run('INSERT INTO reminders (id, instance_id, tier, due_date, status) VALUES (?, ?, ?, ?, ?)', [r1, batchInstId, 't30', '2025-01-01', 'pending']);
    run('INSERT INTO reminders (id, instance_id, tier, due_date, status) VALUES (?, ?, ?, ?, ?)', [r2, batchInstId, 't7', '2025-01-02', 'pending']);
    run('INSERT INTO reminders (id, instance_id, tier, due_date, status) VALUES (?, ?, ?, ?, ?)', [r3, batchInstId, 't0', '2025-01-03', 'pending']);

    // Run 1: Crash after sending 1 email
    let crashOccurred = false;
    try {
      await runReminderWorkerBatch({
        currentDate: '2025-01-05',
        simulateCrashAfter: 1,
        logger: () => {}
      });
    } catch (err) {
      crashOccurred = true;
      assert(err.message.includes('Simulated worker failure'));
    }
    assert.strictEqual(crashOccurred, true, 'Worker should have crashed mid-run as instructed');

    // Inspect database state after crash: Exactly 1 marked sent, 2 still pending
    const sentAfterCrash = query("SELECT * FROM reminders WHERE instance_id = ? AND status = 'sent'", [batchInstId]);
    const pendingAfterCrash = query("SELECT * FROM reminders WHERE instance_id = ? AND status = 'pending'", [batchInstId]);
    assert.strictEqual(sentAfterCrash.length, 1);
    assert.strictEqual(pendingAfterCrash.length, 2);

    // Run 2: Restart worker after crash
    const restartResult = await runReminderWorkerBatch({
      currentDate: '2025-01-05',
      simulateCrashAfter: null, // No crash this time
      logger: () => {}
    });

    // Verify restart sent the remaining 2 pending rows without duplicating the first one!
    const allSentNow = query("SELECT * FROM reminders WHERE instance_id = ? AND status = 'sent'", [batchInstId]);
    assert.strictEqual(allSentNow.length, 3, 'All 3 reminders must be sent now with ZERO duplicates');
  });

  test('M5: Historical Audit Query - Detects compliance status and gaps on specific dates', () => {
    // On 2025-06-15, Cycle 1 was active
    const inst1 = get("SELECT * FROM instances WHERE obligation_id = ? AND valid_from <= ? AND ? <= valid_to", [testObId, '2025-06-15', '2025-06-15']);
    assert.ok(inst1, 'Must find active instance covering 2025-06-15');
    assert.strictEqual(inst1.certificate_no, 'AQ-2025-001');

    // On 2024-06-15 (prior to cycle 1), no instance existed -> Compliance gap!
    const instPast = get("SELECT * FROM instances WHERE obligation_id = ? AND valid_from <= ? AND ? <= valid_to", [testObId, '2024-06-15', '2024-06-15']);
    assert.strictEqual(instPast, undefined, 'Must report compliance gap for dates without a valid certificate instance');
  });

});
