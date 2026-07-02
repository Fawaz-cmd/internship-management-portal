const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const WeeklyReport = sequelize.define('WeeklyReport', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  userId: { type: DataTypes.UUID, allowNull: false },
  weekStart: { type: DataTypes.DATEONLY, allowNull: false },
  accomplishments: { type: DataTypes.TEXT, allowNull: false },
  goals: { type: DataTypes.TEXT, allowNull: true },
  challenges: { type: DataTypes.TEXT, allowNull: true },
  learnings: { type: DataTypes.TEXT, allowNull: true },
  hoursWorked: { type: DataTypes.FLOAT, allowNull: true },
  selfRating: { type: DataTypes.INTEGER, allowNull: true },
  reviewerId: { type: DataTypes.UUID, allowNull: true },
  reviewNote: { type: DataTypes.TEXT, allowNull: true },
  reviewedAt: { type: DataTypes.DATE, allowNull: true },
  status: {
    type: DataTypes.ENUM('draft', 'submitted', 'reviewed'),
    defaultValue: 'draft',
  },
}, { tableName: 'weekly_reports' });

module.exports = WeeklyReport;
