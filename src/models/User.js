const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userModel = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    validate: {
      validator: function (v) {
        return v.endsWith('.ac.lk') || v.endsWith('gmail.com');
      },
      message: 'Must use university email domain to proceed.'
    }
  },
  password: {
    type: String,
    required: true,
    minlength: 8
  },
  firstName: {
    type: String,
    required: true,
    trim: true
  },
  lastName: {
    type: String,
    required: true,
    trim: true
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  verificationToken: String,
  verificationTokenExpiry: Date,
  resetPasswordToken: String,
  resetPasswordExpiry: Date,
  loginAttempts: {
    type: Number,
    default: 0
  },
  lockUntil: Date,
  role: {
    type: String,
    enum: ['alumni', 'admin'],
    default: 'alumni'
  },
  lastLogin: Date
}, {
  timestamps: true
});

// Hash password before saving
userModel.pre('save', async function () {
  if (!this.isModified('password')) return;

  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
});

// Compare password method
userModel.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Check if account is locked
userModel.methods.isLocked = function () {
  return !!(this.lockUntil && this.lockUntil > Date.now());
};

module.exports = mongoose.model('User', userModel);