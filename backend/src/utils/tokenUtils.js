const jwt = require('jsonwebtoken');

/**
 * Generate a short-lived access token (default 15m)
 */
const generateAccessToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_ACCESS_SECRET, {
    expiresIn: process.env.JWT_ACCESS_EXPIRES || '15m',
  });
};

/**
 * Generate a long-lived refresh token (default 7d)
 */
const generateRefreshToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRES || '7d',
  });
};

/**
 * Set the refresh token as an httpOnly cookie.
 * httpOnly prevents JS access → mitigates XSS.
 * sameSite: 'strict' mitigates CSRF.
 */
const setRefreshTokenCookie = (res, refreshToken) => {
  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in ms
    path: '/',
  };
  res.cookie('refreshToken', refreshToken, cookieOptions);
};

/**
 * Clear the refresh token cookie on logout.
 */
const clearRefreshTokenCookie = (res) => {
  res.cookie('refreshToken', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    expires: new Date(0),
    path: '/',
  });
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  setRefreshTokenCookie,
  clearRefreshTokenCookie,
};
