const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const RefreshToken = sequelize.define('RefreshToken', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    token: {
      type: DataTypes.TEXT,
      allowNull: false,
      unique: true
    },
    expiresAt: {
      type: DataTypes.DATE,
      allowNull: false
    },
    isRevoked: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    deviceInfo: {
      type: DataTypes.JSONB,
      allowNull: true,
      comment: 'Device information for tracking sessions'
    }
  }, {
    tableName: 'refresh_tokens',
    indexes: [
      {
        fields: ['userId']
      },
      {
        unique: true,
        fields: ['token']
      },
      {
        fields: ['expiresAt']
      }
    ]
  });

  // Instance methods
  RefreshToken.prototype.isExpired = function() {
    return Date.now() >= this.expiresAt.getTime();
  };

  RefreshToken.prototype.isValid = function() {
    return !this.isRevoked && !this.isExpired();
  };

  // Associations
  RefreshToken.associate = (models) => {
    RefreshToken.belongsTo(models.User, {
      foreignKey: 'userId',
      as: 'user'
    });
  };

  return RefreshToken;
};
