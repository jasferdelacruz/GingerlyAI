const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Prediction = sequelize.define('Prediction', {
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
    remedyId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'remedies',
        key: 'id'
      }
    },
    modelId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'models',
        key: 'id'
      }
    },
    imageUrl: {
      type: DataTypes.STRING,
      allowNull: false
    },
    predictionResults: {
      type: DataTypes.JSON,
      allowNull: false,
      comment: 'Stores ML model prediction results with confidence scores'
    },
    topPrediction: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: 'The disease class with highest confidence'
    },
    confidence: {
      type: DataTypes.DECIMAL(5, 4),
      allowNull: false,
      validate: {
        min: 0,
        max: 1
      },
      comment: 'Confidence score for top prediction (0-1)'
    },
    isOfflinePrediction: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      comment: 'Whether prediction was made offline on device'
    },
    deviceInfo: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: 'Device information where prediction was made'
    },
    location: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: 'GPS coordinates where image was captured'
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    synced: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      comment: 'Whether this prediction has been synced to server'
    },
    syncedAt: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    tableName: 'predictions',
    indexes: [
      {
        fields: ['userId']
      },
      {
        fields: ['remedyId']
      },
      {
        fields: ['topPrediction']
      },
      {
        fields: ['confidence']
      },
      {
        fields: ['synced']
      },
      {
        fields: ['createdAt']
      }
    ]
  });

  // Associations
  Prediction.associate = (models) => {
    Prediction.belongsTo(models.User, {
      foreignKey: 'userId',
      as: 'user'
    });
    
    Prediction.belongsTo(models.Remedy, {
      foreignKey: 'remedyId',
      as: 'remedy'
    });
    
    Prediction.belongsTo(models.Model, {
      foreignKey: 'modelId',
      as: 'model'
    });
  };

  return Prediction;
};
