const mongoose = require('mongoose');
const crypto = require('crypto');

const apiKeySchema = new mongoose.Schema({
  name: { type: String, required: true },
  key: { type: String, required: true, unique: true },
  clientId: { type: String, required: true, unique: true },
  permissions: [{
    type: String,
    enum: ['read:profile', 'read:featured', 'write:bid']
  }],
  lastUsed: Date,
  usageStats: [{
    endpoint: String,
    timestamp: Date,
    ip: String
  }],
  isActive: { type: Boolean, default: true },
  expiresAt: Date,
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

// Generate API key
apiKeySchema.statics.generateApiKey = function() {
  return {
    key: crypto.randomBytes(32).toString('hex'),
    clientId: crypto.randomBytes(16).toString('hex')
  };
};

// Log usage
apiKeySchema.methods.logUsage = async function(endpoint, ip) {
  this.lastUsed = new Date();
  this.usageStats.push({ endpoint, timestamp: new Date(), ip });
  if (this.usageStats.length > 1000) this.usageStats = this.usageStats.slice(-1000);
  await this.save();
};

module.exports = mongoose.model('ApiKey', apiKeySchema);