const jwt = require('jsonwebtoken');
const User = require('../models/User');

const authMiddleware = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) throw new Error();

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findOne({ 
      _id: decoded.userId,
      isVerified: true 
    });

    if (!user || user.isLocked()) throw new Error();

    req.user = user;
    req.token = token;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Please authenticate the user.' });
  }
};

const isAlumni = (req, res, next) => {
  if (req.user.role !== 'alumni') {
    return res.status(403).json({ error: 'Access denied. Alumni only.' });
  }
  next();
};

const isAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Access denied. Admin only.' });
  }
  next();
};

module.exports = { authMiddleware, isAlumni, isAdmin };