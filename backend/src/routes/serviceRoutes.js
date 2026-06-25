const express = require('express');
const { updateService, deleteService } = require('../controllers/serviceController');
const { protect, restrictTo } = require('../middleware/auth');

const router = express.Router();

// These routes are for operations on specific services (not nested under salon)
router.use(protect, restrictTo('owner', 'superadmin'));

router.put('/:id', updateService);
router.delete('/:id', deleteService);

module.exports = router;
