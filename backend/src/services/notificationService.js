const { Notification } = require('../models');
const logger = require('../utils/logger');

/**
 * Create a notification in the database
 * @param {Object} opts
 * @param {string} opts.userId
 * @param {string} opts.type
 * @param {string} opts.title
 * @param {string} opts.body
 * @param {string} [opts.actionUrl]
 * @param {Object} [opts.metadata]
 */
const create = async ({ userId, type = 'system', title, body, actionUrl = null, metadata = null }) => {
  try {
    const notification = await Notification.create({ userId, type, title, body, actionUrl, metadata });
    return notification;
  } catch (err) {
    logger.error('Failed to create notification:', err.message);
    return null;
  }
};

/**
 * Create notifications for multiple users
 */
const createBulk = async (userIds, opts) => {
  try {
    const notifications = userIds.map(userId => ({ ...opts, userId }));
    await Notification.bulkCreate(notifications);
  } catch (err) {
    logger.error('Bulk notification failed:', err.message);
  }
};

module.exports = { create, createBulk };
