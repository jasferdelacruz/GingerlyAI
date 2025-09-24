const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Model = sequelize.define('Model', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
        len: [2, 100]
      }
    },
    version: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true
      }
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    modelPath: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: 'Path to model.json file'
    },
    weightsPath: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: 'Path to model weights (.bin files)'
    },
    modelSize: {
      type: DataTypes.BIGINT,
      allowNull: false,
      comment: 'Model size in bytes'
    },
    inputShape: {
      type: DataTypes.JSONB,
      allowNull: false,
      comment: 'Expected input shape for the model'
    },
    outputClasses: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      allowNull: false,
      comment: 'List of disease classes the model can predict'
    },
    accuracy: {
      type: DataTypes.DECIMAL(5, 4),
      allowNull: true,
      validate: {
        min: 0,
        max: 1
      },
      comment: 'Model accuracy on test set'
    },
    trainingDate: {
      type: DataTypes.DATE,
      allowNull: true
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      comment: 'Whether this model version is currently active'
    },
    isDefault: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      comment: 'Whether this is the default model for new installs'
    },
    downloadUrl: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: 'Public URL for mobile apps to download the model'
    },
    checksum: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: 'MD5/SHA256 checksum for integrity verification'
    },
    metadata: {
      type: DataTypes.JSONB,
      allowNull: true,
      comment: 'Additional model metadata (framework, architecture, etc.)'
    }
  }, {
    tableName: 'models',
    indexes: [
      {
        unique: true,
        fields: ['name', 'version']
      },
      {
        fields: ['isActive']
      },
      {
        fields: ['isDefault']
      }
    ],
    hooks: {
      beforeCreate: async (model) => {
        // Ensure only one default model
        if (model.isDefault) {
          await Model.update({ isDefault: false }, { where: {} });
        }
        // Ensure only one active model per name
        if (model.isActive) {
          await Model.update(
            { isActive: false }, 
            { where: { name: model.name } }
          );
        }
      },
      beforeUpdate: async (model) => {
        if (model.changed('isDefault') && model.isDefault) {
          await Model.update({ isDefault: false }, { where: {} });
        }
        if (model.changed('isActive') && model.isActive) {
          await Model.update(
            { isActive: false }, 
            { where: { name: model.name, id: { [sequelize.Sequelize.Op.ne]: model.id } } }
          );
        }
      }
    }
  });

  // Associations
  Model.associate = (models) => {
    Model.hasMany(models.Prediction, {
      foreignKey: 'modelId',
      as: 'predictions'
    });
  };

  return Model;
};
