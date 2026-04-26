const ADMIN_EMAIL = "admin@lau.edu";

const adminOnly = (req, res, next) => {
  if (req.user?.email !== ADMIN_EMAIL) {
    return res.status(403).json({ message: "Admin access required" });
  }
  next();
};

module.exports = adminOnly;
