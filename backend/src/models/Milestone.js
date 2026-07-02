const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Milestone = sequelize.define('Milestone', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  projectId: { type: DataTypes.UUID, allowNull: false },
  name: { type: DataTypes.STRING, allowNull: false },
  description: { type: DataTypes.TEXT, allowNull: true },
  dueDate: { type: DataTypes.DATEONLY, allowNull: true },
  status: {
    type: DataTypes.ENUM('pending', 'in_progress', 'completed', 'missed'),
    defaultValue: 'pending',
  },
}, { tableName: 'milestones' });

module.exports = Milestone;
