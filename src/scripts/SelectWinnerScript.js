const mongoose = require('mongoose');
const cron = require('node-cron');
const bidService = require('../src/services/bidService');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB for winner selection'))
  .catch(error => {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  });

// Run at midnight every day
cron.schedule('0 0 * * *', async () => {
  console.log('Running daily winner selection...', new Date());
  
  try {
    const winner = await bidService.selectDailyWinner();
    if (winner) {
      console.log('Winner selected:', winner);
    } else {
      console.log('No bids for tomorrow');
    }
  } catch (error) {
    console.error('Winner selection error:', error);
  }
}, { timezone: "UTC" });

console.log('Winner selection cron job started');

process.on('SIGINT', () => {
  mongoose.connection.close();
  process.exit(0);
});