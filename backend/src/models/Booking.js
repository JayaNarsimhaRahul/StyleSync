const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema(
  {
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Booking must have a customer'],
    },
    salonId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Salon',
      required: [true, 'Booking must have a salon'],
    },
    serviceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Service',
      required: [true, 'Booking must have a service'],
    },
    staffId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Staff',
      required: [true, 'Booking must have a staff member'],
    },
    date: {
      type: String, // stored as YYYY-MM-DD for easy querying
      required: [true, 'Booking date is required'],
      match: [/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'],
    },
    startTime: {
      type: String, // HH:MM format
      required: [true, 'Start time is required'],
      match: [/^\d{2}:\d{2}$/, 'Time must be in HH:MM format'],
    },
    endTime: {
      type: String, // HH:MM format
      required: [true, 'End time is required'],
      match: [/^\d{2}:\d{2}$/, 'Time must be in HH:MM format'],
    },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'completed', 'cancelled', 'no_show'],
      default: 'pending',
    },
    paymentStatus: {
      type: String,
      enum: ['unpaid', 'paid', 'refunded', 'failed'],
      default: 'unpaid',
    },
    paymentOrderId: {
      type: String, // Razorpay order ID (Phase 3)
      default: '',
    },
    paymentId: {
      type: String, // Razorpay payment ID (Phase 3)
      default: '',
    },
    paymentMethod: {
      type: String, // 'card', 'upi', etc.
      default: '',
    },
    transactionId: {
      type: String, // mock or real transaction ID
      default: '',
    },
    amount: {
      type: Number,
      required: [true, 'Booking amount is required'],
      min: 0,
    },
    notes: {
      type: String,
      maxlength: [500, 'Notes cannot exceed 500 characters'],
      trim: true,
    },
    cancelledAt: {
      type: Date,
    },
    cancellationReason: {
      type: String,
      maxlength: [300, 'Cancellation reason cannot exceed 300 characters'],
    },
  },
  { timestamps: true }
);

// Compound indexes for availability checks (Phase 2)
bookingSchema.index({ staffId: 1, date: 1, status: 1 });
bookingSchema.index({ salonId: 1, date: 1 });
bookingSchema.index({ customerId: 1, status: 1 });

module.exports = mongoose.model('Booking', bookingSchema);
