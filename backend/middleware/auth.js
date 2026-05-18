const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token;
  if (req.headers.authorization && 
      req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.userId).select('-password');
      
      // ✅ Add this debug line temporarily:
      console.log('req.user role:', req.user?.role);
      
      next();
    } catch (err) {
      return res.status(401).json({ error: 'Token invalid or expired' });
    }
  }
  if (!token) {
    return res.status(401).json({ error: 'No token' });
  }
};

const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ error: 'Admin access required' });
  }
};

module.exports = { protect, adminOnly };