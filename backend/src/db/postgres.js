const { Pool } = require('pg');
const { AsyncLocalStorage } = require('node:async_hooks');
const fs = require('node:fs');
const path = require('node:path');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || process.env.POSTGRES_URL,
  max: 3,
  idleTimeoutMillis: 10000,
  connectionTimeoutMillis: 15000,
  allowExitOnIdle: true
});
const context = new AsyncLocalStorage();
let initialization;

function initialize() {
  if (!initialization) {
    initialization = (async () => {
      const client = await pool.connect();
      try {
        await client.query('BEGIN');
        // Serialize schema creation and first-time demo setup across cold starts.
        await client.query('SELECT pg_advisory_xact_lock(5032026)');
        await client.query(fs.readFileSync(path.join(__dirname, 'postgres-schema.sql'), 'utf8'));
        if (process.env.SEED_DEMO_DATA === 'true') {
          const result = await client.query('SELECT COUNT(*) AS count FROM organisations');
          if (Number(result.rows[0].count) === 0) {
            await context.run(client, () => require('./seed').seed({ reset: false }));
          }
        }
        await client.query('COMMIT');
      } catch (error) {
        await client.query('ROLLBACK');
        throw error;
      } finally {
        client.release();
      }
    })().catch(error => { initialization = undefined; throw error; });
  }
  return initialization;
}

async function execute(sql, params = []) {
  const client = context.getStore();
  if (!client) await initialize();
  let index = 0;
  const statement = sql.replace(/\?/g, () => `$${++index}`);
  return (client || pool).query(statement, params);
}

module.exports = {
  initialize,
  query: async (sql, params) => (await execute(sql, params)).rows,
  get: async (sql, params) => (await execute(sql, params)).rows[0],
  run: async (sql, params) => ({ changes: (await execute(sql, params)).rowCount }),
  exec: execute,
  db: { exec: execute },
  close: () => pool.end()
};
