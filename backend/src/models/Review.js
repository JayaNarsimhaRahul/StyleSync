const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Review must have a customer'],
    },
    salonId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Salon',
      required: [true, 'Review must belong to a salon'],
    },
    bookingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking',
      required: [true, 'Review must be linked to a completed booking'],
      unique: true, // one review per booking
    },
    rating: {
      type: Number,
      required: [true, 'Rating is required'],
      min: [1, 'Rating must be at least 1'],
      max: [5, 'Rating cannot exceed 5'],
    },
    comment: {
      type: String,
      trim: true,
      maxlength: [1000, 'Comment cannot exceed 1000 characters'],
    },
  },
  { timestamps: true }
);

reviewSchema.index({ salonId: 1, createdAt: -1 });
reviewSchema.index({ customerId: 1 });

// After saving a review, recalculate the salon's avgRating
reviewSchema.post('save', async function () {
  const Salon = mongoose.model('Salon');
  const stats = await mongoose.model('Review').aggregate([
    { $match: { salonId: this.salonId } },
    {
      $group: {
        _id: '$salonId',
        avgRating: { $avg: '$rating' },
        totalReviews: { $sum: 1 },
      },
    },
  ]);

  if (stats.length > 0) {
    await Salon.findByIdAndUpdate(this.salonId, {
      avgRating: stats[0].avgRating,
      totalReviews: stats[0].totalReviews,
    });
  }
});

module.exports = mongoose.model('Review', reviewSchema);
