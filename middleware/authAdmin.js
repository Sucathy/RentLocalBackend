const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_ADMIN_SECRET;

// ✅ Middleware to verify token from Authorization header
const verifyAdminToken = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || ""; // Expect: "Bearer TOKEN"
    const token = authHeader.split(" ")[1];

    if (!token) return res.status(401).json({ message: "No token provided" });

    const decoded = jwt.verify(token, JWT_SECRET);

    if (decoded.role !== "admin")
      return res.status(403).json({ message: "Access denied" });

    req.user = decoded; // { id, role }
    next();
  } catch (err) {
    console.error("verifyAdminToken error:", err);
    res.status(403).json({ message: "Invalid or expired token" });
  }
};

module.exports = verifyAdminToken;
