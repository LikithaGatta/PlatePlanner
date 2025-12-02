const jwt = require("jsonwebtoken");

// middleware to check if user is logged in
module.exports = (req, res, next) => {
  const authHeader = req.headers.authorization;

  // make sure they sent a token
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "No token provided" });
  }

  // grab just the token part (remove "Bearer ")
  const token = authHeader.split(" ")[1];

  try {
    // check if token is valid
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // attach user id to request so we can use it later
    req.userId = decoded.userId;

    // let them through
    next();
  } catch (err) {
    console.error("Auth error:", err);
    return res.status(401).json({ error: "Invalid token" });
  }
};
