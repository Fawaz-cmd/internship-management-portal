const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Sprint = sequelize.define('Sprint', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  projectId: { type: DataTypes.UUID, allowNull: false },
  name: { type: DataTypes.STRING, allowNull: false },
  goal: { type: DataTypes.TEXT, allowNull: true },
  startDate: { type: DataTypes.DATEONLY, allowNull: true },
  endDate: { type: DataTypes.DATEONLY, allowNull: true },
  status: {
    type: DataTypes.ENUM('planned', 'active', 'completed', 'cancelled'),
    defaultValue: 'planned',
  },
  order: { type: DataTypes.INTEGER, defaultValue: 1 },
}, { tableName: 'sprints' });

module.exports = Sprint;
