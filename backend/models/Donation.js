const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Donation = sequelize.define('Donation', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    donorId: {
        type: DataTypes.UUID,
        allowNull: false
    },
    fundType: {
        type: DataTypes.STRING,
        allowNull: false
    },
    amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },
    paymentMethod: {
        type: DataTypes.STRING,
        defaultValue: 'card'
    },
    status: {
        type: DataTypes.ENUM('Pending', 'Completed', 'Failed'),
        defaultValue: 'Completed'
    },
    receiptId: {
        type: DataTypes.STRING,
        unique: true
    }
});

module.exports = Donation;
