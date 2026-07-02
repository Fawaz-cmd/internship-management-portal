const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Attendance = sequelize.define('Attendance', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  userId: { type: DataTypes.UUID, allowNull: false },
  date: { type: DataTypes.DATEONLY, allowNull: false },
  checkIn: { type: DataTypes.TIME, allowNull: true },
  checkOut: { type: DataTypes.TIME, allowNull: true },
  hoursWorked: { type: DataTypes.FLOAT, allowNull: true },
  status: {
    type: DataTypes.ENUM('present', 'absent', 'late', 'wfh', 'holiday', 'leave'),
    defaultValue: 'present',
  },
  notes: { type: DataTypes.TEXT, allowNull: true },
}, {
  tableName: 'attendance',
  indexes: [{ unique: true, fields: ['userId', 'date'] }],
});

module.exports = Attendance;
