const jwt = require('jsonwebtoken');
const User = require('../models/User');

// @desc    Authenticate user and protect routes
// @usage   Add as middleware before controller
const protect = async (req, res, next) => {
  try {
    let token;

    // Check for token in Authorization header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    // Check if token exists
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to access this route. Please login.'
      });
    }

    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Get user from token
      const user = await User.findById(decoded.userId);

      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'User not found. Token invalid.'
        });
      }

      // Check if user is active
      if (!user.isActive) {
        return res.status(403).json({
          success: false,
          message: 'Your account has been deactivated.'
        });
      }

      // Attach user to request
      req.user = {
        userId: user._id,
        role: user.role,
        permissions: user.permissions
      };

      next();
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: 'Token is invalid or expired'
      });
    }
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during authentication'
    });
  }
};

// @desc    Authorize user based on role
// @usage   Add as middleware after protect middleware
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Please login first'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `User role '${req.user.role}' is not authorized to access this route`
      });
    }

    next();
  };
};

// @desc    Check specific permission
// @usage   Add as middleware after protect middleware
const checkPermission = (permission) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Please login first'
      });
    }

    // Admin has all permissions
    if (req.user.role === 'admin') {
      return next();
    }

    // Check if employee has the specific permission
    if (req.user.permissions && req.user.permissions[permission]) {
      return next();
    }

    return res.status(403).json({
      success: false,
      message: `You do not have permission to ${permission}`
    });
  };
};

module.exports = {
  protect,
  authorize,
  checkPermission
};
