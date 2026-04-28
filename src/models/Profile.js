const mongoose = require('mongoose');

// Education Schema
const educationModel = new mongoose.Schema({
  degree: { type: String, required: true },
  institution: { type: String, required: true },
  degreeUrl: { 
    type: String, 
    required: true,
    validate: {
      validator: v => /^https?:\/\/.+/.test(v),
      message: 'Invalid URL for Degrees'
    }
  },
  completionDate: { type: Date, required: true }
}, { _id: true });

// Certification Schema
const certificationModel = new mongoose.Schema({
  name: { type: String, required: true },
  issuingBody: { type: String, required: true },
  courseUrl: { 
    type: String, 
    required: true,
    validate: {
      validator: v => /^https?:\/\/.+/.test(v),
      message: 'Invalid URL for Certifications'
    }
  },
  completionDate: { type: Date, required: true },
  expiryDate: Date,
  credentialId: String
}, { _id: true });

// License Schema
const licenseModel = new mongoose.Schema({
  name: { type: String, required: true },
  issuingBody: { type: String, required: true },
  licenseUrl: { 
    type: String, 
    required: true,
    validate: {
      validator: v => /^https?:\/\/.+/.test(v),
      message: 'Invalid URL for Licenses'
    }
  },
  completionDate: { type: Date, required: true },
  licenseNumber: String
}, { _id: true });

// Course Schema
const courseModel = new mongoose.Schema({
  name: { type: String, required: true },
  provider: { type: String, required: true },
  courseUrl: { 
    type: String, 
    required: true,
    validate: {
      validator: v => /^https?:\/\/.+/.test(v),
      message: 'Invalid URL for Courses'
    }
  },
  completionDate: { type: Date, required: true }
}, { _id: true });

// Employment Schema
const employmentModel = new mongoose.Schema({
  company: { type: String, required: true },
  position: { type: String, required: true },
  startDate: { type: Date, required: true },
  endDate: Date,
  current: { type: Boolean, default: false },
  description: String
}, { _id: true });

// Main Profile Schema
const profileSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  bio: { type: String, maxlength: 1000 },
  linkedinUrl: {
    type: String,
    validate: {
      validator: v => /^https?:\/\/(www\.)?linkedin\.com\/.+/.test(v),
      message: 'Invalid LinkedIn URL'
    }
  },
  profileImage: String,
  education: [educationModel],
  certifications: [certificationModel],
  licenses: [licenseModel],
  courses: [courseModel],
  employment: [employmentModel],
  isComplete: { type: Boolean, default: false },
  programme: { type: String },
  graduationDate: { type: Date },
  industrySector: { type: String },
  monthlyWins: { type: Number, default: 0, max: 3 },
  lastWinDate: Date,
  eventParticipation: [{
    eventName: String,
    eventDate: Date,
    extraBidEligible: { type: Boolean, default: false }
  }]
}, { timestamps: true });

// Indexes for performance
// profileSchema.index({ user: 1 });
profileSchema.index({ monthlyWins: 1 });

module.exports = mongoose.model('Profile', profileSchema);