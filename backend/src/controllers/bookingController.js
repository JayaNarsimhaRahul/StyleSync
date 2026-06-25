const Joi = require('joi');
const Booking = require('../models/Booking');
const Salon = require('../models/Salon');
const Service = require('../models/Service');
const Staff = require('../models/Staff');
const AppError = require('../utils/AppError');
const { computeAvailableSlots, toMinutes, toTimeStr } = require('../utils/slotEngine');

// ─── Validation ───────────────────────────────────────────────────────────────

const createBookingSchema = Joi.object({
  salonId: Joi.string().required(),
  serviceId: Joi.string().required(),
  staffId: Joi.string().required(),
  date: Joi.string().pattern(/^\d{4}-\d{2}-\d{2}$/).required(),
  startTime: Joi.string().pattern(/^\d{2}:\d{2}$/).required(),
  notes: Joi.string().max(500).optional().allow(''),
});

const CANCEL_CUTOFF_HOURS = 2; // cannot cancel within 2 hours of appointment

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Check if it's within the cutoff window for modification.
 * Returns true if the operation is allowed (still outside the cutoff).
 */
const isWithinCutoff = (date, startTime) => {
  const appointmentDateTime = new Date(`${date}T${startTime}:00`);
  const cutoffMs = CANCEL_CUTOFF_HOURS * 60 * 60 * 1000;
  return Date.now() + cutoffMs > appointmentDateTime.getTime();
};

// ─── Controllers ─────────────────────────────────────────────────────────────

/**
 * POST /api/bookings
 * Customer only — create a booking
 * Re-validates slot availability at write time to prevent race conditions.
 */
/**
 * Helper to delete expired unpaid pending bookings.
 * Runs on-the-fly to release slots without requiring external cron daemons.
 */
const cleanupPendingBookings = async () => {
  try {
    const timeout = new Date(Date.now() - 15 * 60 * 1000); // 15 minutes ago
    // Delete unpaid pending bookings that are older than 15 minutes
    const result = await Booking.deleteMany({
      status: 'pending',
      paymentStatus: 'unpaid',
      createdAt: { $lt: timeout },
    });
    if (result.deletedCount > 0) {
      console.log(`🧹 Cleaned up ${result.deletedCount} expired unpaid pending bookings.`);
    }
  } catch (err) {
    console.error('Failed to cleanup pending bookings:', err.message);
  }
};

/**
 * POST /api/bookings
 * Customer only — create a booking
 * Re-validates slot availability at write time to prevent race conditions.
 */
const createBooking = async (req, res, next) => {
  try {
    // ── Run cleanup of expired pending bookings ────────────────────────────
    await cleanupPendingBookings();

    const { error, value } = createBookingSchema.validate(req.body, { abortEarly: false });
    if (error) {
      const msg = error.details.map((d) => d.message).join(', ');
      return next(new AppError(msg, 400));
    }

    const { salonId, serviceId, staffId, date, startTime, notes } = value;

    // ── Reject past dates ──────────────────────────────────────────────────
    const today = new Date().toLocaleDateString('sv-SE');
    if (date < today) return next(new AppError('Cannot book a past date.', 400));

    // ── Load required docs in parallel ─────────────────────────────────────
    const [salon, service, staff] = await Promise.all([
      Salon.findById(salonId),
      Service.findById(serviceId),
      Staff.findById(staffId),
    ]);

    if (!salon) return next(new AppError('Salon not found.', 404));
    if (!service || service.salonId.toString() !== salonId) {
      return next(new AppError('Service not found at this salon.', 404));
    }
    if (!staff || staff.salonId.toString() !== salonId) {
      return next(new AppError('Staff member not found at this salon.', 404));
    }
    if (!service.isActive) return next(new AppError('This service is no longer available.', 400));
    if (!staff.isActive) return next(new AppError('This staff member is no longer available.', 400));

    // ── Re-validate slot is still available ────────────────────────────────
    const existingBookings = await Booking.find({
      staffId,
      date,
      status: { $in: ['pending', 'confirmed'] },
    }).select('startTime endTime');

    const availableSlots = computeAvailableSlots({
      salon,
      staff,
      durationMinutes: service.durationMinutes,
      date,
      existingBookings,
    });

    if (!availableSlots.includes(startTime)) {
      return next(
        new AppError(
          'This slot is no longer available. Please pick another time.',
          409
        )
      );
    }

    const endTime = toTimeStr(toMinutes(startTime) + service.durationMinutes);

    // ── Create the booking as pending ──────────────────────────────────────
    const booking = await Booking.create({
      customerId: req.user._id,
      salonId,
      serviceId,
      staffId,
      date,
      startTime,
      endTime,
      amount: service.price,
      status: 'pending', // Starts as pending in Phase 3
      paymentStatus: 'unpaid',
      notes,
    });

    const populated = await Booking.findById(booking._id)
      .populate('salonId', 'name address city')
      .populate('serviceId', 'name durationMinutes price')
      .populate('staffId', 'name photo');

    // Return booking details with mock payment indicators
    res.status(201).json({
      success: true,
      data: populated,
      paymentMocked: true,
      paymentOrderId: `order_mock_${Math.random().toString(36).substr(2, 9)}`,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/bookings/me
 * Customer — get their own bookings
 */
const getMyBookings = async (req, res, next) => {
  try {
    const bookings = await Booking.find({ customerId: req.user._id })
      .sort({ date: -1, startTime: -1 })
      .populate('salonId', 'name address city images')
      .populate('serviceId', 'name durationMinutes price category')
      .populate('staffId', 'name photo');

    res.status(200).json({ success: true, data: bookings });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/salons/:id/bookings
 * Owner — get all bookings for their salon
 */
const getSalonBookings = async (req, res, next) => {
  try {
    const salon = await Salon.findById(req.params.id);
    if (!salon) return next(new AppError('Salon not found.', 404));
    if (salon.ownerId.toString() !== req.user._id.toString()) {
      return next(new AppError('You can only view bookings for your own salon.', 403));
    }

    const { date, staffId, status } = req.query;
    const filter = { salonId: req.params.id };
    if (date) filter.date = date;
    if (staffId) filter.staffId = staffId;
    if (status) filter.status = status;

    const bookings = await Booking.find(filter)
      .sort({ date: 1, startTime: 1 })
      .populate('customerId', 'name email phone')
      .populate('serviceId', 'name durationMinutes price')
      .populate('staffId', 'name photo');

    res.status(200).json({ success: true, data: bookings });
  } catch (err) {
    next(err);
  }
};

/**
 * PATCH /api/bookings/:id/cancel
 * Customer or owner — cancel a booking
 */
const cancelBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return next(new AppError('Booking not found.', 404));

    // Auth: customer can cancel their own, owner can cancel any in their salon
    const isCustomer = booking.customerId.toString() === req.user._id.toString();
    const salon = await Salon.findById(booking.salonId);
    const isOwner = salon && salon.ownerId.toString() === req.user._id.toString();

    if (!isCustomer && !isOwner) {
      return next(new AppError('You do not have permission to cancel this booking.', 403));
    }

    if (['cancelled', 'completed'].includes(booking.status)) {
      return next(new AppError(`Cannot cancel a booking that is already ${booking.status}.`, 400));
    }

    // Enforce 2-hour cutoff for customers (owners can always cancel)
    if (isCustomer && !isOwner && isWithinCutoff(booking.date, booking.startTime)) {
      return next(
        new AppError(
          `Cancellations must be made at least ${CANCEL_CUTOFF_HOURS} hours before the appointment.`,
          400
        )
      );
    }

    booking.status = 'cancelled';
    booking.cancelledAt = new Date();
    booking.cancellationReason = req.body.reason || '';
    await booking.save();

    // Send simulated email in background
    try {
      const populated = await Booking.findById(booking._id)
        .populate('customerId', 'name email phone')
        .populate('salonId', 'name address city')
        .populate('serviceId', 'name durationMinutes price')
        .populate('staffId', 'name photo');

      const { sendSimulatedEmail } = require('../utils/email');
      sendSimulatedEmail({
        type: 'booking_cancelled',
        booking: populated,
      });
    } catch (emailErr) {
      console.error('Failed to send simulated email notification:', emailErr.message);
    }

    res.status(200).json({ success: true, data: booking });
  } catch (err) {
    next(err);
  }
};

/**
 * PATCH /api/bookings/:id/reschedule
 * Customer — reschedule a booking (same salon/service/staff, new date/time)
 */
const rescheduleBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return next(new AppError('Booking not found.', 404));

    if (booking.customerId.toString() !== req.user._id.toString()) {
      return next(new AppError('You can only reschedule your own bookings.', 403));
    }

    if (['cancelled', 'completed'].includes(booking.status)) {
      return next(new AppError(`Cannot reschedule a booking that is ${booking.status}.`, 400));
    }

    if (isWithinCutoff(booking.date, booking.startTime)) {
      return next(
        new AppError(
          `Rescheduling must be done at least ${CANCEL_CUTOFF_HOURS} hours before the appointment.`,
          400
        )
      );
    }

    const { date, startTime } = req.body;
    if (!date || !startTime) {
      return next(new AppError('New date and startTime are required.', 400));
    }

    const today = new Date().toLocaleDateString('sv-SE');
    if (date < today) return next(new AppError('Cannot reschedule to a past date.', 400));

    // Re-validate the new slot
    const [salon, service, staff] = await Promise.all([
      Salon.findById(booking.salonId),
      Service.findById(booking.serviceId),
      Staff.findById(booking.staffId),
    ]);

    const existingBookings = await Booking.find({
      staffId: booking.staffId,
      date,
      status: { $in: ['pending', 'confirmed'] },
      _id: { $ne: booking._id }, // exclude the current booking
    }).select('startTime endTime');

    const availableSlots = computeAvailableSlots({
      salon,
      staff,
      durationMinutes: service.durationMinutes,
      date,
      existingBookings,
    });

    if (!availableSlots.includes(startTime)) {
      return next(new AppError('The requested slot is not available. Please choose another time.', 409));
    }

    const endTime = toTimeStr(toMinutes(startTime) + service.durationMinutes);

    booking.date = date;
    booking.startTime = startTime;
    booking.endTime = endTime;
    await booking.save();

    const populated = await Booking.findById(booking._id)
      .populate('salonId', 'name address city')
      .populate('serviceId', 'name durationMinutes price')
      .populate('staffId', 'name photo');

    res.status(200).json({ success: true, data: populated });
  } catch (err) {
    next(err);
  }
};

/**
 * PATCH /api/bookings/:id/pay
 * Customer only — pay/confirm a pending booking (simulated)
 */
const payBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return next(new AppError('Booking not found.', 404));

    if (booking.customerId.toString() !== req.user._id.toString()) {
      return next(new AppError('You do not have permission to pay for this booking.', 403));
    }

    if (booking.status !== 'pending') {
      return next(new AppError(`Booking is already ${booking.status}.`, 400));
    }

    const { paymentMethod } = req.body;
    if (!paymentMethod) {
      return next(new AppError('Payment method is required.', 400));
    }

    booking.status = 'confirmed';
    booking.paymentStatus = 'paid';
    booking.paymentMethod = paymentMethod;
    booking.transactionId = `tx_mock_${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    await booking.save();

    const populated = await Booking.findById(booking._id)
      .populate('customerId', 'name email phone')
      .populate('salonId', 'name address city')
      .populate('serviceId', 'name durationMinutes price')
      .populate('staffId', 'name photo');

    // Trigger simulated confirmation email
    try {
      const { sendSimulatedEmail } = require('../utils/email');
      sendSimulatedEmail({
        type: 'booking_confirmed',
        booking: populated,
        user: req.user,
      });
    } catch (emailErr) {
      console.error('Failed to send simulated email notification:', emailErr.message);
    }

    res.status(200).json({ success: true, data: populated });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  createBooking,
  getMyBookings,
  getSalonBookings,
  cancelBooking,
  rescheduleBooking,
  payBooking,
};
