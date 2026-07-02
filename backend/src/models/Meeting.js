const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Meeting = sequelize.define('Meeting', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  title: { type: DataTypes.STRING, allowNull: false },
  description: { type: DataTypes.TEXT, allowNull: true },
  organizerId: { type: DataTypes.UUID, allowNull: false },
  attendees: {
    type: DataTypes.TEXT,
    allowNull: true,
    get() {
      const val = this.getDataValue('attendees');
      try { return val ? JSON.parse(val) : []; } catch { return []; }
    },
    set(val) { this.setDataValue('attendees', JSON.stringify(val || [])); },
  },
  scheduledAt: { type: DataTypes.DATE, allowNull: false },
  durationMins: { type: DataTypes.INTEGER, defaultValue: 60 },
  location: { type: DataTypes.STRING, allowNull: true },
  meetingUrl: { type: DataTypes.STRING, allowNull: true },
  notes: { type: DataTypes.TEXT, allowNull: true },
  status: {
    type: DataTypes.ENUM('scheduled', 'completed', 'cancelled', 'rescheduled'),
    defaultValue: 'scheduled',
  },
  type: {
    type: DataTypes.ENUM('one_on_one', 'team', 'review', 'standup', 'other'),
    defaultValue: 'one_on_one',
  },
}, { tableName: 'meetings' });

module.exports = Meeting;
