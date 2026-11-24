// Ensures organization isolation on every database query
function tenantScope(req, res, next) {
  if (!req.user || !req.user.org_id) {
    return res.status(403).json({ error: 'Tenant context missing: access denied' });
  }
  req.org_id = req.user.org_id;
  next();
}

module.exports = tenantScope;
