const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Event = sequelize.define('Event', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    date: {
        type: DataTypes.DATE,
        allowNull: false
    },
    location: {
        type: DataTypes.STRING,
        allowNull: false
    },
    type: {
        type: DataTypes.ENUM('Webinar', 'Meetup', 'Workshop', 'Conference'),
        defaultValue: 'Webinar'
    },
    imageUrl: {
        type: DataTypes.STRING
    },
    price: {
        type: DataTypes.FLOAT,
        defaultValue: 0
    }
}, {
    tableName: 'Events'
});

module.exports = Event;
