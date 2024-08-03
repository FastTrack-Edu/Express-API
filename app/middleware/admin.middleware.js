const auth = require("../middleware/auth.middleware");

const admin = (req, res, next) => {
  auth(req, res, () => {
    if (req.user.role !== "admin") {
      console.log(req.user);
      return res.status(403).json({ error: "Access denied, admin role required" });
    }
    next();
  });
};

module.exports = admin;
