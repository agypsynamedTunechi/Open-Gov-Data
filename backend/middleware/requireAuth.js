// middleware/requireAuth.js
// Blocks access to admin-only routes unless a valid session exists.

function requireAuth(req, res, next) {
  if (req.session && req.session.adminId) {
    return next();
  }
  return res.status(401).json({ error: "Not authenticated" });
}

module.exports = requireAuth;
