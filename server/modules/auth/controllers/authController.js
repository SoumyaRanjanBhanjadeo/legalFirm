const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const sendEmail = require('../utils/sendEmail');

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

// @desc    Forgot Password
// @route   POST /api/auth/forgot-password
// @access  Public
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: 'Please provide email' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(404).json({ success: false, message: 'No user found with this email' });
    }

    // Generate 6 digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Hash OTP before saving
    const salt = await bcrypt.genSalt(10);
    user.resetPasswordOtp = await bcrypt.hash(otp, salt);
    // OTP expires in 10 minutes
    user.resetPasswordExpires = Date.now() + 10 * 60 * 1000;
    user.passwordResetVerified = false;

    await user.save();

    // Send email
    const message = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
        <h2 style="color: #333;">Password Reset Request</h2>
        <p>You requested a password reset for your LegalFirm account. Please use the following 6-digit OTP to complete the process:</p>
        <div style="text-align: center; margin: 20px 0;">
          <span style="background: #f4f4f4; padding: 15px 25px; display: inline-block; font-size: 24px; font-weight: bold; letter-spacing: 5px; border-radius: 4px; color: #d4af37;">${otp}</span>
        </div>
        <p style="color: #666; font-size: 14px;">This OTP is valid for 10 minutes. If you did not request this, please ignore this email.</p>
        <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;" />
        <p style="color: #999; font-size: 12px; text-align: center;">&copy; ${new Date().getFullYear()} LegalFirm. All rights reserved.</p>
      </div>
    `;

    try {
      await sendEmail({
        email: user.email,
        subject: 'Password Reset OTP - LegalFirm',
        html: message
      });

      res.status(200).json({ success: true, message: 'OTP sent to email' });
    } catch (err) {
      user.resetPasswordOtp = undefined;
      user.resetPasswordExpires = undefined;
      await user.save({ validateBeforeSave: false });

      console.error('Email send error:', err);
      return res.status(500).json({ success: false, message: 'Email could not be sent' });
    }
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// @desc    Verify OTP
// @route   POST /api/auth/verify-otp
// @access  Public
const verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) {
      return res.status(400).json({ success: false, message: 'Please provide email and OTP' });
    }

    const user = await User.findOne({
      email: email.toLowerCase(),
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user || !user.resetPasswordOtp) {
      return res.status(400).json({ success: false, message: 'Invalid or expired OTP' });
    }

    // Check OTP
    const isOTPValid = await bcrypt.compare(otp, user.resetPasswordOtp);
    if (!isOTPValid) {
      return res.status(400).json({ success: false, message: 'Invalid or expired OTP' });
    }

    user.passwordResetVerified = true;
    await user.save();

    res.status(200).json({ success: true, message: 'OTP verified successfully' });
  } catch (error) {
    console.error('Verify OTP error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// @desc    Reset Password
// @route   POST /api/auth/reset-password
// @access  Public
const resetPassword = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and new password' });
    }

    if (password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters long' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user || !user.passwordResetVerified) {
      return res.status(400).json({ success: false, message: 'User not verified for password reset' });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);

    // Clear reset fields
    user.resetPasswordOtp = undefined;
    user.resetPasswordExpires = undefined;
    user.passwordResetVerified = undefined;

    await user.save();

    res.status(200).json({ success: true, message: 'Password reset successful' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// @desc    Update password for logged in user
// @route   PUT /api/auth/update-password
// @access  Private
const updateMyPassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Please provide current and new password'
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 6 characters long'
      });
    }

    const user = await User.findById(req.user.userId).select('+password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Incorrect current password'
      });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password updated successfully'
    });
  } catch (error) {
    console.error('Update password error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating password',
      error: error.message
    });
  }
};

// @desc    Update notification settings for logged in user
// @route   PUT /api/v1/auth/settings/notifications
// @access  Private
const updateNotificationSettings = async (req, res) => {
  try {
    const { appNotifications, emailNotifications } = req.body;

    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (typeof appNotifications === 'boolean') {
      user.notificationSettings.appNotifications = appNotifications;
    }
    if (typeof emailNotifications === 'boolean') {
      user.notificationSettings.emailNotifications = emailNotifications;
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Notification settings updated.',
      data: { notificationSettings: user.notificationSettings }
    });
  } catch (error) {
    console.error('Update notification settings error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// @desc    Get notification settings for logged in user
// @route   GET /api/v1/auth/settings/notifications
// @access  Private
const getNotificationSettings = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    res.status(200).json({
      success: true,
      data: { notificationSettings: user.notificationSettings }
    });
  } catch (error) {
    console.error('Get notification settings error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

module.exports = {
  login,
  createUser,
  getMe,
  getAllUsers,
  updateUser,
  toggleUserBlock,
  deleteUser,
  forgotPassword,
  verifyOTP,
  resetPassword,
  updateMyPassword,
  updateNotificationSettings,
  getNotificationSettings
};
