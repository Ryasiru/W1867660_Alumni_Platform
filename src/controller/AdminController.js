const ApiKey = require('../models/APIKey');
const User = require('../models/User');
const Bid = require('../models/Bid');
const Profile = require('../models/Profile');

class AdminController {
  async generateApiKey(req, res) {
    try {
      const { name, permissions } = req.body;
      const { key, clientId } = ApiKey.generateApiKey();

      const apiKey = new ApiKey({
        name,
        key,
        clientId,
        permissions,
        createdBy: req.user._id,
        expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
      });

      await apiKey.save();

      res.json({ message: 'API key generated successfully', apiKey: key, clientId, permissions });
    } catch (error) {
      res.status(500).json({ error: 'Failed to generate API key' });
    }
  }

  async getApiKeys(req, res) {
    try {
      const apiKeys = await ApiKey.find().populate('createdBy', 'email').select('-key');
      res.json(apiKeys);
    } catch (error) {
      res.status(500).json({ error: 'Failed to get API keys' });
    }
  }

  async revokeApiKey(req, res) {
    try {
      const { keyId } = req.params;
      await ApiKey.findByIdAndUpdate(keyId, { isActive: false });
      res.json({ message: 'API key revoked successfully' });
    } catch (error) {
      res.status(500).json({ error: 'Failed to revoke API key' });
    }
  }

  async getUsageStats(req, res) {
    try {
      const { keyId } = req.params;
      const apiKey = await ApiKey.findById(keyId);

      if (!apiKey) {
        return res.status(404).json({ error: 'API key not found' });
      }

      const stats = {
        totalRequests: apiKey.usageStats.length,
        lastUsed: apiKey.lastUsed,
        endpointsAccessed: {},
        dailyUsage: {}
      };

      apiKey.usageStats.forEach(stat => {
        stats.endpointsAccessed[stat.endpoint] = (stats.endpointsAccessed[stat.endpoint] || 0) + 1;
        const day = stat.timestamp.toISOString().split('T')[0];
        stats.dailyUsage[day] = (stats.dailyUsage[day] || 0) + 1;
      });

      res.json(stats);
    } catch (error) {
      res.status(500).json({ error: 'Failed to get usage stats' });
    }
  }

  async getSystemStats(req, res) {
    try {
      const totalUsers = await User.countDocuments();
      const verifiedUsers = await User.countDocuments({ isVerified: true });
      const totalBids = await Bid.countDocuments();
      const activeBids = await Bid.countDocuments({ status: 'active' });
      
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const todayBids = await Bid.countDocuments({ bidDate: { $gte: today } });

      res.json({
        users: { total: totalUsers, verified: verifiedUsers },
        bids: { total: totalBids, active: activeBids, today: todayBids }
      });
    } catch (error) {
      res.status(500).json({ error: 'Failed to get system stats' });
    }
  }

  async recordEventParticipation(req, res) {
    try {
      const { userId, eventName } = req.body;
      const profile = await Profile.findOne({ user: userId });

      if (!profile) {
        return res.status(404).json({ error: 'Profile not found' });
      }

      profile.eventParticipation.push({
        eventName,
        eventDate: new Date(),
        extraBidEligible: true
      });

      await profile.save();
      res.json({ message: 'Event participation recorded' });
    } catch (error) {
      res.status(500).json({ error: 'Failed to record event' });
    }
  }
}

module.exports = new AdminController();