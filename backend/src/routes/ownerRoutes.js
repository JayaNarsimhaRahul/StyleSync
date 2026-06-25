const express = require('express');
const { getAnalytics } = require('../controllers/ownerController');
const { getMySalon } = require('../controllers/salonController');
const { protect, restrictTo } = require('../middleware/auth');

const router = express.Router();

router.use(protect, restrictTo('owner', 'superadmin'));

router.get('/my-salon', getMySalon);
router.get('/analytics/:salonId', getAnalytics);

module.exports = router;
