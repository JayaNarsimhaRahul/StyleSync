const express = require('express');
const {
  getSalons,
  getSalonById,
  createSalon,
  updateSalon,
  uploadSalonImages,
  deleteSalonImage,
  getMySalon,
} = require('../controllers/salonController');
const { protect, restrictTo } = require('../middleware/auth');
const { handleSalonUpload, handleStaffUpload } = require('../middleware/upload');
const { getServicesBySalon, createService } = require('../controllers/serviceController');
const { getStaffBySalon, createStaff } = require('../controllers/staffController');
const { getAvailability } = require('../controllers/availabilityController');
const { getSalonBookings } = require('../controllers/bookingController');
const { getSalonReviews } = require('../controllers/reviewController');

const router = express.Router();

// ── Public routes ─────────────────────────────────────────────────────────────
router.get('/', getSalons);
router.get('/:id', getSalonById);
router.get('/:id/services', getServicesBySalon);
router.get('/:id/staff', getStaffBySalon);
router.get('/:id/availability', getAvailability);
router.get('/:id/reviews', getSalonReviews);

// ── Owner protected routes ────────────────────────────────────────────────────
router.use(protect, restrictTo('owner', 'superadmin'));

router.post('/', createSalon);
router.put('/:id', updateSalon);
router.post('/:id/images', handleSalonUpload, uploadSalonImages);
router.delete('/:id/images', deleteSalonImage);
router.get('/:id/bookings', getSalonBookings);
router.post('/:id/services', createService);
router.post('/:id/staff', handleStaffUpload, createStaff);

module.exports = router;
