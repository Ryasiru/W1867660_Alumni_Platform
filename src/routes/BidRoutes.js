const express = require('express');
const router = express.Router();
const bidController = require('../controller/BidController');
const { authMiddleware, isAlumni } = require('../middleware/Auth');
const { bidLimiter } = require('../middleware/ratelimiter');

router.use(authMiddleware);

router.post('/', isAlumni, bidLimiter, bidController.placeBid);
router.get('/my-bids', bidController.getUserBids);
router.get('/status/:bidForDate', bidController.getBidStatus);
router.get('/monthly-count', bidController.getMonthlyWinCount);

module.exports = router;