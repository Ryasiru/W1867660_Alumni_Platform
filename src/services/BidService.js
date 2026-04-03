const Bid = require('../models/Bid');
const Profile = require('../models/Profile');
const User = require('../models/User');
const emailService = require('./EmailService');

class BidService {
  async placeBid(alumniId, profileId, amount, bidForDate) {
    const profile = await Profile.findOne({ user: alumniId });
    if (!profile) throw new Error('Profile not found');

    // Check monthly win limit
    const winCount = profile.monthlyWins;
    const maxWins = profile.eventParticipation.some(e => 
      e.extraBidEligible && e.eventDate > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    ) ? 4 : 3;

    if (winCount >= maxWins) throw new Error('Monthly win limit reached');

    // Check existing bid
    const existingBid = await Bid.findOne({
      alumni: alumniId,
      bidForDate: bidForDate,
      status: 'active'
    });

    if (existingBid) {
      if (amount <= existingBid.amount) {
        throw new Error('Bid amount must be higher than current bid');
      }
      
      existingBid.previousBids.push({
        amount: existingBid.amount,
        bidDate: existingBid.bidDate
      });
      
      existingBid.amount = amount;
      existingBid.bidDate = new Date();
      
      await existingBid.save();
      await this.updateBidStatus(existingBid);
      
      return existingBid;
    }

    // Create new bid
    const bid = new Bid({
      alumni: alumniId,
      profile: profileId,
      amount,
      bidForDate,
      status: 'active'
    });

    await bid.save();
    await this.updateBidStatus(bid);
    
    return bid;
  }

  async updateBidStatus(bid) {
    const highestBid = await Bid.getHighestBid(bid.bidForDate);
    
    const wasWinning = bid.isWinning;
    bid.isWinning = highestBid && highestBid._id.equals(bid._id);
    
    if (wasWinning && !bid.isWinning && !bid.notificationsSent.outbid) {
      const user = await User.findById(bid.alumni);
      await emailService.sendBidNotification(user.email, {
        type: 'outbid',
        amount: bid.amount,
        message: 'You have been outbid! Place a higher bid to secure your spot.'
      });
      bid.notificationsSent.outbid = true;
    }
    
    await bid.save();
    return bid;
  }

  async selectDailyWinner() {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);

    const winningBid = await Bid.findOne({
      bidForDate: tomorrow,
      status: 'active'
    }).sort({ amount: -1 });

    if (winningBid) {
      await Bid.updateMany(
        { bidForDate: tomorrow, _id: { $ne: winningBid._id } },
        { status: 'lost' }
      );

      winningBid.status = 'won';
      await winningBid.save();

      await Profile.findOneAndUpdate(
        { user: winningBid.alumni },
        { $inc: { monthlyWins: 1 }, lastWinDate: new Date() }
      );

      const user = await User.findById(winningBid.alumni);
      await emailService.sendBidNotification(user.email, {
        type: 'win',
        amount: winningBid.amount,
        message: 'Congratulations! Your bid won and your profile will be featured tomorrow!'
      });

      return winningBid;
    }
    return null;
  }
}

module.exports = new BidService();