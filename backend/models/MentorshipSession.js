const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const MentorshipSession = sequelize.define('MentorshipSession', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    mentorId: {
        type: DataTypes.UUID,
        allowNull: false
    },
    studentId: {
        type: DataTypes.UUID,
        allowNull: false
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false
    },
    scheduledAt: {
        type: DataTypes.DATE,
        allowNull: false
    },
    duration: {
        type: DataTypes.INTEGER,
        defaultValue: 45
    },
    status: {
        type: DataTypes.ENUM('Scheduled', 'In Progress', 'Completed', 'Cancelled'),
        defaultValue: 'Scheduled'
    },
    roomId: {
        type: DataTypes.STRING,
        defaultValue: () => 'room-' + Math.random().toString(36).substring(2, 9)
    },
    agenda: {
        type: DataTypes.TEXT
    },
    meetingNotes: {
        type: DataTypes.TEXT
    }
}, {
    tableName: 'MentorshipSessions',
    timestamps: true
});

module.exports = MentorshipSession;
