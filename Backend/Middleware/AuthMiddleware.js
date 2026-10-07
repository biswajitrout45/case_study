const jwt = require("jsonwebtoken");
const crypto = require("node:crypto");

const JWT_SECRET = process.env.JWT_SECRET
  || (process.env.NODE_ENV === "production" ? "" : crypto.randomBytes(32).toString("hex"));

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET must be configured in production");
}

const authenticate = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || "";
    const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;

    if (!token) {
      return res.status(401).json({ success: false, message: "Authentication token missing" });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: "Invalid or expired token" });
  }
};

module.exports = { authenticate, JWT_SECRET };
