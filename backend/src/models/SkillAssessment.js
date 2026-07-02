const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const SkillAssessment = sequelize.define('SkillAssessment', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  internId: { type: DataTypes.UUID, allowNull: false },
  assessorId: { type: DataTypes.UUID, allowNull: true },
  skillName: { type: DataTypes.STRING, allowNull: false },
  category: { type: DataTypes.STRING, allowNull: true },
  selfRating: { type: DataTypes.INTEGER, allowNull: true },
  assessorRating: { type: DataTypes.INTEGER, allowNull: true },
  notes: { type: DataTypes.TEXT, allowNull: true },
  assessedAt: { type: DataTypes.DATEONLY, allowNull: true },
}, { tableName: 'skill_assessments' });

module.exports = SkillAssessment;
