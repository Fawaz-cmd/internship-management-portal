const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const { User } = require('../models');
const jwtConfig = require('../config/jwt');
const { sendEmail } = require('../config/mailer');
const logger = require('../utils/logger');

const generateTokens = (user) => {
  const payload = { id: user.id, role: user.role, email: user.email };
  const token = jwt.sign(payload, jwtConfig.secret, { expiresIn: jwtConfig.expiresIn });
  const refreshToken = jwt.sign(payload, jwtConfig.refreshSecret, { expiresIn: jwtConfig.refreshExpiresIn });
  return { token, refreshToken };
};

// POST /api/auth/register
const register = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { email, password, firstName, lastName, role, phone, department } = req.body;

    const existing = await User.findOne({ where: { email: email.toLowerCase() } });
    if (existing) {
      return res.status(409).json({ success: false, message: 'An account with this email already exists.' });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await User.create({
      email: email.toLowerCase(),
      passwordHash,
      firstName,
      lastName,
      role: role || 'intern',
      phone,
      department,
      isVerified: true, // Auto-verified in Phase 1
    });

    // Placeholder email notification
    await sendEmail({
      to: user.email,
      subject: 'Welcome to the Internship Portal!',
      text: `Hi ${user.firstName}, your account has been created successfully.`,
    });

    const { token, refreshToken } = generateTokens(user);

    logger.info(`New user registered: ${user.email} (${user.role})`);

    return res.status(201).json({
      success: true,
      message: 'Account created successfully.',
      data: {
        token,
        refreshToken,
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          avatar: user.avatar,
          department: user.department,
        },
      },
    });
  } catch (err) {
    next(err);
  }
};

// POST /api/auth/login
const login = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { email, password } = req.body;

    const user = await User.findOne({ where: { email: email.toLowerCase() } });
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    if (!user.isActive) {
      return res.status(403).json({ success: false, message: 'Your account has been deactivated. Contact administrator.' });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    await user.update({ lastLogin: new Date() });
    const { token, refreshToken } = generateTokens(user);

    logger.info(`User logged in: ${user.email}`);

    return res.json({
      success: true,
      message: 'Login successful.',
      data: {
        token,
        refreshToken,
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          avatar: user.avatar,
          department: user.department,
          phone: user.phone,
          bio: user.bio,
          lastLogin: user.lastLogin,
        },
      },
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/auth/me
const getMe = async (req, res) => {
  return res.json({
    success: true,
    data: {
      id: req.user.id,
      email: req.user.email,
      firstName: req.user.firstName,
      lastName: req.user.lastName,
      role: req.user.role,
      avatar: req.user.avatar,
      phone: req.user.phone,
      department: req.user.department,
      bio: req.user.bio,
      isVerified: req.user.isVerified,
      lastLogin: req.user.lastLogin,
      createdAt: req.user.createdAt,
    },
  });
};

// POST /api/auth/refresh-token
const refreshToken = async (req, res, next) => {
  try {
    const { refreshToken: token } = req.body;
    if (!token) {
      return res.status(400).json({ success: false, message: 'Refresh token required.' });
    }

    const decoded = jwt.verify(token, jwtConfig.refreshSecret);
    const user = await User.findByPk(decoded.id);
    if (!user || !user.isActive) {
      return res.status(401).json({ success: false, message: 'Invalid refresh token.' });
    }

    const tokens = generateTokens(user);
    return res.json({ success: true, data: tokens });
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ success: false, message: 'Refresh token expired. Please log in again.' });
    }
    next(err);
  }
};

// POST /api/auth/forgot-password (placeholder)
const forgotPassword = async (req, res) => {
  const { email } = req.body;
  // In Phase 1, we just acknowledge and log
  const user = await User.findOne({ where: { email: email?.toLowerCase() } });
  if (user) {
    await sendEmail({
      to: email,
      subject: 'Password Reset Request',
      text: `[Phase 1 Placeholder] A password reset link would be sent here in production.`,
    });
  }
  // Always return success to prevent email enumeration
  return res.json({ success: true, message: 'If an account exists, a reset link has been sent.' });
};

// POST /api/auth/reset-password (placeholder)
const resetPassword = async (req, res) => {
  return res.json({ success: true, message: 'Password reset placeholder. Full implementation in Phase 2.' });
};

// POST /api/auth/logout
const logout = async (req, res) => {
  // With stateless JWT, client deletes the token
  // Here we log the event
  logger.info(`User logged out: ${req.user?.email}`);
  return res.json({ success: true, message: 'Logged out successfully.' });
};

module.exports = { register, login, getMe, refreshToken, forgotPassword, resetPassword, logout };
