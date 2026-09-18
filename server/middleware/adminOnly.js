const crypto = require("crypto");

const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || "")
  .split(",")
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean);

const isAdmin = (user) =>
  Boolean(user?.email) && ADMIN_EMAILS.includes(user.email.toLowerCase());

const isAdminEmail = (email) =>
  Boolean(email) && ADMIN_EMAILS.includes(email.toLowerCase());

const hasValidAdminBootstrapSecret = (value) => {
  const expected = String(process.env.ADMIN_BOOTSTRAP_SECRET || "");
  const supplied = String(value || "");
  if (!expected || expected.length !== supplied.length) return false;
  return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(supplied));
};

const adminOnly = (req, res, next) => {
  if (!isAdmin(req.user)) {
    return res.status(403).json({ message: "Admin access required" });
  }
  next();
};

module.exports = adminOnly;
module.exports.isAdmin = isAdmin;
module.exports.isAdminEmail = isAdminEmail;
module.exports.hasValidAdminBootstrapSecret = hasValidAdminBootstrapSecret;
module.exports.ADMIN_EMAILS = ADMIN_EMAILS;
