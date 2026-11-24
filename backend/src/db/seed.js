const { db, run, get } = require('./database');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

function uuid() {
  return crypto.randomUUID();
}

async function seed() {
  console.log('Seeding compliance database with 3-year history & realistic lapses...');

  // Clean existing
  db.exec(`
    DELETE FROM documents;
    DELETE FROM reminders;
    DELETE FROM instances;
    DELETE FROM obligations;
    DELETE FROM users;
    DELETE FROM organisations;
  `);

  const passwordHash = bcrypt.hashSync('Password123!', 10);

  // 1. Organisations
  const orgApexId = uuid();
  const orgMeridianId = uuid();

  run('INSERT INTO organisations (id, name, timezone) VALUES (?, ?, ?)', [
    orgApexId,
    'Apex Healthcare & Research Institute',
    'Asia/Kolkata'
  ]);

  run('INSERT INTO organisations (id, name, timezone) VALUES (?, ?, ?)', [
    orgMeridianId,
    'Meridian Precision Manufacturing Ltd.',
    'Asia/Kolkata'
  ]);

  // 2. Users for Apex Healthcare
  const adminApexId = uuid();
  const managerApexId = uuid();
  const ownerApexId = uuid();

  run('INSERT INTO users (id, org_id, name, email, password_hash, role) VALUES (?, ?, ?, ?, ?, ?)', [
    adminApexId,
    orgApexId,
    'Sarah Jenkins (Admin)',
    'admin@apexhealth.org',
    passwordHash,
    'admin'
  ]);

  run('INSERT INTO users (id, org_id, name, email, password_hash, role) VALUES (?, ?, ?, ?, ?, ?)', [
    managerApexId,
    orgApexId,
    'Dr. Rajesh Kumar (Manager)',
    'manager@apexhealth.org',
    passwordHash,
    'manager'
  ]);

  run('INSERT INTO users (id, org_id, name, email, password_hash, role) VALUES (?, ?, ?, ?, ?, ?)', [
    ownerApexId,
    orgApexId,
    'Vikram Singh (Facilities Owner)',
    'facility@apexhealth.org',
    passwordHash,
    'owner'
  ]);

  // User for Meridian (Multi-tenant isolation verification)
  const adminMeridianId = uuid();
  run('INSERT INTO users (id, org_id, name, email, password_hash, role) VALUES (?, ?, ?, ?, ?, ?)', [
    adminMeridianId,
    orgMeridianId,
    'Dave Miller (Meridian Admin)',
    'admin@meridianmfg.com',
    passwordHash,
    'admin'
  ]);

  // Helper date calculators
  const now = new Date();
  function formatDate(d) {
    return d.toISOString().split('T')[0];
  }
  function addDays(d, days) {
    const copy = new Date(d);
    copy.setDate(copy.getDate() + days);
    return copy;
  }

  // 3. Obligations for Apex
  // Obligation 1: Fire Safety NOC (3-year continuous compliance history)
  const ob1Id = uuid();
  run('INSERT INTO obligations (id, org_id, title, category, authority, frequency, lead_days, owner_user_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)', [
    ob1Id,
    orgApexId,
    'Fire Safety NOC (Hospital Wing A & B)',
    'Safety & Fire',
    'Directorate of Fire & Emergency Services',
    'yearly',
    30,
    ownerApexId
  ]);

  // Obligation 1 Instances:
  // Cycle 1: 2023-04-01 to 2024-03-31 (Renewed)
  const inst1_1 = uuid();
  run('INSERT INTO instances (id, obligation_id, cycle_no, valid_from, valid_to, status, certificate_no) VALUES (?, ?, ?, ?, ?, ?, ?)', [
    inst1_1, ob1Id, 1, '2023-04-01', '2024-03-31', 'renewed', 'NOC-2023-8819'
  ]);
  // Cycle 2: 2024-04-01 to 2025-03-31 (Renewed)
  const inst1_2 = uuid();
  run('INSERT INTO instances (id, obligation_id, cycle_no, valid_from, valid_to, status, certificate_no) VALUES (?, ?, ?, ?, ?, ?, ?)', [
    inst1_2, ob1Id, 2, '2024-04-01', '2025-03-31', 'renewed', 'NOC-2024-4192'
  ]);
  // Cycle 3: 2025-04-01 to 2026-03-31 (Active, due soon within lead days)
  const inst1_3 = uuid();
  const validFrom3 = formatDate(addDays(now, -340));
  const validTo3 = formatDate(addDays(now, 25)); // Expires in 25 days -> Amber traffic light!
  run('INSERT INTO instances (id, obligation_id, cycle_no, valid_from, valid_to, status, certificate_no) VALUES (?, ?, ?, ?, ?, ?, ?)', [
    inst1_3, ob1Id, 3, validFrom3, validTo3, 'active', 'NOC-2025-9941'
  ]);

  // Generate Reminders for inst1_3
  run('INSERT INTO reminders (id, instance_id, tier, due_date, status, sent_at) VALUES (?, ?, ?, ?, ?, ?)', [
    uuid(), inst1_3, 't30', formatDate(addDays(now, -5)), 'sent', new Date().toISOString()
  ]);
  run('INSERT INTO reminders (id, instance_id, tier, due_date, status, sent_at) VALUES (?, ?, ?, ?, ?, ?)', [
    uuid(), inst1_3, 't7', formatDate(addDays(now, 18)), 'pending', null
  ]);
  run('INSERT INTO reminders (id, instance_id, tier, due_date, status, sent_at) VALUES (?, ?, ?, ?, ?, ?)', [
    uuid(), inst1_3, 't0', validTo3, 'pending', null
  ]);

  // Obligation 2: State Pollution Control Board Consent (Lapse 1: Gap in 2024)
  const ob2Id = uuid();
  run('INSERT INTO obligations (id, org_id, title, category, authority, frequency, lead_days, owner_user_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)', [
    ob2Id,
    orgApexId,
    'Bio-Medical Waste Authorization (Consent to Operate)',
    'Environmental',
    'State Pollution Control Board',
    'yearly',
    45,
    managerApexId
  ]);
  // Cycle 1: 2023-01-01 to 2023-12-31 (Expired on 2023-12-31)
  const inst2_1 = uuid();
  run('INSERT INTO instances (id, obligation_id, cycle_no, valid_from, valid_to, status, certificate_no) VALUES (?, ?, ?, ?, ?, ?, ?)', [
    inst2_1, ob2Id, 1, '2023-01-01', '2023-12-31', 'renewed', 'PCB-BMW-2023-01'
  ]);
  // Cycle 2: Renewed late on 2024-03-20! (Lapse/Gap from 2024-01-01 to 2024-03-19 = 78 days non-compliant!)
  const inst2_2 = uuid();
  run('INSERT INTO instances (id, obligation_id, cycle_no, valid_from, valid_to, status, certificate_no) VALUES (?, ?, ?, ?, ?, ?, ?)', [
    inst2_2, ob2Id, 2, '2024-03-20', '2025-03-19', 'renewed', 'PCB-BMW-2024-44'
  ]);
  // Cycle 3: Active and Healthy (Green traffic light)
  const inst2_3 = uuid();
  const validToPcb = formatDate(addDays(now, 120));
  run('INSERT INTO instances (id, obligation_id, cycle_no, valid_from, valid_to, status, certificate_no) VALUES (?, ?, ?, ?, ?, ?, ?)', [
    inst2_3, ob2Id, 3, '2025-03-20', validToPcb, 'active', 'PCB-BMW-2025-99'
  ]);
  run('INSERT INTO reminders (id, instance_id, tier, due_date, status, sent_at) VALUES (?, ?, ?, ?, ?, ?)', [
    uuid(), inst2_3, 't30', formatDate(addDays(now, 75)), 'pending', null
  ]);
  run('INSERT INTO reminders (id, instance_id, tier, due_date, status, sent_at) VALUES (?, ?, ?, ?, ?, ?)', [
    uuid(), inst2_3, 't7', formatDate(addDays(now, 113)), 'pending', null
  ]);
  run('INSERT INTO reminders (id, instance_id, tier, due_date, status, sent_at) VALUES (?, ?, ?, ?, ?, ?)', [
    uuid(), inst2_3, 't0', validToPcb, 'pending', null
  ]);

  // Obligation 3: Pharmacy Wholesale & Retail Drug Licence (Lapse 2: Current Expired! Red status)
  const ob3Id = uuid();
  run('INSERT INTO obligations (id, org_id, title, category, authority, frequency, lead_days, owner_user_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)', [
    ob3Id,
    orgApexId,
    'Central Pharmacy Drug Licence Form 20-B & 21-B',
    'Healthcare Licensing',
    'Drugs Control Department',
    'yearly',
    30,
    managerApexId
  ]);
  const inst3_1 = uuid();
  run('INSERT INTO instances (id, obligation_id, cycle_no, valid_from, valid_to, status, certificate_no) VALUES (?, ?, ?, ?, ?, ?, ?)', [
    inst3_1, ob3Id, 1, '2024-01-01', formatDate(addDays(now, -12)), 'expired', 'DL-FORM20-2024'
  ]);
  // Reminders for expired instance: all marked sent or pending
  run('INSERT INTO reminders (id, instance_id, tier, due_date, status, sent_at) VALUES (?, ?, ?, ?, ?, ?)', [
    uuid(), inst3_1, 't30', formatDate(addDays(now, -42)), 'sent', new Date().toISOString()
  ]);
  run('INSERT INTO reminders (id, instance_id, tier, due_date, status, sent_at) VALUES (?, ?, ?, ?, ?, ?)', [
    uuid(), inst3_1, 't7', formatDate(addDays(now, -19)), 'sent', new Date().toISOString()
  ]);
  run('INSERT INTO reminders (id, instance_id, tier, due_date, status, sent_at) VALUES (?, ?, ?, ?, ?, ?)', [
    uuid(), inst3_1, 't0', formatDate(addDays(now, -12)), 'pending', null
  ]);

  // Obligation 4: Biomedical Equipment Calibration (Quarterly - Active Green)
  const ob4Id = uuid();
  run('INSERT INTO obligations (id, org_id, title, category, authority, frequency, lead_days, owner_user_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)', [
    ob4Id,
    orgApexId,
    'ICU Ventilators & Defibrillators Calibration',
    'Quality & Equipment',
    'NABL Biomedical Calibration Lab',
    'quarterly',
    15,
    ownerApexId
  ]);
  const inst4_1 = uuid();
  const validToBme = formatDate(addDays(now, 45));
  run('INSERT INTO instances (id, obligation_id, cycle_no, valid_from, valid_to, status, certificate_no) VALUES (?, ?, ?, ?, ?, ?, ?)', [
    inst4_1, ob4Id, 1, formatDate(addDays(now, -45)), validToBme, 'active', 'NABL-CALIB-Q3-2026'
  ]);
  run('INSERT INTO reminders (id, instance_id, tier, due_date, status, sent_at) VALUES (?, ?, ?, ?, ?, ?)', [
    uuid(), inst4_1, 't30', formatDate(addDays(now, 15)), 'pending', null
  ]);
  run('INSERT INTO reminders (id, instance_id, tier, due_date, status, sent_at) VALUES (?, ?, ?, ?, ?, ?)', [
    uuid(), inst4_1, 't7', formatDate(addDays(now, 38)), 'pending', null
  ]);
  run('INSERT INTO reminders (id, instance_id, tier, due_date, status, sent_at) VALUES (?, ?, ?, ?, ?, ?)', [
    uuid(), inst4_1, 't0', validToBme, 'pending', null
  ]);

  // Sample Documents
  run('INSERT INTO documents (id, instance_id, file_key, file_name, uploaded_by) VALUES (?, ?, ?, ?, ?)', [
    uuid(), inst1_3, 'uploads/noc_fire_2025_cert.pdf', 'Fire_Safety_NOC_2025_2026.pdf', adminApexId
  ]);
  run('INSERT INTO documents (id, instance_id, file_key, file_name, uploaded_by) VALUES (?, ?, ?, ?, ?)', [
    uuid(), inst2_3, 'uploads/pcb_consent_2025.pdf', 'PCB_BioMedical_Consent_2025_2028.pdf', managerApexId
  ]);

  // Obligation for Meridian (Org B)
  const obMeridian1 = uuid();
  run('INSERT INTO obligations (id, org_id, title, category, authority, frequency, lead_days, owner_user_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)', [
    obMeridian1,
    orgMeridianId,
    'Heavy Industrial Boiler License Class 1',
    'Industrial Safety',
    'State Boiler Directorate',
    'yearly',
    30,
    adminMeridianId
  ]);
  const instMeridian1 = uuid();
  run('INSERT INTO instances (id, obligation_id, cycle_no, valid_from, valid_to, status, certificate_no) VALUES (?, ?, ?, ?, ?, ?, ?)', [
    instMeridian1, obMeridian1, 1, '2025-01-01', '2025-12-31', 'active', 'BLR-MER-2025-09'
  ]);

  console.log('Seeding completed successfully!');
  console.log('Credentials for testing:');
  console.log('  Apex Admin:    admin@apexhealth.org    / Password123!');
  console.log('  Apex Manager:  manager@apexhealth.org  / Password123!');
  console.log('  Apex Owner:    facility@apexhealth.org / Password123!');
  console.log('  Meridian Admin:admin@meridianmfg.com   / Password123!');
}

seed();
