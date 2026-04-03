const nodemailer = require('nodemailer');

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      secure: process.env.EMAIL_SECURE === 'true',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });
  }

  async sendVerificationEmail(email, token) {
    const verificationUrl = `${process.env.BASE_URL}/api/auth/verify/${token}`;
    
    await this.transporter.sendMail({
      from: `"Alumni Platform" <${process.env.EMAIL_FROM}>`,
      to: email,
      subject: 'Verify Your Email Address',
      html: `
        <h1>Welcome to Alumni Influencer Platform!</h1>
        <p>Click the link below to verify your email address:</p>
        <a href="${verificationUrl}">${verificationUrl}</a>
        <p>This link will expire in 24 hours.</p>
      `
    });
  }

  async sendPasswordResetEmail(email, token) {
    const resetUrl = `${process.env.BASE_URL}/api/auth/reset-password/${token}`;
    
    await this.transporter.sendMail({
      from: `"Alumni Platform" <${process.env.EMAIL_FROM}>`,
      to: email,
      subject: 'Password Reset Request',
      html: `
        <h1>Password Reset Request</h1>
        <p>Click the link below to reset your password:</p>
        <a href="${resetUrl}">${resetUrl}</a>
        <p>This link will expire in 1 hour.</p>
      `
    });
  }

  async sendBidNotification(email, bidData) {
    await this.transporter.sendMail({
      from: `"Alumni Platform" <${process.env.EMAIL_FROM}>`,
      to: email,
      subject: bidData.type === 'win' ? 'Congratulations! You Won the Bid!' : 'Bid Update',
      html: `
        <h1>Bid Update</h1>
        <p>${bidData.message}</p>
        <p>Bid Amount: $${bidData.amount}</p>
        <p>Status: ${bidData.type}</p>
        ${bidData.type === 'win' ? '<p>Your profile will be featured tomorrow!</p>' : ''}
      `
    });
  }
}

module.exports = new EmailService();