const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Notification = sequelize.define('Notification', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  userId: { type: DataTypes.UUID, allowNull: false },
  type: {
    type: DataTypes.ENUM(
      'task_assigned', 'task_updated', 'task_due',
      'report_submitted', 'report_reviewed',
      'meeting_scheduled', 'meeting_reminder',
      'announcement', 'feedback_received',
      'system', 'deadline_reminder'
    ),
    defaultValue: 'system',
  },
  title: { type: DataTypes.STRING, allowNull: false },
  body: { type: DataTypes.TEXT, allowNull: true },
  isRead: { type: DataTypes.BOOLEAN, defaultValue: false },
  actionUrl: { type: DataTypes.STRING, allowNull: true },
  metadata: {
    type: DataTypes.TEXT,
    allowNull: true,
    get() {
      const val = this.getDataValue('metadata');
      try { return val ? JSON.parse(val) : null; } catch { return null; }
    },
    set(val) { this.setDataValue('metadata', val ? JSON.stringify(val) : null); },
  },
}, { tableName: 'notifications' });

module.exports = Notification;
