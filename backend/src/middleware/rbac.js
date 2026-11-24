function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        error: `Forbidden: role '${req.user ? req.user.role : 'anonymous'}' lacks required permissions`
      });
    }
    next;
    next();
  };
}

module.exports = {
  requireRole
};
