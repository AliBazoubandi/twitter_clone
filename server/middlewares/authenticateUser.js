const jwt = require("jsonwebtoken");
const secretKey = process.env.SECRET_KEY || "fallback_secret_key";

function authenticateUser(req, res, next) {
  const token = req.header("Authorization") || req.cookies.token;

  if (!token) {
    return res.status(401).json({ error: "Unauthorized - Missing token" });
  }

  try {
    const decoded = jwt.verify(token, secretKey);

    req.user = decoded.user;
    next();
  } catch (error) {
    console.error(error);
    res.status(401).json({ error: "Unauthorized - Invalid token" });
  }
}

module.exports = authenticateUser;
