const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Task = sequelize.define('Task', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  title: { type: DataTypes.STRING, allowNull: false },
  description: { type: DataTypes.TEXT, allowNull: true },
  projectId: { type: DataTypes.UUID, allowNull: true },
  sprintId: { type: DataTypes.UUID, allowNull: true },
  milestoneId: { type: DataTypes.UUID, allowNull: true },
  assigneeId: { type: DataTypes.UUID, allowNull: true },
  assignerId: { type: DataTypes.UUID, allowNull: true },
  priority: {
    type: DataTypes.ENUM('low', 'medium', 'high', 'critical'),
    defaultValue: 'medium',
  },
  status: {
    type: DataTypes.ENUM('todo', 'in_progress', 'review', 'done', 'blocked'),
    defaultValue: 'todo',
  },
  dueDate: { type: DataTypes.DATEONLY, allowNull: true },
  startDate: { type: DataTypes.DATEONLY, allowNull: true },
  estimatedHours: { type: DataTypes.FLOAT, allowNull: true },
  actualHours: { type: DataTypes.FLOAT, allowNull: true },
  parentTaskId: { type: DataTypes.UUID, allowNull: true },
  isRecurring: { type: DataTypes.BOOLEAN, defaultValue: false },
  recurrenceRule: { type: DataTypes.STRING, allowNull: true },
  tags: {
    type: DataTypes.TEXT,
    allowNull: true,
    get() {
      const val = this.getDataValue('tags');
      try { return val ? JSON.parse(val) : []; } catch { return []; }
    },
    set(val) { this.setDataValue('tags', JSON.stringify(val || [])); },
  },
  order: { type: DataTypes.INTEGER, defaultValue: 0 },
  completedAt: { type: DataTypes.DATE, allowNull: true },
}, { tableName: 'tasks' });

module.exports = Task;
