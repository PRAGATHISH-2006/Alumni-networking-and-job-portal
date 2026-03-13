const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = process.env.DB_URL 
    ? new Sequelize(process.env.DB_URL, {
        dialect: 'mysql',
        logging: false,
        dialectOptions: {
            ssl: {
                rejectUnauthorized: false // Required for some cloud providers like Aiven
            }
        }
    })
    : new Sequelize(
        process.env.DB_NAME,
        process.env.DB_USER,
        process.env.DB_PASS,
        {
            host: process.env.DB_HOST,
            dialect: 'mysql',
            logging: false,
        }
    );

const connectDB = async () => {
    try {
        await sequelize.authenticate();
        console.log('MySQL Connected (Sequelize)...');
    } catch (err) {
        console.error('Unable to connect to the database:', err);
        process.exit(1);
    }
};

module.exports = { sequelize, connectDB };
