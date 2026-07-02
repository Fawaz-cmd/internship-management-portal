const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Project = sequelize.define('Project', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  name: { type: DataTypes.STRING, allowNull: false },
  description: { type: DataTypes.TEXT, allowNull: true },
  programId: { type: DataTypes.UUID, allowNull: true },
  createdById: { type: DataTypes.UUID, allowNull: false },
  status: {
    type: DataTypes.ENUM('planning', 'active', 'on_hold', 'completed', 'cancelled'),
    defaultValue: 'planning',
  },
  startDate: { type: DataTypes.DATEONLY, allowNull: true },
  endDate: { type: DataTypes.DATEONLY, allowNull: true },
  priority: {
    type: DataTypes.ENUM('low', 'medium', 'high', 'critical'),
    defaultValue: 'medium',
  },
  tags: {
    type: DataTypes.TEXT,
    allowNull: true,
    get() {
      const val = this.getDataValue('tags');
      try { return val ? JSON.parse(val) : []; } catch { return []; }
    },
    set(val) { this.setDataValue('tags', JSON.stringify(val || [])); },
  },
  progressPct: { type: DataTypes.FLOAT, defaultValue: 0 },
}, { tableName: 'projects' });

module.exports = Project;
