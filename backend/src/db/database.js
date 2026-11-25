// Local development uses SQLite; hosted deployments use a pooled Postgres URL.
require('dotenv').config();

if (process.env.DATABASE_URL || process.env.POSTGRES_URL) {
  module.exports = require('./postgres');
} else if (process.env.VERCEL) {
  const unavailable = async () => {
    const error = new Error('Connect a Neon Postgres database and redeploy to enable the API.');
    error.status = 503;
    throw error;
  };
  module.exports = { initialize: unavailable, query: unavailable, get: unavailable, run: unavailable, exec: unavailable };
} else {
  module.exports = { ...require('./sqlite'), initialize: async () => {} };
}
