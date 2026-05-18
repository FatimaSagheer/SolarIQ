const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/postgres');

// Tracks active user sessions
const UserSession = sequelize.define('UserSession', {

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

  // JWT token (first 20 chars for identification)
  tokenPreview: {
    type: DataTypes.STRING,
    allowNull: false
  },

  ipAddress: {
    type: DataTypes.STRING
  },

  // When session expires
  expiresAt: {
    type: DataTypes.DATE,
    allowNull: false
  },

  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }

}, {
  tableName: 'user_sessions',
  timestamps: true
});

module.exports = UserSession;