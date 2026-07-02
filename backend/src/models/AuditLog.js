const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const AuditLog = sequelize.define('AuditLog', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  userId: { type: DataTypes.UUID, allowNull: true },
  action: { type: DataTypes.STRING, allowNull: false },
  entityType: { type: DataTypes.STRING, allowNull: true },
  entityId: { type: DataTypes.STRING, allowNull: true },
  changes: {
    type: DataTypes.TEXT,
    allowNull: true,
    get() {
      const val = this.getDataValue('changes');
      try { return val ? JSON.parse(val) : null; } catch { return val; }
    },
    set(val) {
      this.setDataValue('changes', val ? JSON.stringify(val) : null);
    },
  },
  ipAddress: { type: DataTypes.STRING, allowNull: true },
  userAgent: { type: DataTypes.STRING, allowNull: true },
}, { tableName: 'audit_logs' });

module.exports = AuditLog;
