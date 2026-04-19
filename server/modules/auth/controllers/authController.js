const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

// Generate JWT Token
const generateToken = (userId) => {
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '1d' }
  );
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res) => {
  try {
    const { identifier, password } = req.body;

    // Validate input
    if (!identifier || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email/name and password'
      });
    }

    // Find user by email or name
    const user = await User.findOne({
      $or: [
        { email: identifier.toLowerCase() },
        { name: identifier }
      ]
    }).select('+password');

    // Check if user exists
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Your account has been deactivated. Please contact admin.'
      });
    }

    // Check if user is blocked
    if (user.isBlocked) {
      return res.status(403).json({
        success: false,
        message: 'Your account has been blocked. Please contact admin.'
      });
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Generate token
    const token = generateToken(user._id);

    // Return user data and token
    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          permissions: user.role === 'admin' 
            ? {
                canView: true,
                canRead: true,
                canWrite: true,
                canUpdate: true,
                canDelete: true,
                canDownload: true
              }
            : user.permissions
        }
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during login',
      error: error.message
    });
  }
};

// @desc    Create new user (Admin only)
// @route   POST /api/auth/create-user
// @access  Private (Admin)
const createUser = async (req, res) => {
  try {
    const { name, email, password, role, permissions } = req.body;

    // Validate input
    if (!name || !email || !password || !role) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, email, password, and role'
      });
    }

    // Validate role
    if (!['admin', 'employee'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Role must be either admin or employee'
      });
    }

    // Validate password strength
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long'
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists'
      });
    }

    // For employees, validate permissions
    if (role === 'employee' && !permissions) {
      return res.status(400).json({
        success: false,
        message: 'Permissions are required for employee role'
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const userData = {
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      role,
      createdBy: req.user.userId, // From auth middleware
      isActive: true
    };

    // Add permissions for employees
    if (role === 'employee') {
      userData.permissions = {
        canView: permissions.canView || false,
        canRead: permissions.canRead || false,
        canWrite: permissions.canWrite || false,
        canUpdate: permissions.canUpdate || false,
        canDelete: permissions.canDelete || false,
        canDownload: permissions.canDownload || false
      };
    }

    const user = await User.create(userData);

    // Return created user (password excluded)
    res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          permissions: user.role === 'admin'
            ? {
                canView: true,
                canRead: true,
                canWrite: true,
                canUpdate: true,
                canDelete: true,
                canDownload: true
              }
            : user.permissions,
          isActive: user.isActive,
          createdAt: user.createdAt
        }
      }
    });
  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating user',
      error: error.message
    });
  }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          permissions: user.role === 'admin'
            ? {
                canView: true,
                canRead: true,
                canWrite: true,
                canUpdate: true,
                canDelete: true,
                canDownload: true
              }
            : user.permissions
        }
      }
    });
  } catch (error) {
    console.error('Get me error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get all users (Admin only)
// @route   GET /api/auth/users
// @access  Private (Admin)
const getAllUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Get total count
    const total = await User.countDocuments();
    
    // Get paginated users
    const users = await User.find()
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      success: true,
      data: { 
        users,
        pagination: {
          totalItems: total,
          totalPages: Math.ceil(total / limit),
          currentPage: page,
          limit: limit,
          hasNextPage: page * limit < total,
          hasPrevPage: page > 1
        }
      }
    });
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching users',
      error: error.message
    });
  }
};

// @desc    Update user (Admin only)
// @route   PUT /api/auth/users/:id
// @access  Private (Admin)
const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, password, role, permissions } = req.body;

    // Prevent admin from updating themselves
    if (id === req.user.userId) {
      return res.status(400).json({
        success: false,
        message: 'You cannot update your own account'
      });
    }

    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Update fields
    if (name) user.name = name;
    if (email) user.email = email.toLowerCase();
    if (role) {
      if (!['admin', 'employee'].includes(role)) {
        return res.status(400).json({
          success: false,
          message: 'Role must be either admin or employee'
        });
      }
      user.role = role;
    }

    // Hash password if provided
    if (password) {
      if (password.length < 6) {
        return res.status(400).json({
          success: false,
          message: 'Password must be at least 6 characters long'
        });
      }
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
    }

    // Update permissions for employees
    if (role === 'employee' && permissions) {
      user.permissions = {
        canView: permissions.canView || false,
        canRead: permissions.canRead || false,
        canWrite: permissions.canWrite || false,
        canUpdate: permissions.canUpdate || false,
        canDelete: permissions.canDelete || false,
        canDownload: permissions.canDownload || false
      };
    }

    // If role changed to admin, give full permissions
    if (role === 'admin') {
      user.permissions = {
        canView: true,
        canRead: true,
        canWrite: true,
        canUpdate: true,
        canDelete: true,
        canDownload: true
      };
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: 'User updated successfully',
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          permissions: user.role === 'admin'
            ? {
                canView: true,
                canRead: true,
                canWrite: true,
                canUpdate: true,
                canDelete: true,
                canDownload: true
              }
            : user.permissions,
          isActive: user.isActive,
          isBlocked: user.isBlocked
        }
      }
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating user',
      error: error.message
    });
  }
};

// @desc    Block/Unblock user (Admin only)
// @route   PUT /api/auth/users/:id/toggle-block
// @access  Private (Admin)
const toggleUserBlock = async (req, res) => {
  try {
    const { id } = req.params;

    // Prevent admin from blocking themselves
    if (id === req.user.userId) {
      return res.status(400).json({
        success: false,
        message: 'You cannot block yourself'
      });
    }

    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Toggle the isBlocked status
    user.isBlocked = !user.isBlocked;
    await user.save();

    res.status(200).json({
      success: true,
      message: `User ${user.isBlocked ? 'blocked' : 'unblocked'} successfully`,
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          isBlocked: user.isBlocked
        }
      }
    });
  } catch (error) {
    console.error('Toggle user block error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while toggling user block status',
      error: error.message
    });
  }
};

// @desc    Delete user (Admin only)
// @route   DELETE /api/auth/users/:id
// @access  Private (Admin)
const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    // Prevent admin from deleting themselves
    if (id === req.user.userId) {
      return res.status(400).json({
        success: false,
        message: 'You cannot delete yourself'
      });
    }

    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    await User.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting user',
      error: error.message
    });
  }
};

module.exports = {
  login,
  createUser,
  getMe,
  getAllUsers,
  updateUser,
  toggleUserBlock,
  deleteUser
};
