const express = require('express');
const rateLimit = require('express-rate-limit');
const { register, login, refresh, getMe, logout } = require('../controllers/authController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Strict rate limiter for auth endpoints: 10 requests per 15 minutes per IP
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: {
    success: false,
    message: 'Too many requests from this IP. Please try again after 15 minutes.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

router.post('/register', authLimiter, register);
router.post('/login', authLimiter, login);
router.post('/refresh', refresh);
router.post('/logout', protect, logout);
router.get('/me', protect, getMe);

module.exports = router;
