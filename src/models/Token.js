const mongoose = require('mongoose');
const crypto = require('crypto');

const tokenModel = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  token: { type: String, required: true, unique: true },
  type: {
    type: String,
    enum: ['verification', 'password-reset', 'api-key'],
    required: true
  },
  expiresAt: { type: Date, required: true },
  used: { type: Boolean, default: false }
}, { timestamps: true });

// Auto-expire after 24 hours
tokenModel.index({ createdAt: 1 }, { expireAfterSeconds: 86400 });

// Generate secure token
tokenModel.statics.generateSecureToken = function() {
  return crypto.randomBytes(32).toString('hex');
};

module.exports = mongoose.model('Token', tokenModel);