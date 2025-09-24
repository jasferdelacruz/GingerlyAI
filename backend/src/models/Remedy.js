const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Remedy = sequelize.define('Remedy', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    diseaseName: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
        len: [2, 100]
      }
    },
    diseaseCode: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        notEmpty: true,
        len: [2, 20]
      }
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    symptoms: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      allowNull: false,
      defaultValue: []
    },
    causes: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      allowNull: true,
      defaultValue: []
    },
    treatments: {
      type: DataTypes.ARRAY(DataTypes.TEXT),
      allowNull: false,
      defaultValue: []
    },
    preventionMeasures: {
      type: DataTypes.ARRAY(DataTypes.TEXT),
      allowNull: true,
      defaultValue: []
    },
    severity: {
      type: DataTypes.ENUM('low', 'medium', 'high', 'critical'),
      defaultValue: 'medium',
      allowNull: false
    },
    imageUrl: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        isUrl: true
      }
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    version: {
      type: DataTypes.INTEGER,
      defaultValue: 1,
      allowNull: false
    }
  }, {
    tableName: 'remedies',
    indexes: [
      {
        unique: true,
        fields: ['diseaseCode']
      },
      {
        fields: ['diseaseName']
      },
      {
        fields: ['severity']
      }
    ]
  });

  // Associations
  Remedy.associate = (models) => {
    Remedy.hasMany(models.Prediction, {
      foreignKey: 'remedyId',
      as: 'predictions'
    });
  };

  return Remedy;
};
