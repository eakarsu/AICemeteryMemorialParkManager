const { Sequelize } = require('sequelize');
require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });

const connectionOptions = {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    dialect: 'postgres',
    logging: false,
    pool: {
      max: 10,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  };
const sequelize = process.env.DATABASE_URL
  ? new Sequelize(process.env.DATABASE_URL, connectionOptions)
  : new Sequelize(process.env.DB_NAME || 'cemetery_manager', process.env.DB_USER || 'postgres', process.env.DB_PASSWORD, connectionOptions);

module.exports = sequelize;
