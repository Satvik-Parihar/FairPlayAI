const jwt = require('jsonwebtoken');

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
      throw new Error('Authentication required');
    }

    // Verify with Django's secret key (must match)
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Minimal user verification - you might want to check with Django API
    req.user = { 
      id: decoded.user_id,
      token 
    };
    
    next();
  } catch (err) {
    res.status(401).json({ error: 'Please authenticate' });
  }
};

module.exports = auth;