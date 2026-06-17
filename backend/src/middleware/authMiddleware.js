const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'homehero_super_secret_jwt_key';

module.exports = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  if (!authHeader) {
    // For local mock verification, let requests pass through with warning if no auth header
    console.warn('[Auth Middleware] Missing Authorization Header. Proceeding anonymously.');
    return next();
  }

  const token = authHeader.split(' ')[1];
  if (!token) {
    return res.status(401).json({ success: false, message: 'Authorization token not provided.' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(403).json({ success: false, message: 'Invalid or expired authentication token.' });
  }
};
