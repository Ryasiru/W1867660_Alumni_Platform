const rateLimit = require('express-rate-limit');

const bidLimiter = rateLimit({
  windowMs: 24 * 60 * 60 * 1000,
  max: 10,
  message: 'Daily bid limit reached'
});

module.exports = { bidLimiter };