const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const config = require('../config');
const { query, get, run } = require('../db/database');
const { generateTokens } = require('../middleware/auth');

function uuid() {
  return crypto.randomUUID();
}

async function register(req, res) {
  try {
    const { name, email, password, org_name, role = 'admin' } = req.body;
    if (!name || !email || !password || !org_name) {
      return res.status(400).json({ error: 'Name, email, password, and organization name are required.' });
    }

    const existingUser = await get('SELECT id FROM users WHERE email = ?', [email.toLowerCase()]);
    if (existingUser) {
      return res.status(409).json({ error: 'Email already registered.' });
    }

    const orgId = uuid();
    await run('INSERT INTO organisations (id, name, timezone) VALUES (?, ?, ?)', [
      orgId,
      org_name,
      'UTC'
    ]);

    const userId = uuid();
    const passwordHash = bcrypt.hashSync(password, 10);
    await run('INSERT INTO users (id, org_id, name, email, password_hash, role) VALUES (?, ?, ?, ?, ?, ?)', [
      userId,
      orgId,
      name,
      email.toLowerCase(),
      passwordHash,
      role
    ]);

    const newUser = await get('SELECT id, org_id, name, email, role FROM users WHERE id = ?', [userId]);
    const tokens = generateTokens(newUser);

    return res.status(201).json({
      message: 'Registration successful',
      user: newUser,
      ...tokens
    });
  } catch (err) {
    console.error('Register error:', err);
    return res.status(500).json({ error: 'Internal server error during registration' });
  }
}

async function login(req, res) {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const user = await get('SELECT * FROM users WHERE email = ?', [email.toLowerCase()]);
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const match = bcrypt.compareSync(password, user.password_hash);
    if (!match) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const org = await get('SELECT id, name, timezone FROM organisations WHERE id = ?', [user.org_id]);
    const tokens = generateTokens(user);

    return res.json({
      message: 'Login successful',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        org_id: user.org_id,
        organization: org
      },
      ...tokens
    });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ error: 'Internal server error during login' });
  }
}

async function me(req, res) {
  const org = await get('SELECT id, name, timezone FROM organisations WHERE id = ?', [req.user.org_id]);
  return res.json({
    user: {
      ...req.user,
      organization: org
    }
  });
}

async function refresh(req, res) {
  const { refreshToken } = req.body;
  if (!refreshToken) {
    return res.status(400).json({ error: 'Refresh token required' });
  }

  try {
    const payload = jwt.verify(refreshToken, config.REFRESH_SECRET);
    const user = await get('SELECT id, org_id, name, email, role FROM users WHERE id = ?', [payload.id]);
    if (!user) {
      return res.status(401).json({ error: 'User invalid' });
    }

    const tokens = generateTokens(user);
    return res.json(tokens);
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired refresh token' });
  }
}

async function getOrgUsers(req, res) {
  const users = await query('SELECT id, name, email, role, created_at FROM users WHERE org_id = ? ORDER BY name ASC', [req.org_id]);
  return res.json({ users });
}

module.exports = {
  register,
  login,
  me,
  refresh,
  getOrgUsers
};
