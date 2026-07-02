const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const InternProfile = sequelize.define('InternProfile', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  userId: { type: DataTypes.UUID, allowNull: false, unique: true },
  programId: { type: DataTypes.UUID, allowNull: true },
  mentorId: { type: DataTypes.UUID, allowNull: true },
  teamLeadId: { type: DataTypes.UUID, allowNull: true },
  cohort: { type: DataTypes.STRING, allowNull: true },
  startDate: { type: DataTypes.DATEONLY, allowNull: true },
  endDate: { type: DataTypes.DATEONLY, allowNull: true },
  progressPct: { type: DataTypes.FLOAT, defaultValue: 0 },
  skills: {
    type: DataTypes.TEXT,
    allowNull: true,
    get() {
      const val = this.getDataValue('skills');
      try { return val ? JSON.parse(val) : []; } catch { return []; }
    },
    set(val) { this.setDataValue('skills', JSON.stringify(val || [])); },
  },
  university: { type: DataTypes.STRING, allowNull: true },
  degree: { type: DataTypes.STRING, allowNull: true },
  graduationYear: { type: DataTypes.INTEGER, allowNull: true },
  status: {
    type: DataTypes.ENUM('active', 'completed', 'withdrawn', 'on_hold'),
    defaultValue: 'active',
  },
}, { tableName: 'intern_profiles' });

module.exports = InternProfile;
