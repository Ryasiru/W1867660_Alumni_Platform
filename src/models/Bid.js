const mongoose = require('mongoose');

const bidModel = new mongoose.Schema({
  alumni: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  profile: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Profile',
    required: true
  },
  amount: { type: Number, required: true, min: 0 },
  bidDate: { type: Date, default: Date.now, required: true },
  bidForDate: { type: Date, required: true },
  status: {
    type: String,
    enum: ['active', 'outbid', 'won', 'lost'],
    default: 'active'
  },
  isWinning: { type: Boolean, default: false },
  previousBids: [{
    amount: Number,
    bidDate: Date
  }],
  notificationsSent: {
    win: { type: Boolean, default: false },
    outbid: { type: Boolean, default: false }
  }
}, { timestamps: true });

// Indexes
bidModel.index({ alumni: 1, bidForDate: 1 });
bidModel.index({ bidForDate: 1, amount: -1 });
bidModel.index({ status: 1, bidForDate: 1 });

// Get highest bid for a date
bidModel.statics.getHighestBid = async function(bidForDate) {
  return this.findOne({ 
    bidForDate: bidForDate,
    status: 'active'
  }).sort({ amount: -1 });
};

// Check if this bid is winning
bidModel.methods.checkWinning = async function() {
  const highestBid = await this.constructor.getHighestBid(this.bidForDate);
  this.isWinning = highestBid && highestBid._id.equals(this._id);
  return this.isWinning;
};

module.exports = mongoose.model('Bid', bidModel);