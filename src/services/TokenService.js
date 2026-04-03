const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const Token = require('../models/Token');

class TokenService {
  generateAuthToken(userId) {
    return jwt.sign(
      { userId },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
  }

  async generateVerificationToken(userId) {
    const token = crypto.randomBytes(32).toString('hex');
    
    await Token.create({
      user: userId,
      token,
      type: 'verification',
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
    });

    return token;
  }

  async generatePasswordResetToken(userId) {
    const token = crypto.randomBytes(32).toString('hex');
    
    await Token.create({
      user: userId,
      token,
      type: 'password-reset',
      expiresAt: new Date(Date.now() + 60 * 60 * 1000)
    });

    return token;
  }

  async verifyToken(token, type) {
    const tokenRecord = await Token.findOne({
      token,
      type,
      used: false,
      expiresAt: { $gt: new Date() }
    });

    if (!tokenRecord) return null;

    tokenRecord.used = true;
    await tokenRecord.save();

    return tokenRecord.user;
  }
}

module.exports = new TokenService();