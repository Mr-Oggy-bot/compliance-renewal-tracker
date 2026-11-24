const { runReminderWorkerBatch } = require('./reminderService');

console.log('[ReminderWorker Daemon] Background worker started...');
console.log('[ReminderWorker Daemon] Polling interval: every 60 seconds (or on-demand via REST endpoint)');

let isRunning = false;

async function tick() {
  if (isRunning) return;
  isRunning = true;
  try {
    await runReminderWorkerBatch({ logger: console.log });
  } catch (err) {
    console.error('[ReminderWorker Daemon] Error during cycle:', err.message);
  } finally {
    isRunning = false;
  }
}

// Run immediately on boot
tick();

// Schedule every minute
const interval = setInterval(tick, 60000);

process.on('SIGTERM', () => {
  console.log('[ReminderWorker Daemon] Gracefully shutting down worker...');
  clearInterval(interval);
  process.exit(0);
});
process.on('SIGINT', () => {
  console.log('[ReminderWorker Daemon] Worker interrupted, exiting...');
  clearInterval(interval);
  process.exit(0);
});
