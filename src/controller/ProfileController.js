const Profile = require('../models/Profile');
const multer = require('multer');
const path = require('path');

// Configure multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/profiles/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'profile-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

class ProfileController {
  
  async getProfile(req, res) {
    try {
      const profile = await Profile.findOne({ user: req.params.userId || req.user._id })
        .populate('user', 'firstName lastName email');
      
      if (!profile) {
        return res.status(404).json({ error: 'Profile not found' });
      }

      res.json(profile);
    } catch (error) {
      res.status(500).json({ error: 'Failed to get profile' });
    }
  }

  async updateProfile(req, res) {
    try {
      const profileData = req.body;
      let profile = await Profile.findOne({ user: req.user._id });
      
      if (!profile) {
        profile = new Profile({ user: req.user._id });
      }

      // Update fields
      if (profileData.bio) profile.bio = profileData.bio;
      if (profileData.linkedinUrl) profile.linkedinUrl = profileData.linkedinUrl;
      if (profileData.education) profile.education = profileData.education;
      if (profileData.certifications) profile.certifications = profileData.certifications;
      if (profileData.licenses) profile.licenses = profileData.licenses;
      if (profileData.courses) profile.courses = profileData.courses;
      if (profileData.employment) profile.employment = profileData.employment;

      // Check if profile is complete
      profile.isComplete = !!(
        profile.bio &&
        profile.linkedinUrl &&
        profile.education.length > 0 &&
        (profile.certifications.length > 0 || profile.licenses.length > 0 || profile.courses.length > 0) &&
        profile.employment.length > 0
      );

      await profile.save();

      res.json({ message: 'Profile updated successfully', profile });
    } catch (error) {
      res.status(500).json({ error: 'Failed to update profile' });
    }
  }

  async uploadProfileImage(req, res) {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No image file provided' });
      }

      const profile = await Profile.findOne({ user: req.user._id });
      
      if (!profile) {
        return res.status(404).json({ error: 'Profile not found' });
      }

      profile.profileImage = `/uploads/profiles/${req.file.filename}`;
      await profile.save();

      res.json({ message: 'Profile image uploaded successfully', imageUrl: profile.profileImage });
    } catch (error) {
      res.status(500).json({ error: 'Failed to upload image' });
    }
  }

  async addEducation(req, res) {
    try {
      const profile = await Profile.findOne({ user: req.user._id });
      if (!profile) return res.status(404).json({ error: 'Profile not found' });

      profile.education.push(req.body);
      await profile.save();

      res.json({ message: 'Education added successfully', education: profile.education });
    } catch (error) {
      res.status(500).json({ error: 'Failed to add education' });
    }
  }

  async deleteEducation(req, res) {
    try {
      const { educationId } = req.params;
      const profile = await Profile.findOne({ user: req.user._id });
      
      if (!profile) return res.status(404).json({ error: 'Profile not found' });

      profile.education = profile.education.filter(edu => edu._id.toString() !== educationId);
      await profile.save();

      res.json({ message: 'Education deleted successfully' });
    } catch (error) {
      res.status(500).json({ error: 'Failed to delete education' });
    }
  }

  async getFeaturedAlumni(req, res) {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const Bid = require('../models/Bid');
      const winningBid = await Bid.findOne({
        bidForDate: today,
        status: 'won'
      }).populate('alumni');

      if (!winningBid) {
        return res.status(404).json({ error: 'No featured alumni today' });
      }

      const profile = await Profile.findOne({ user: winningBid.alumni._id })
        .populate('user', 'firstName lastName email');

      res.json({
        alumni: {
          name: `${profile.user.firstName} ${profile.user.lastName}`,
          bio: profile.bio,
          linkedinUrl: profile.linkedinUrl,
          profileImage: profile.profileImage,
          education: profile.education,
          certifications: profile.certifications,
          employment: profile.employment
        }
      });
    } catch (error) {
      res.status(500).json({ error: 'Failed to get featured alumni' });
    }
  }
}


const profileController = new ProfileController();

module.exports = {
  ProfileController: profileController,
  upload
};