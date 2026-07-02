const { Op } = require('sequelize');
const { Meeting, User } = require('../models');
const { createError } = require('../middleware/errorHandler');
const notificationService = require('../services/notificationService');

// GET /api/meetings
const listMeetings = async (req, res, next) => {
  try {
    const { from, to, status, type } = req.query;
    const where = {};
    if (status) where.status = status;
    if (type) where.type = type;
    if (from || to) {
      where.scheduledAt = {};
      if (from) where.scheduledAt[Op.gte] = new Date(from);
      if (to) where.scheduledAt[Op.lte] = new Date(to);
    }

    const meetings = await Meeting.findAll({
      where,
      include: [{ model: User, as: 'organizer', attributes: ['id', 'firstName', 'lastName', 'avatar'] }],
      order: [['scheduledAt', 'ASC']],
    });

    // Filter to meetings user is in
    const userMeetings = req.user.role === 'super_admin'
      ? meetings
      : meetings.filter(m => m.organizerId === req.user.id || (m.attendees || []).includes(req.user.id));

    return res.json({ success: true, data: userMeetings });
  } catch (err) { next(err); }
};

// GET /api/meetings/upcoming
const getUpcoming = async (req, res, next) => {
  try {
    const meetings = await Meeting.findAll({
      where: { scheduledAt: { [Op.gte]: new Date() }, status: 'scheduled' },
      include: [{ model: User, as: 'organizer', attributes: ['id', 'firstName', 'lastName'] }],
      order: [['scheduledAt', 'ASC']],
      limit: 10,
    });
    const userMeetings = meetings.filter(
      m => m.organizerId === req.user.id || (m.attendees || []).includes(req.user.id)
    );
    return res.json({ success: true, data: userMeetings });
  } catch (err) { next(err); }
};

// POST /api/meetings
const createMeeting = async (req, res, next) => {
  try {
    const { title, description, attendees, scheduledAt, durationMins, location, meetingUrl, type } = req.body;
    const meeting = await Meeting.create({
      title, description, attendees, scheduledAt, durationMins, location, meetingUrl, type,
      organizerId: req.user.id,
    });

    // Notify attendees
    if (attendees && attendees.length) {
      await Promise.all(attendees.map(aid => {
        if (aid !== req.user.id) {
          return notificationService.create({
            userId: aid,
            type: 'meeting_scheduled',
            title: 'Meeting Scheduled',
            body: `${req.user.firstName} scheduled "${title}" for ${new Date(scheduledAt).toLocaleString()}`,
            actionUrl: `/meetings/${meeting.id}`,
          });
        }
      }));
    }

    return res.status(201).json({ success: true, data: meeting });
  } catch (err) { next(err); }
};

// GET /api/meetings/:id
const getMeeting = async (req, res, next) => {
  try {
    const meeting = await Meeting.findByPk(req.params.id, {
      include: [{ model: User, as: 'organizer', attributes: ['id', 'firstName', 'lastName', 'avatar'] }],
    });
    if (!meeting) return next(createError(404, 'Meeting not found.'));
    return res.json({ success: true, data: meeting });
  } catch (err) { next(err); }
};

// PUT /api/meetings/:id
const updateMeeting = async (req, res, next) => {
  try {
    const meeting = await Meeting.findByPk(req.params.id);
    if (!meeting) return next(createError(404, 'Meeting not found.'));
    if (meeting.organizerId !== req.user.id && req.user.role !== 'super_admin') {
      return next(createError(403, 'Only the organizer can update this meeting.'));
    }
    await meeting.update(req.body);
    return res.json({ success: true, data: meeting });
  } catch (err) { next(err); }
};

// DELETE /api/meetings/:id
const deleteMeeting = async (req, res, next) => {
  try {
    const meeting = await Meeting.findByPk(req.params.id);
    if (!meeting) return next(createError(404, 'Meeting not found.'));
    await meeting.destroy();
    return res.json({ success: true, message: 'Meeting cancelled.' });
  } catch (err) { next(err); }
};

module.exports = { listMeetings, getUpcoming, createMeeting, getMeeting, updateMeeting, deleteMeeting };
