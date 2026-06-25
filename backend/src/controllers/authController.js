const Joi = require('joi');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const AppError = require('../utils/AppError');
const {
  generateAccessToken,
  generateRefreshToken,
  setRefreshTokenCookie,
  clearRefreshTokenCookie,
} = require('../utils/tokenUtils');

// ─── Validation Schemas ──────────────────────────────────────────────────────

const registerSchema = Joi.object({
  name: Joi.string().trim().min(2).max(50).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(8).required(),
  phone: Joi.string().pattern(/^[0-9+\-\s()]{7,15}$/).optional().allow(''),
  role: Joi.string().valid('customer', 'owner').default('customer'),
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Issue tokens, persist refresh token on user doc, set cookie, send response.
 */
const sendAuthResponse = async (user, statusCode, res) => {
  const accessToken = generateAccessToken(user._id);
  const refreshToken = generateRefreshToken(user._id);

  // Persist hashed refresh token on user document
  user.refreshToken = refreshToken;
  await user.save({ validateBeforeSave: false });

  setRefreshTokenCookie(res, refreshToken);

  res.status(statusCode).json({
    success: true,
    accessToken,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
    },
  });
};

// ─── Controllers ─────────────────────────────────────────────────────────────

/**
 * POST /api/auth/register
 */
const register = async (req, res, next) => {
  try {
    const { error, value } = registerSchema.validate(req.body, { abortEarly: false });
    if (error) {
      const msg = error.details.map((d) => d.message).join(', ');
      return next(new AppError(msg, 400));
    }

    const { name, email, password, phone, role } = value;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return next(new AppError('An account with this email already exists.', 409));
    }

    const userPayload = { name, email, password, role };
    if (phone && phone.trim() !== '') {
      userPayload.phone = phone.trim();
    }

    const user = await User.create(userPayload);

    await sendAuthResponse(user, 201, res);
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/auth/login
 */
const login = async (req, res, next) => {
  try {
    const { error, value } = loginSchema.validate(req.body, { abortEarly: false });
    if (error) {
      const msg = error.details.map((d) => d.message).join(', ');
      return next(new AppError(msg, 400));
    }

    const { email, password } = value;

    // Explicitly select password (hidden by default in schema)
    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.comparePassword(password))) {
      return next(new AppError('Incorrect email or password.', 401));
    }

    await sendAuthResponse(user, 200, res);
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/auth/refresh
 * Reads refresh token from httpOnly cookie, issues new access token.
 */
const refresh = async (req, res, next) => {
  try {
    const token = req.cookies.refreshToken;
    if (!token) {
      return next(new AppError('No refresh token provided. Please log in.', 401));
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    } catch {
      return next(new AppError('Invalid or expired refresh token. Please log in again.', 401));
    }

    const user = await User.findById(decoded.id).select('+refreshToken');
    if (!user || user.refreshToken !== token) {
      return next(new AppError('Refresh token is no longer valid. Please log in again.', 401));
    }

    const newAccessToken = generateAccessToken(user._id);
    const newRefreshToken = generateRefreshToken(user._id);

    // Rotate refresh token
    user.refreshToken = newRefreshToken;
    await user.save({ validateBeforeSave: false });
    setRefreshTokenCookie(res, newRefreshToken);

    res.status(200).json({
      success: true,
      accessToken: newAccessToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
      },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/auth/me — returns current authenticated user
 */
const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    res.status(200).json({
      success: true,
      user,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/auth/logout
 */
const logout = async (req, res, next) => {
  try {
    // Invalidate refresh token in DB
    await User.findByIdAndUpdate(req.user._id, { refreshToken: '' });
    clearRefreshTokenCookie(res);

    res.status(200).json({
      success: true,
      message: 'Logged out successfully.',
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { register, login, refresh, getMe, logout };
