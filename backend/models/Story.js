const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Story = sequelize.define('Story', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    userId: {
        type: DataTypes.UUID,
        allowNull: false
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    batch: {
        type: DataTypes.STRING
    },
    role: {
        type: DataTypes.STRING
    },
    quote: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    achievement: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    isPublished: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    }
}, {
    tableName: 'Stories'
});

module.exports = Story;
