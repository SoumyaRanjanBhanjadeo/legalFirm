const mongoose = require('mongoose');

// Permission schema
const permissionSchema = new mongoose.Schema({
  canView: { type: Boolean, default: false },
  canRead: { type: Boolean, default: false },
  canWrite: { type: Boolean, default: false },
  canUpdate: { type: Boolean, default: false },
  canDelete: { type: Boolean, default: false },
  canDownload: { type: Boolean, default: false }
}, { _id: false });

// User schema
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: 6,
    select: false // Don't return password in queries by default
  },
  role: {
    type: String,
    enum: ['admin', 'employee'],
    required: [true, 'Role is required']
  },
  permissions: {
    type: permissionSchema,
    default: () => ({
      canView: false,
      canRead: false,
      canWrite: false,
      canUpdate: false,
      canDelete: false,
      canDownload: false
    })
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isBlocked: {
    type: Boolean,
    default: false
  },
  resetPasswordOtp: {
    type: String
  },
  resetPasswordExpires: {
    type: Date
  },
  passwordResetVerified: {
    type: Boolean,
    default: false
  },
  notificationSettings: {
    appNotifications: { type: Boolean, default: true },
    emailNotifications: { type: Boolean, default: true }
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Method to find user by email or name
userSchema.statics.findByEmailOrName = function(identifier) {
  return this.findOne({
    $or: [
      { email: identifier.toLowerCase() },
      { name: identifier }
    ]
  });
};

// Method to check if user has specific permission
userSchema.methods.hasPermission = function(permission) {
  // Admin has all permissions by default
  if (this.role === 'admin') {
    return true;
  }
  // Check specific permission for employees
  return this.permissions[permission] === true;
};

// Method to get user without sensitive data
userSchema.methods.toJSON = function() {
  const user = this.toObject();
  delete user.password;
  return user;
};

const User = mongoose.model('User', userSchema);

module.exports = User;
