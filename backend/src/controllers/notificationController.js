const { Notification } = require('../models');
const { createError } = require('../middleware/errorHandler');

// GET /api/notifications
const listNotifications = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, isRead } = req.query;
    const where = { userId: req.user.id };
    if (isRead !== undefined) where.isRead = isRead === 'true';
    const offset = (parseInt(page) - 1) * parseInt(limit);
    const { count, rows } = await Notification.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset,
      order: [['createdAt', 'DESC']],
    });
    const unreadCount = await Notification.count({ where: { userId: req.user.id, isRead: false } });
    return res.json({ success: true, data: { notifications: rows, total: count, unreadCount } });
  } catch (err) { next(err); }
};

// PUT /api/notifications/:id/read
const markRead = async (req, res, next) => {
  try {
    const n = await Notification.findOne({ where: { id: req.params.id, userId: req.user.id } });
    if (!n) return next(createError(404, 'Notification not found.'));
    await n.update({ isRead: true });
    return res.json({ success: true, data: n });
  } catch (err) { next(err); }
};

// PUT /api/notifications/read-all
const markAllRead = async (req, res, next) => {
  try {
    await Notification.update({ isRead: true }, { where: { userId: req.user.id, isRead: false } });
    return res.json({ success: true, message: 'All notifications marked as read.' });
  } catch (err) { next(err); }
};

// DELETE /api/notifications/:id
const deleteNotification = async (req, res, next) => {
  try {
    const n = await Notification.findOne({ where: { id: req.params.id, userId: req.user.id } });
    if (!n) return next(createError(404, 'Notification not found.'));
    await n.destroy();
    return res.json({ success: true, message: 'Notification deleted.' });
  } catch (err) { next(err); }
};

// GET /api/notifications/unread-count
const getUnreadCount = async (req, res, next) => {
  try {
    const count = await Notification.count({ where: { userId: req.user.id, isRead: false } });
    return res.json({ success: true, data: { count } });
  } catch (err) { next(err); }
};

module.exports = { listNotifications, markRead, markAllRead, deleteNotification, getUnreadCount };
