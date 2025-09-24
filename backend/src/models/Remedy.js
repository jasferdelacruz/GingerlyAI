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
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: [],
      get() {
        const value = this.getDataValue('symptoms');
        return typeof value === 'string' ? JSON.parse(value) : value || [];
      },
      set(value) {
        this.setDataValue('symptoms', JSON.stringify(value || []));
      }
    },
    causes: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: [],
      get() {
        const value = this.getDataValue('causes');
        return typeof value === 'string' ? JSON.parse(value) : value || [];
      },
      set(value) {
        this.setDataValue('causes', JSON.stringify(value || []));
      }
    },
    treatments: {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: [],
      get() {
        const value = this.getDataValue('treatments');
        return typeof value === 'string' ? JSON.parse(value) : value || [];
      },
      set(value) {
        this.setDataValue('treatments', JSON.stringify(value || []));
      }
    },
    preventionMeasures: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: [],
      get() {
        const value = this.getDataValue('preventionMeasures');
        return typeof value === 'string' ? JSON.parse(value) : value || [];
      },
      set(value) {
        this.setDataValue('preventionMeasures', JSON.stringify(value || []));
      }
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
