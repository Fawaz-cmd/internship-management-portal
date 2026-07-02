const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const DailyUpdate = sequelize.define('DailyUpdate', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  userId: { type: DataTypes.UUID, allowNull: false },
  date: { type: DataTypes.DATEONLY, allowNull: false },
  summary: { type: DataTypes.TEXT, allowNull: false },
  blockers: { type: DataTypes.TEXT, allowNull: true },
  mood: {
    type: DataTypes.ENUM('great', 'good', 'okay', 'frustrated', 'stuck'),
    allowNull: true,
  },
  hoursWorked: { type: DataTypes.FLOAT, allowNull: true },
  tasksCompleted: {
    type: DataTypes.TEXT,
    allowNull: true,
    get() {
      const val = this.getDataValue('tasksCompleted');
      try { return val ? JSON.parse(val) : []; } catch { return []; }
    },
    set(val) { this.setDataValue('tasksCompleted', JSON.stringify(val || [])); },
  },
  plansForTomorrow: { type: DataTypes.TEXT, allowNull: true },
}, { tableName: 'daily_updates' });

module.exports = DailyUpdate;
