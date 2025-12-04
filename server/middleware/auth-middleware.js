const jwt = require("jsonwebtoken");

const verifyToken = (token, secretKey) => {
  if (!secretKey) {
    throw new Error("JWT_SECRET is not configured");
  }
  return jwt.verify(token, secretKey);
};

const authenticate = (req, res, next) => {
  // Try to get token from Authorization header first
  let token = null;
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith("Bearer ")) {
    token = authHeader.split(" ")[1];
  }

  // If no token in header, try to get it from cookie
  if (!token && req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "User is not authenticated",
    });
  }

  try {
    const payload = verifyToken(token, process.env.JWT_SECRET);
    req.user = payload;
    next();
  } catch (e) {
    return res.status(401).json({
      success: false,
      message: "invalid token",
    });
  }
};

module.exports = authenticate;
