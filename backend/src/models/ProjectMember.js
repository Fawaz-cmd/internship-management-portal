const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const ProjectMember = sequelize.define('ProjectMember', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  projectId: { type: DataTypes.UUID, allowNull: false },
  userId: { type: DataTypes.UUID, allowNull: false },
  role: {
    type: DataTypes.ENUM('lead', 'member', 'observer'),
    defaultValue: 'member',
  },
}, { tableName: 'project_members' });

module.exports = ProjectMember;
