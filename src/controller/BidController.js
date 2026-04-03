const Bid = require('../models/Bid');
const Profile = require('../models/Profile');
const bidService = require('../services/BidService');

class BidController {
  async placeBid(req, res) {
    try {
      const { amount } = req.body;
      const bidForDate = new Date(req.body.bidForDate);

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (bidForDate <= today) {
        return res.status(400).json({ error: 'Bid date must be in the future' });
      }

      const profile = await Profile.findOne({ user: req.user._id });
      if (!profile) return res.status(404).json({ error: 'Profile not found' });

      const bid = await bidService.placeBid(req.user._id, profile._id, amount, bidForDate);

      res.json({
        message: 'Bid placed successfully',
        bid: {
          id: bid._id,
          amount: bid.amount,
          bidForDate: bid.bidForDate,
          isWinning: bid.isWinning,
          status: bid.status
        }
      });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async getUserBids(req, res) {
    try {
      const bids = await Bid.find({ alumni: req.user._id }).sort({ bidForDate: -1 });

      const sanitizedBids = bids.map(bid => ({
        id: bid._id,
        amount: bid.amount,
        bidForDate: bid.bidForDate,
        isWinning: bid.isWinning,
        status: bid.status
      }));

      res.json(sanitizedBids);
    } catch (error) {
      res.status(500).json({ error: 'Failed to get bids' });
    }
  }

  async getBidStatus(req, res) {
    try {
      const { bidForDate } = req.params;
      const date = new Date(bidForDate);

      const userBid = await Bid.findOne({
        alumni: req.user._id,
        bidForDate: date,
        status: 'active'
      });

      if (!userBid) {
        return res.json({ hasBid: false, message: 'No active bid for this date' });
      }

      res.json({
        hasBid: true,
        isWinning: userBid.isWinning,
        yourBid: userBid.amount,
        status: userBid.status
      });
    } catch (error) {
      res.status(500).json({ error: 'Failed to get bid status' });
    }
  }

  async getMonthlyWinCount(req, res) {
    try {
      const profile = await Profile.findOne({ user: req.user._id });
      
      const firstDayOfMonth = new Date();
      firstDayOfMonth.setDate(1);
      firstDayOfMonth.setHours(0, 0, 0, 0);

      const lastDayOfMonth = new Date();
      lastDayOfMonth.setMonth(lastDayOfMonth.getMonth() + 1);
      lastDayOfMonth.setDate(0);
      lastDayOfMonth.setHours(23, 59, 59, 999);

      const winsThisMonth = await Bid.countDocuments({
        alumni: req.user._id,
        status: 'won',
        bidForDate: { $gte: firstDayOfMonth, $lte: lastDayOfMonth }
      });

      const maxWins = profile.eventParticipation.some(e => 
        e.extraBidEligible && e.eventDate > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      ) ? 4 : 3;

      res.json({ winsThisMonth, remainingWins: maxWins - winsThisMonth, maxWins });
    } catch (error) {
      res.status(500).json({ error: 'Failed to get monthly win count' });
    }
  }
}

module.exports = new BidController();