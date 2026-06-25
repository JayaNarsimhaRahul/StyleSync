const Booking = require('../models/Booking');
const Salon = require('../models/Salon');
const AppError = require('../utils/AppError');

/**
 * GET /api/owner/analytics/:salonId
 * Owner only — MongoDB aggregation-powered analytics
 */
const getAnalytics = async (req, res, next) => {
  try {
    const salon = await Salon.findById(req.params.salonId);
    if (!salon) return next(new AppError('Salon not found.', 404));
    if (salon.ownerId.toString() !== req.user._id.toString()) {
      return next(new AppError('You can only view analytics for your own salon.', 403));
    }

    const salonId = salon._id;

    // ── 1. Booking Status Breakdown ───────────────────────────────────────
    const statusBreakdown = await Booking.aggregate([
      { $match: { salonId } },
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);

    // ── 2. Revenue by Month (last 6 months) ───────────────────────────────
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const revenueByMonth = await Booking.aggregate([
      {
        $match: {
          salonId,
          status: 'completed',
          createdAt: { $gte: sixMonthsAgo },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
          },
          revenue: { $sum: '$amount' },
          bookings: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    // ── 3. Most Booked Services ───────────────────────────────────────────
    const topServices = await Booking.aggregate([
      { $match: { salonId, status: { $in: ['confirmed', 'completed'] } } },
      { $group: { _id: '$serviceId', count: { $sum: 1 }, revenue: { $sum: '$amount' } } },
      { $sort: { count: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: 'services',
          localField: '_id',
          foreignField: '_id',
          as: 'service',
        },
      },
      { $unwind: '$service' },
      {
        $project: {
          _id: 0,
          serviceId: '$_id',
          name: '$service.name',
          category: '$service.category',
          count: 1,
          revenue: 1,
        },
      },
    ]);

    // ── 4. Staff Utilization ──────────────────────────────────────────────
    const staffUtilization = await Booking.aggregate([
      { $match: { salonId, status: { $in: ['confirmed', 'completed'] } } },
      { $group: { _id: '$staffId', bookings: { $sum: 1 } } },
      { $sort: { bookings: -1 } },
      {
        $lookup: {
          from: 'staffs',
          localField: '_id',
          foreignField: '_id',
          as: 'staff',
        },
      },
      { $unwind: '$staff' },
      {
        $project: {
          _id: 0,
          staffId: '$_id',
          name: '$staff.name',
          photo: '$staff.photo',
          bookings: 1,
        },
      },
    ]);

    // ── 5. Total Revenue Summary ───────────────────────────────────────────
    const revenueSummary = await Booking.aggregate([
      { $match: { salonId, status: 'completed' } },
      {
        $group: {
          _id: null,
          total: { $sum: '$amount' },
          count: { $sum: 1 },
          avgPerBooking: { $avg: '$amount' },
        },
      },
    ]);

    // ── 6. New vs Returning Customers ─────────────────────────────────────
    const customerStats = await Booking.aggregate([
      { $match: { salonId } },
      { $group: { _id: '$customerId', visits: { $sum: 1 } } },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          newCustomers: { $sum: { $cond: [{ $eq: ['$visits', 1] }, 1, 0] } },
          returning: { $sum: { $cond: [{ $gt: ['$visits', 1] }, 1, 0] } },
        },
      },
    ]);

    res.status(200).json({
      success: true,
      data: {
        statusBreakdown: statusBreakdown.reduce((acc, s) => {
          acc[s._id] = s.count;
          return acc;
        }, {}),
        revenueByMonth,
        topServices,
        staffUtilization,
        revenueSummary: revenueSummary[0] || { total: 0, count: 0, avgPerBooking: 0 },
        customerStats: customerStats[0] || { total: 0, newCustomers: 0, returning: 0 },
        salon: {
          name: salon.name,
          avgRating: salon.avgRating,
          totalReviews: salon.totalReviews,
        },
      },
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { getAnalytics };
