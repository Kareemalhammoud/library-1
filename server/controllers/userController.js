const getCurrentUser = async (req, res) => {
  res.json(req.user);
};

module.exports = {
  getCurrentUser
};