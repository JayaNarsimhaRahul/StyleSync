const express = require('express');
const {
  createBooking,
  getMyBookings,
  cancelBooking,
  rescheduleBooking,
  payBooking,
} = require('../controllers/bookingController');
const { createReview } = require('../controllers/reviewController');
const { protect, restrictTo } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

// Customer routes
router.post('/', restrictTo('customer'), createBooking);
router.get('/me', restrictTo('customer'), getMyBookings);
router.patch('/:id/pay', restrictTo('customer'), payBooking);
router.patch('/:id/cancel', cancelBooking); // both customer + owner can cancel
router.patch('/:id/reschedule', restrictTo('customer'), rescheduleBooking);
router.post('/:id/review', restrictTo('customer'), createReview);

module.exports = router;
