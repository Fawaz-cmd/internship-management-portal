const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const TaskAttachment = sequelize.define('TaskAttachment', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  taskId: { type: DataTypes.UUID, allowNull: false },
  fileName: { type: DataTypes.STRING, allowNull: false },
  fileUrl: { type: DataTypes.STRING, allowNull: false },
  fileSize: { type: DataTypes.INTEGER, allowNull: true },
  mimeType: { type: DataTypes.STRING, allowNull: true },
  uploadedById: { type: DataTypes.UUID, allowNull: false },
}, { tableName: 'task_attachments' });

module.exports = TaskAttachment;
