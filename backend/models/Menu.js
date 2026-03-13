const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Menu = sequelize.define('Menu', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    label: {
        type: DataTypes.STRING,
        allowNull: false
    },
    path: {
        type: DataTypes.STRING
    },
    parentTitle: { // 'Careers', 'Events', etc. or null for top level
        type: DataTypes.STRING
    },
    order: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    role: { // optional restriction
        type: DataTypes.STRING
    }
});

module.exports = Menu;
