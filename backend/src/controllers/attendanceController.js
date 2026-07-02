const { Attendance } = require('../models');
const { createError } = require('../middleware/errorHandler');
const { Op } = require('sequelize');

// POST /api/attendance/check-in
const checkIn = async (req, res, next) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const existing = await Attendance.findOne({ where: { userId: req.user.id, date: today } });
    if (existing) return next(createError(409, 'Already checked in today.'));
    const now = new Date().toTimeString().split(' ')[0];
    const record = await Attendance.create({ userId: req.user.id, date: today, checkIn: now, status: 'present' });
    return res.status(201).json({ success: true, message: 'Checked in.', data: record });
  } catch (err) { next(err); }
};

// POST /api/attendance/check-out
const checkOut = async (req, res, next) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const record = await Attendance.findOne({ where: { userId: req.user.id, date: today } });
    if (!record) return next(createError(404, 'No check-in found for today.'));
    if (record.checkOut) return next(createError(409, 'Already checked out today.'));
    const now = new Date().toTimeString().split(' ')[0];
    const checkInTime = new Date(`1970-01-01T${record.checkIn}`);
    const checkOutTime = new Date(`1970-01-01T${now}`);
    const hoursWorked = (checkOutTime - checkInTime) / 3600000;
    await record.update({ checkOut: now, hoursWorked: parseFloat(hoursWorked.toFixed(2)) });
    return res.json({ success: true, message: 'Checked out.', data: record });
  } catch (err) { next(err); }
};

// GET /api/attendance
const getAttendance = async (req, res, next) => {
  try {
    const { userId, from, to, page = 1, limit = 30 } = req.query;
    const where = {};
    if (req.user.role === 'intern') where.userId = req.user.id;
    else if (userId) where.userId = userId;
    if (from || to) {
      where.date = {};
      if (from) where.date[Op.gte] = from;
      if (to) where.date[Op.lte] = to;
    }
    const offset = (parseInt(page) - 1) * parseInt(limit);
    const { count, rows } = await Attendance.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset,
      order: [['date', 'DESC']],
    });
    return res.json({ success: true, data: { records: rows, total: count } });
  } catch (err) { next(err); }
};

// GET /api/attendance/today
const getTodayStatus = async (req, res, next) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const record = await Attendance.findOne({ where: { userId: req.user.id, date: today } });
    return res.json({ success: true, data: record });
  } catch (err) { next(err); }
};

module.exports = { checkIn, checkOut, getAttendance, getTodayStatus };
