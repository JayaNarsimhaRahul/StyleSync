const Salon = require('../models/Salon');
const Staff = require('../models/Staff');
const Service = require('../models/Service');
const Booking = require('../models/Booking');
const AppError = require('../utils/AppError');
const { computeAvailableSlots } = require('../utils/slotEngine');

/**
 * GET /api/salons/:id/availability
 * Query: serviceId, staffId, date (YYYY-MM-DD)
 *
 * Public — returns array of available "HH:MM" time slots
 */
const getAvailability = async (req, res, next) => {
  try {
    const { serviceId, staffId, date } = req.query;

    // ── Validate required params ──────────────────────────────────────────
    if (!serviceId || !staffId || !date) {
      return next(new AppError('serviceId, staffId, and date are required.', 400));
    }

    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return next(new AppError('Date must be in YYYY-MM-DD format.', 400));
    }

    // ── Reject past dates ─────────────────────────────────────────────────
    const today = new Date().toLocaleDateString('sv-SE');
    if (date < today) {
      return next(new AppError('Cannot check availability for past dates.', 400));
    }

    // ── Load all required documents in parallel ───────────────────────────
    const [salon, staff, service] = await Promise.all([
      Salon.findById(req.params.id),
      Staff.findById(staffId),
      Service.findById(serviceId),
    ]);

    if (!salon) return next(new AppError('Salon not found.', 404));
    if (!staff || staff.salonId.toString() !== req.params.id) {
      return next(new AppError('Staff member not found at this salon.', 404));
    }
    if (!service || service.salonId.toString() !== req.params.id) {
      return next(new AppError('Service not found at this salon.', 404));
    }
    if (!staff.isActive) return next(new AppError('This staff member is not currently available.', 400));

    // ── Fetch existing bookings for this staff on this date ───────────────
    const existingBookings = await Booking.find({
      staffId,
      date,
      status: { $in: ['pending', 'confirmed'] }, // only active bookings block slots
    }).select('startTime endTime');

    // ── Run the slot engine ───────────────────────────────────────────────
    const availableSlots = computeAvailableSlots({
      salon,
      staff,
      durationMinutes: service.durationMinutes,
      date,
      existingBookings,
    });

    res.status(200).json({
      success: true,
      date,
      serviceDuration: service.durationMinutes,
      slots: availableSlots,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { getAvailability };
