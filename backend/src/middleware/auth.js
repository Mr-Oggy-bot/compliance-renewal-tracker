const jwt = require('jsonwebtoken');
const config = require('../config/index.js');
const { get } = require('../db/database');

async function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authentication required: missing Bearer token' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const payload = jwt.verify(token, config.JWT_SECRET);
    // Fetch latest user info from DB
    const user = await get('SELECT id, org_id, name, email, role FROM users WHERE id = ?', [payload.id]);
    if (!user) {
      return res.status(401).json({ error: 'User no longer exists' });
    }
    req.user = user;
    req.org_id = user.org_id;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired' });
    }
    return res.status(401).json({ error: 'Invalid authentication token' });
  }
}

function generateTokens(user) {
  const payload = { id: user.id, email: user.email, role: user.role, org_id: user.org_id };
  const accessToken = jwt.sign(payload, config.JWT_SECRET, { expiresIn: config.JWT_EXPIRES_IN });
  const refreshToken = jwt.sign({ id: user.id }, config.REFRESH_SECRET, { expiresIn: config.REFRESH_EXPIRES_IN });
  return { accessToken, refreshToken };
}

module.exports = {
  authenticate,
  generateTokens
};
