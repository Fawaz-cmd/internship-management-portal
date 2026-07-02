const bcrypt = require('bcryptjs');
const { Op } = require('sequelize');
const { User, InternProfile, AuditLog, Program } = require('../models');
const { createError } = require('../middleware/errorHandler');

// GET /api/users
const listUsers = async (req, res, next) => {
  try {
    const { role, search, page = 1, limit = 20, isActive } = req.query;
    const where = {};
    if (role) where.role = role;
    if (isActive !== undefined) where.isActive = isActive === 'true';
    if (search) {
      where[Op.or] = [
        { firstName: { [Op.like]: `%${search}%` } },
        { lastName: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } },
      ];
    }

    const offset = (parseInt(page) - 1) * parseInt(limit);
    const { count, rows } = await User.findAndCountAll({
      where,
      attributes: { exclude: ['passwordHash'] },
      include: [{ model: InternProfile, as: 'internProfile', required: false }],
      limit: parseInt(limit),
      offset,
      order: [['createdAt', 'DESC']],
    });

    return res.json({
      success: true,
      data: {
        users: rows,
        total: count,
        page: parseInt(page),
        totalPages: Math.ceil(count / parseInt(limit)),
      },
    });
  } catch (err) { next(err); }
};

// POST /api/users
const createUser = async (req, res, next) => {
  try {
    // Only HR, Manager, Admin can create users
    if (!['super_admin', 'hr_coordinator', 'program_manager'].includes(req.user.role)) {
      return next(createError(403, 'You do not have permission to create users.'));
    }

    const { email, password, firstName, lastName, role, phone, department, bio, ...profileData } = req.body;

    const existing = await User.findOne({ where: { email: email.toLowerCase() } });
    if (existing) {
      return next(createError(409, 'An account with this email already exists.'));
    }

    const passwordHash = await bcrypt.hash(password || 'Password@123', 12);
    const user = await User.create({
      email: email.toLowerCase(),
      passwordHash,
      firstName,
      lastName,
      role: role || 'intern',
      phone,
      department,
      bio,
      isVerified: true,
      isActive: true,
    });

    if (user.role === 'intern') {
      await InternProfile.create({
        userId: user.id,
        programId: profileData.programId || null,
        mentorId: profileData.mentorId || null,
        teamLeadId: profileData.teamLeadId || null,
        cohort: profileData.cohort || null,
        startDate: profileData.startDate || null,
        endDate: profileData.endDate || null,
        university: profileData.university || null,
        degree: profileData.degree || null,
        graduationYear: profileData.graduationYear || null,
        status: profileData.status || 'active',
        skills: profileData.skills || [],
      });
    }

    const createdUser = await User.findByPk(user.id, {
      attributes: { exclude: ['passwordHash'] },
      include: [{ model: InternProfile, as: 'internProfile' }]
    });

    return res.status(201).json({ success: true, message: 'User created successfully.', data: createdUser });
  } catch (err) { next(err); }
};

// GET /api/users/:id
const getUser = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.params.id, {
      attributes: { exclude: ['passwordHash'] },
      include: [{ model: InternProfile, as: 'internProfile', include: [{ model: Program, as: 'program' }] }],
    });
    if (!user) return next(createError(404, 'User not found.'));
    return res.json({ success: true, data: user });
  } catch (err) { next(err); }
};

// PUT /api/users/:id
const updateUser = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return next(createError(404, 'User not found.'));

    // Check permissions: only self or HR/Admin/Manager can update
    if (req.user.id !== user.id && !['super_admin', 'hr_coordinator', 'program_manager'].includes(req.user.role)) {
      return next(createError(403, 'You do not have permission to update this user.'));
    }

    // Only admins can change roles
    if (req.body.role && req.user.role !== 'super_admin' && req.user.role !== 'hr_coordinator') {
      return next(createError(403, 'You cannot change user roles.'));
    }

    const allowed = ['firstName', 'lastName', 'phone', 'department', 'bio', 'avatar', 'role', 'isActive'];
    const updates = {};
    allowed.forEach((key) => { if (req.body[key] !== undefined) updates[key] = req.body[key]; });

    // Password change
    if (req.body.password) {
      updates.passwordHash = await bcrypt.hash(req.body.password, 12);
    }

    await user.update(updates);

    // Update InternProfile if role is intern
    if (user.role === 'intern') {
      const [profile] = await InternProfile.findOrCreate({
        where: { userId: user.id }
      });
      
      const profileUpdates = {};
      const profileFields = ['programId', 'mentorId', 'teamLeadId', 'cohort', 'startDate', 'endDate', 'university', 'degree', 'graduationYear', 'status', 'skills'];
      profileFields.forEach((key) => {
        if (req.body[key] !== undefined) {
          profileUpdates[key] = req.body[key];
        }
      });
      
      if (Object.keys(profileUpdates).length > 0) {
        await profile.update(profileUpdates);
      }
    }

    const updated = await User.findByPk(user.id, {
      attributes: { exclude: ['passwordHash'] },
      include: [{ model: InternProfile, as: 'internProfile' }]
    });
    return res.json({ success: true, message: 'User updated.', data: updated });
  } catch (err) { next(err); }
};

// DELETE /api/users/:id  (soft delete — deactivate)
const deactivateUser = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return next(createError(404, 'User not found.'));
    if (user.id === req.user.id) return next(createError(400, 'You cannot deactivate your own account.'));
    await user.update({ isActive: false });
    return res.json({ success: true, message: 'User deactivated.' });
  } catch (err) { next(err); }
};

// GET /api/users/:id/audit-logs
const getUserAuditLogs = async (req, res, next) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);
    const { count, rows } = await AuditLog.findAndCountAll({
      where: { userId: req.params.id },
      limit: parseInt(limit),
      offset,
      order: [['createdAt', 'DESC']],
    });
    return res.json({ success: true, data: { logs: rows, total: count } });
  } catch (err) { next(err); }
};

// GET /api/users/audit-logs (all logs for admin)
const getAllAuditLogs = async (req, res, next) => {
  try {
    const { page = 1, limit = 30, action, userId } = req.query;
    const where = {};
    if (action) where.action = { [Op.like]: `%${action}%` };
    if (userId) where.userId = userId;
    const offset = (parseInt(page) - 1) * parseInt(limit);
    const { count, rows } = await AuditLog.findAndCountAll({
      where,
      include: [{ model: User, as: 'user', attributes: ['id', 'firstName', 'lastName', 'email', 'role'] }],
      limit: parseInt(limit),
      offset,
      order: [['createdAt', 'DESC']],
    });
    return res.json({ success: true, data: { logs: rows, total: count } });
  } catch (err) { next(err); }
};

// GET /api/users/stats
const getStats = async (req, res, next) => {
  try {
    const total = await User.count();
    const byRole = await User.findAll({
      attributes: ['role', [require('sequelize').fn('COUNT', require('sequelize').col('id')), 'count']],
      group: ['role'],
      raw: true,
    });
    const active = await User.count({ where: { isActive: true } });
    return res.json({ success: true, data: { total, active, inactive: total - active, byRole } });
  } catch (err) { next(err); }
};

module.exports = { listUsers, getUser, createUser, updateUser, deactivateUser, getUserAuditLogs, getAllAuditLogs, getStats };
