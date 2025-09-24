const { sequelize } = require('../config/database');
const User = require('./User');
const Remedy = require('./Remedy');
const Prediction = require('./Prediction');
const Model = require('./Model');
const RefreshToken = require('./RefreshToken');

// Initialize models
const models = {
  User: User(sequelize),
  Remedy: Remedy(sequelize),
  Prediction: Prediction(sequelize),
  Model: Model(sequelize),
  RefreshToken: RefreshToken(sequelize)
};

// Define associations
Object.keys(models).forEach(modelName => {
  if (models[modelName].associate) {
    models[modelName].associate(models);
  }
});

module.exports = {
  sequelize,
  ...models
};
