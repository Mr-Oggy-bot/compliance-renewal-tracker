const database = require('./database');

(async () => {
  try {
    await database.initialize();
    console.log('Database schema initialized successfully.');
  } finally {
    await database.close?.();
  }
})().catch(error => { console.error(error.message); process.exitCode = 1; });
