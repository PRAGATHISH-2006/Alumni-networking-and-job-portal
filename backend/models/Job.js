const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Job = sequelize.define('Job', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false
    },
    company: {
        type: DataTypes.STRING,
        allowNull: false
    },
    location: {
        type: DataTypes.STRING,
        allowNull: false
    },
    type: {
        type: DataTypes.ENUM('Full-time', 'Part-time', 'Internship', 'Contract'),
        defaultValue: 'Full-time'
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    salary: {
        type: DataTypes.STRING
    }
});

module.exports = Job;
