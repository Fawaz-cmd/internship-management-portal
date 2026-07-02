const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Feedback = sequelize.define('Feedback', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  internId: { type: DataTypes.UUID, allowNull: false },
  reviewerId: { type: DataTypes.UUID, allowNull: false },
  type: {
    type: DataTypes.ENUM('formal', 'informal', 'mid_term', 'final'),
    defaultValue: 'informal',
  },
  period: { type: DataTypes.STRING, allowNull: true },
  ratings: {
    type: DataTypes.TEXT,
    allowNull: true,
    get() {
      const val = this.getDataValue('ratings');
      try { return val ? JSON.parse(val) : {}; } catch { return {}; }
    },
    set(val) { this.setDataValue('ratings', JSON.stringify(val || {})); },
  },
  overallRating: { type: DataTypes.FLOAT, allowNull: true },
  strengths: { type: DataTypes.TEXT, allowNull: true },
  improvements: { type: DataTypes.TEXT, allowNull: true },
  comments: { type: DataTypes.TEXT, allowNull: true },
  isSharedWithIntern: { type: DataTypes.BOOLEAN, defaultValue: false },
}, { tableName: 'feedback' });

module.exports = Feedback;
