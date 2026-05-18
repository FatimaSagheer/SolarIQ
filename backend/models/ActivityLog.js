// models/ActivityLog.js (Sequelize model)
const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/postgres');

const ActivityLog = sequelize.define('ActivityLog', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  userId: {
    type: DataTypes.STRING,
    allowNull: false
  },
    userName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  action: {
    type: DataTypes.ENUM(
      'login',
      'logout', 
      'view_dashboard',
      'resolve_fault',
      'view_system'
    ),
    allowNull: false
  },
  ipAddress: {
    type: DataTypes.STRING
  },
  userAgent: {
    type: DataTypes.STRING
  },
  status: {
    type: DataTypes.ENUM('success', 'failed'),
    defaultValue: 'success'
  },
  timestamp: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'activity_logs',
  timestamps: true
});

module.exports = ActivityLog;