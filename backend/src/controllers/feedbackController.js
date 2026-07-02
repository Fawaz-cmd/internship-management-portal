const { Feedback, User } = require('../models');
const { createError } = require('../middleware/errorHandler');

// POST /api/feedback
const createFeedback = async (req, res, next) => {
  try {
    const { internId, type, period, ratings, overallRating, strengths, improvements, comments, isSharedWithIntern } = req.body;
    const feedback = await Feedback.create({
      internId,
      reviewerId: req.user.id,
      type, period, ratings, overallRating, strengths, improvements, comments, isSharedWithIntern,
    });
    return res.status(201).json({ success: true, data: feedback });
  } catch (err) { next(err); }
};

// GET /api/feedback
const listFeedback = async (req, res, next) => {
  try {
    const { internId, type } = req.query;
    const where = {};
    if (type) where.type = type;
    if (req.user.role === 'intern') {
      where.internId = req.user.id;
      where.isSharedWithIntern = true;
    } else if (internId) {
      where.internId = internId;
    }
    const feedback = await Feedback.findAll({
      where,
      include: [
        { model: User, as: 'reviewer', attributes: ['id', 'firstName', 'lastName', 'avatar'] },
        { model: User, as: 'intern', attributes: ['id', 'firstName', 'lastName'] },
      ],
      order: [['createdAt', 'DESC']],
    });
    return res.json({ success: true, data: feedback });
  } catch (err) { next(err); }
};

// GET /api/feedback/:id
const getFeedback = async (req, res, next) => {
  try {
    const feedback = await Feedback.findByPk(req.params.id, {
      include: [
        { model: User, as: 'reviewer', attributes: ['id', 'firstName', 'lastName'] },
        { model: User, as: 'intern', attributes: ['id', 'firstName', 'lastName'] },
      ],
    });
    if (!feedback) return next(createError(404, 'Feedback not found.'));
    if (req.user.role === 'intern' && (!feedback.isSharedWithIntern || feedback.internId !== req.user.id)) {
      return next(createError(403, 'Access denied.'));
    }
    return res.json({ success: true, data: feedback });
  } catch (err) { next(err); }
};

// PUT /api/feedback/:id
const updateFeedback = async (req, res, next) => {
  try {
    const feedback = await Feedback.findByPk(req.params.id);
    if (!feedback) return next(createError(404, 'Feedback not found.'));
    if (feedback.reviewerId !== req.user.id && req.user.role !== 'super_admin') {
      return next(createError(403, 'Only the reviewer can edit feedback.'));
    }
    await feedback.update(req.body);
    return res.json({ success: true, data: feedback });
  } catch (err) { next(err); }
};

module.exports = { createFeedback, listFeedback, getFeedback, updateFeedback };
