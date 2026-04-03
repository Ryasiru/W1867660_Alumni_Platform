const User = require('../models/User');
const Profile = require('../models/Profile');
const tokenService = require('../services/TokenService');
const emailService = require('../services/EmailService');

class AuthController {
  async register(req, res) {
    try {
      const { email, password, firstName, lastName } = req.body;
      console.log(email, password, firstName, lastName);
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ error: 'Email already registered' });
      }


      const user = new User({ email, password, firstName, lastName });
      await user.save();

      const profile = new Profile({ user: user._id });
      await profile.save();

      const verificationToken = await tokenService.generateVerificationToken(user._id);
      await emailService.sendVerificationEmail(email, verificationToken);

      const authToken = tokenService.generateAuthToken(user._id);

      res.status(201).json({
        message: 'Registration successful. Please verify your email.',
        token: authToken,
        user: {
          id: user._id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName
        }
      });
    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({ error: 'Registration failed' });
    }
  }

  async verifyEmail(req, res) {
    try {
      const { token } = req.params;
      const userId = await tokenService.verifyToken(token, 'verification');

      if (!userId) {
        return res.status(400).json({ error: 'Invalid or expired token' });
      }

      await User.findByIdAndUpdate(userId, { isVerified: true });
      res.json({ message: 'Email verified successfully' });
    } catch (error) {
      res.status(500).json({ error: 'Verification failed' });
    }
  }

  async login(req, res) {
    try {
      const { email, password } = req.body;
      const user = await User.findOne({ email });

      if (!user) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      if (user.isLocked()) {
        return res.status(423).json({ error: 'Account locked. Try again later.' });
      }

      const isValid = await user.comparePassword(password);

      if (!isValid) {
        user.loginAttempts += 1;

        if (user.loginAttempts >= 5) {
          user.lockUntil = new Date(Date.now() + 30 * 60 * 1000);
        }

        await user.save();
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      if (!user.isVerified) {
        return res.status(403).json({ error: 'Please verify your email first' });
      }

      user.loginAttempts = 0;
      user.lockUntil = undefined;
      user.lastLogin = new Date();
      await user.save();

      const token = tokenService.generateAuthToken(user._id);

      res.json({
        message: 'Login successful',
        token,
        user: {
          id: user._id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role
        }
      });
    } catch (error) {
      res.status(500).json({ error: 'Login failed' });
    }
  }

  async logout(req, res) {
    try {
      console.log(`User logged out: ${req.user._id} at ${new Date()}`);

      res.json({
        message: 'Logged out successfully',
        timestamp: new Date()
      });
    } catch (error) {
      console.error('Logout error:', error);
      res.status(500).json({ error: 'Logout failed' });
    }
  }

  async requestPasswordReset(req, res) {
    try {
      const { email } = req.body;
      const user = await User.findOne({ email });

      if (!user) {
        return res.json({ message: 'If email exists, reset link will be sent' });
      }

      const resetToken = await tokenService.generatePasswordResetToken(user._id);
      await emailService.sendPasswordResetEmail(email, resetToken);

      res.json({ message: 'If email exists, reset link will be sent' });
    } catch (error) {
      res.status(500).json({ error: 'Failed to process request' });
    }
  }

  async resetPassword(req, res) {
    try {
      const { token } = req.params;
      const { password } = req.body;

      const userId = await tokenService.verifyToken(token, 'password-reset');

      if (!userId) {
        return res.status(400).json({ error: 'Invalid or expired token' });
      }

      const user = await User.findById(userId);
      user.password = password;
      await user.save();

      res.json({ message: 'Password reset successful' });
    } catch (error) {
      res.status(500).json({ error: 'Failed to reset password' });
    }
  }

  async getCurrentUser(req, res) {
    try {
      const user = await User.findById(req.user._id).select('-password');
      const profile = await Profile.findOne({ user: user._id });

      res.json({ user, profile });
    } catch (error) {
      res.status(500).json({ error: 'Failed to get user info' });
    }
  }
}

module.exports = new AuthController();