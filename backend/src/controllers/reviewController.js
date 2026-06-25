const Joi = require('joi');
const Review = require('../models/Review');
const Booking = require('../models/Booking');
const Salon = require('../models/Salon');
const AppError = require('../utils/AppError');

// ─── Validation ───────────────────────────────────────────────────────────────

const reviewSchema = Joi.object({
  rating: Joi.number().integer().min(1).max(5).required(),
  comment: Joi.string().trim().max(1000).optional().allow(''),
});

// ─── Controllers ─────────────────────────────────────────────────────────────

/**
 * GET /api/salons/:id/reviews
 * Public — paginated reviews for a salon
 */
const getSalonReviews = async (req, res, next) => {
  try {
    const salon = await Salon.findById(req.params.id);
    if (!salon) return next(new AppError('Salon not found.', 404));

    const page = parseInt(req.query.page) || 1;
    const limit = Math.min(parseInt(req.query.limit) || 10, 50);
    const skip = (page - 1) * limit;

    const [reviews, total] = await Promise.all([
      Review.find({ salonId: req.params.id })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('customerId', 'name avatar'),
      Review.countDocuments({ salonId: req.params.id }),
    ]);

    res.status(200).json({
      success: true,
      total,
      page,
      pages: Math.ceil(total / limit),
      avgRating: salon.avgRating,
      totalReviews: salon.totalReviews,
      data: reviews,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/bookings/:id/review
 * Customer only — can only review a 'completed' booking, one review per booking
 */
const createReview = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return next(new AppError('Booking not found.', 404));

    if (booking.customerId.toString() !== req.user._id.toString()) {
      return next(new AppError('You can only review your own bookings.', 403));
    }

    if (booking.status !== 'completed') {
      return next(new AppError('You can only review a completed appointment.', 400));
    }

    // Check if already reviewed
    const existing = await Review.findOne({ bookingId: booking._id });
    if (existing) {
      return next(new AppError('You have already reviewed this appointment.', 409));
    }

    const { error, value } = reviewSchema.validate(req.body, { abortEarly: false });
    if (error) {
      const msg = error.details.map((d) => d.message).join(', ');
      return next(new AppError(msg, 400));
    }

    const review = await Review.create({
      ...value,
      customerId: req.user._id,
      salonId: booking.salonId,
      bookingId: booking._id,
    });

    // avgRating is recalculated by the Review.post('save') hook in the model
    const populated = await Review.findById(review._id).populate('customerId', 'name avatar');

    res.status(201).json({ success: true, data: populated });
  } catch (err) {
    next(err);
  }
};

module.exports = { getSalonReviews, createReview };
