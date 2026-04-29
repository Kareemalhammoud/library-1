const DEFAULT_ADMIN_EMAILS = "admin@lau.edu,superadmin@lau.edu";

const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || DEFAULT_ADMIN_EMAILS)
  .split(",")
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean);

const isAdmin = (user) =>
  Boolean(user?.email) && ADMIN_EMAILS.includes(user.email.toLowerCase());

const adminOnly = (req, res, next) => {
  if (!isAdmin(req.user)) {
    return res.status(403).json({ message: "Admin access required" });
  }
  next();
};

module.exports = adminOnly;
module.exports.isAdmin = isAdmin;
module.exports.ADMIN_EMAILS = ADMIN_EMAILS;
