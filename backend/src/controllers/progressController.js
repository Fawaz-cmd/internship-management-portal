const { Op, fn, col, literal } = require('sequelize');
const { DailyUpdate, WeeklyReport, SkillAssessment, InternProfile, User, Task } = require('../models');
const { createError } = require('../middleware/errorHandler');

// POST /api/progress/daily
const submitDailyUpdate = async (req, res, next) => {
  try {
    const { date, summary, blockers, mood, hoursWorked, tasksCompleted, plansForTomorrow } = req.body;
    const today = date || new Date().toISOString().split('T')[0];
    const existing = await DailyUpdate.findOne({ where: { userId: req.user.id, date: today } });
    if (existing) {
      await existing.update({ summary, blockers, mood, hoursWorked, tasksCompleted, plansForTomorrow });
      return res.json({ success: true, message: 'Daily update saved.', data: existing });
    }
    const update = await DailyUpdate.create({ userId: req.user.id, date: today, summary, blockers, mood, hoursWorked, tasksCompleted, plansForTomorrow });
    return res.status(201).json({ success: true, message: 'Daily update submitted.', data: update });
  } catch (err) { next(err); }
};

// GET /api/progress/daily
const getDailyUpdates = async (req, res, next) => {
  try {
    const { userId, from, to, page = 1, limit = 20 } = req.query;
    const where = {};
    if (req.user.role === 'intern') where.userId = req.user.id;
    else if (userId) where.userId = userId;
    if (from || to) {
      where.date = {};
      if (from) where.date[Op.gte] = from;
      if (to) where.date[Op.lte] = to;
    }
    const offset = (parseInt(page) - 1) * parseInt(limit);
    const { count, rows } = await DailyUpdate.findAndCountAll({
      where,
      include: [{ model: User, as: 'user', attributes: ['id', 'firstName', 'lastName', 'avatar'] }],
      limit: parseInt(limit),
      offset,
      order: [['date', 'DESC']],
    });
    return res.json({ success: true, data: { updates: rows, total: count } });
  } catch (err) { next(err); }
};

// POST /api/progress/weekly
const submitWeeklyReport = async (req, res, next) => {
  try {
    const { weekStart, accomplishments, goals, challenges, learnings, hoursWorked, selfRating } = req.body;
    const existing = await WeeklyReport.findOne({ where: { userId: req.user.id, weekStart } });
    if (existing) {
      await existing.update({ accomplishments, goals, challenges, learnings, hoursWorked, selfRating, status: 'submitted' });
      return res.json({ success: true, data: existing });
    }
    const report = await WeeklyReport.create({ userId: req.user.id, weekStart, accomplishments, goals, challenges, learnings, hoursWorked, selfRating, status: 'submitted' });
    return res.status(201).json({ success: true, data: report });
  } catch (err) { next(err); }
};

// GET /api/progress/weekly
const getWeeklyReports = async (req, res, next) => {
  try {
    const { userId, status, page = 1, limit = 10 } = req.query;
    const where = {};
    if (req.user.role === 'intern') where.userId = req.user.id;
    else if (userId) where.userId = userId;
    if (status) where.status = status;
    const offset = (parseInt(page) - 1) * parseInt(limit);
    const { count, rows } = await WeeklyReport.findAndCountAll({
      where,
      include: [
        { model: User, as: 'user', attributes: ['id', 'firstName', 'lastName'] },
        { model: User, as: 'reviewer', attributes: ['id', 'firstName', 'lastName'] },
      ],
      limit: parseInt(limit),
      offset,
      order: [['weekStart', 'DESC']],
    });
    return res.json({ success: true, data: { reports: rows, total: count } });
  } catch (err) { next(err); }
};

// PUT /api/progress/weekly/:id/review
const reviewWeeklyReport = async (req, res, next) => {
  try {
    const report = await WeeklyReport.findByPk(req.params.id);
    if (!report) return next(createError(404, 'Report not found.'));
    await report.update({ reviewerId: req.user.id, reviewNote: req.body.reviewNote, reviewedAt: new Date(), status: 'reviewed' });
    return res.json({ success: true, data: report });
  } catch (err) { next(err); }
};

// GET /api/progress/skills
const getSkills = async (req, res, next) => {
  try {
    const internId = req.user.role === 'intern' ? req.user.id : req.query.internId;
    const skills = await SkillAssessment.findAll({
      where: internId ? { internId } : {},
      include: [{ model: User, as: 'assessor', attributes: ['id', 'firstName', 'lastName'] }],
      order: [['assessedAt', 'DESC']],
    });
    return res.json({ success: true, data: skills });
  } catch (err) { next(err); }
};

// POST /api/progress/skills
const addSkill = async (req, res, next) => {
  try {
    const { internId, skillName, category, selfRating, assessorRating, notes, assessedAt } = req.body;
    const targetIntern = req.user.role === 'intern' ? req.user.id : internId;
    const skill = await SkillAssessment.create({
      internId: targetIntern,
      assessorId: req.user.role !== 'intern' ? req.user.id : null,
      skillName, category, selfRating, assessorRating, notes,
      assessedAt: assessedAt || new Date().toISOString().split('T')[0],
    });
    return res.status(201).json({ success: true, data: skill });
  } catch (err) { next(err); }
};

// GET /api/progress/analytics
const getAnalytics = async (req, res, next) => {
  try {
    const internId = req.user.role === 'intern' ? req.user.id : req.query.internId;
    const where = internId ? { assigneeId: internId } : {};

    const totalTasks = await Task.count({ where });
    const doneTasks = await Task.count({ where: { ...where, status: 'done' } });
    const overdueTasks = await Task.count({
      where: { ...where, dueDate: { [Op.lt]: new Date() }, status: { [Op.ne]: 'done' } },
    });

    const profile = internId ? await InternProfile.findOne({ where: { userId: internId } }) : null;

    return res.json({
      success: true,
      data: {
        totalTasks,
        doneTasks,
        overdueTasks,
        completionRate: totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0,
        progressPct: profile?.progressPct || 0,
      },
    });
  } catch (err) { next(err); }
};

module.exports = { submitDailyUpdate, getDailyUpdates, submitWeeklyReport, getWeeklyReports, reviewWeeklyReport, getSkills, addSkill, getAnalytics };
