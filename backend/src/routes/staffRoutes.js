const express = require('express');
const { createStaff, updateStaff, deleteStaff } = require('../controllers/staffController');
const { protect, restrictTo } = require('../middleware/auth');
const { handleStaffUpload } = require('../middleware/upload');

const router = express.Router();

router.use(protect, restrictTo('owner', 'superadmin'));

router.put('/:id', handleStaffUpload, updateStaff);
router.delete('/:id', deleteStaff);

module.exports = router;
