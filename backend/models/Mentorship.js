const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Mentorship = sequelize.define('Mentorship', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    status: {
        type: DataTypes.ENUM('Pending', 'Accepted', 'Rejected'),
        defaultValue: 'Pending'
    },
    message: {
        type: DataTypes.TEXT
    },
    topic: {
        type: DataTypes.STRING
    }
}, {
    tableName: 'Mentorships'
});

module.exports = Mentorship;
