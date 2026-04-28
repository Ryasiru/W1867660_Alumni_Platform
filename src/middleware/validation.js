const { body, validationResult } = require('express-validator');
const xss = require('xss');

// Sanitize input
const sanitizeInput = (req, res, next) => {
  if (req.body) {
    Object.keys(req.body).forEach(key => {
      if (typeof req.body[key] === 'string') {
        req.body[key] = xss(req.body[key].trim());
      }
    });
  }
  next();
};

// Registration validation
const validateRegistration = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .custom(value => {
      if (!(value.endsWith('iit.ac.lk'))) {
        throw new Error('Must use university email for registration');
      }
      return true;
    }),
  body('password')
    .isLength({ min: 8 })
    .matches(/^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/)
    .withMessage('Password must contain at least 8 characters, one letter, one number, and one special character'),
  body('firstName').isLength({ min: 2, max: 50 }).matches(/^[a-zA-Z\s-]+$/),
  body('lastName').isLength({ min: 2, max: 50 }).matches(/^[a-zA-Z\s-]+$/)
];

// Profile validation
const validateProfile = [
  body('bio').optional().isLength({ max: 1000 }),
  body('linkedinUrl').optional().isURL().matches(/linkedin\.com\/in\//),
  body('education.*.degreeUrl').isURL()
];

// Check validation results
const checkValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

module.exports = {
  sanitizeInput,
  validateRegistration,
  validateProfile,
  checkValidation
};