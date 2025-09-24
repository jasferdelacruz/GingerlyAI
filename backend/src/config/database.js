const { Sequelize } = require('sequelize');
const path = require('path');
require('dotenv').config();

// Use SQLite for development, PostgreSQL for production
const isProduction = process.env.NODE_ENV === 'production';

const sequelize = isProduction ? 
  new Sequelize({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || 'gingerlyai_db',
    username: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'password',
    dialect: 'postgres',
    logging: false,
    pool: {
      max: 10,
      min: 0,
      acquire: 30000,
      idle: 10000
    },
    define: {
      timestamps: true,
      underscored: false,
      paranoid: true // Soft deletes
    }
  }) :
  new Sequelize({
    dialect: 'sqlite',
    storage: path.join(__dirname, '../../database.sqlite'),
    logging: console.log,
    define: {
      timestamps: true,
      underscored: false,
      paranoid: true // Soft deletes
    }
  });

// Test the connection
const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connection established successfully.');
  } catch (error) {
    console.error('❌ Unable to connect to the database:', error);
    process.exit(1);
  }
};

module.exports = { sequelize, testConnection };
