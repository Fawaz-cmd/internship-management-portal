const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Deliverable = sequelize.define('Deliverable', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  projectId: { type: DataTypes.UUID, allowNull: false },
  sprintId: { type: DataTypes.UUID, allowNull: true },
  name: { type: DataTypes.STRING, allowNull: false },
  description: { type: DataTypes.TEXT, allowNull: true },
  dueDate: { type: DataTypes.DATEONLY, allowNull: true },
  status: {
    type: DataTypes.ENUM('pending', 'in_progress', 'submitted', 'approved', 'rejected'),
    defaultValue: 'pending',
  },
  assigneeId: { type: DataTypes.UUID, allowNull: true },
}, { tableName: 'deliverables' });

module.exports = Deliverable;
