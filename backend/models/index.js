const User = require('./User');
const Job = require('./Job');
const Event = require('./Event');
const Mentorship = require('./Mentorship');
const Message = require('./Message');
const Donation = require('./Donation');
const Story = require('./Story');
const Feedback = require('./Feedback');
const Menu = require('./Menu');

// User - Job Associations
User.hasMany(Job, { foreignKey: 'postedBy', as: 'postedJobs' });
Job.belongsTo(User, { foreignKey: 'postedBy', as: 'poster' });

// User - Event Associations
User.hasMany(Event, { foreignKey: 'organizerId', as: 'organizedEvents' });
Event.belongsTo(User, { foreignKey: 'organizerId', as: 'organizer' });

// Many-to-Many Event - User (Attendees)
const EventAttendees = require('../config/db').sequelize.define('EventAttendees', {
    jobStatus: { type: require('sequelize').DataTypes.STRING },
    company: { type: require('sequelize').DataTypes.STRING },
    regNo: { type: require('sequelize').DataTypes.STRING },
    college: { type: require('sequelize').DataTypes.STRING },
    batch: { type: require('sequelize').DataTypes.STRING },
    dept: { type: require('sequelize').DataTypes.STRING },
    dietary: { type: require('sequelize').DataTypes.STRING },
    interests: { type: require('sequelize').DataTypes.TEXT },
    paymentMethod: { type: require('sequelize').DataTypes.STRING }
});
Event.belongsToMany(User, { through: EventAttendees, as: 'attendees' });
User.belongsToMany(Event, { through: EventAttendees, as: 'attendingEvents' });

// Many-to-Many Job - User (Applicants)
const JobApplicants = require('../config/db').sequelize.define('JobApplicants', {
    id: {
        type: require('sequelize').DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    resumePath: { type: require('sequelize').DataTypes.STRING },
    details: { type: require('sequelize').DataTypes.TEXT },
    status: { 
        type: require('sequelize').DataTypes.ENUM('Pending', 'Accepted', 'Rejected', 'Interview Scheduled'),
        defaultValue: 'Pending'
    },
    interviewDate: { type: require('sequelize').DataTypes.DATE },
    interviewType: { 
        type: require('sequelize').DataTypes.ENUM('Online', 'Offline'),
        allowNull: true
    },
    adminMessage: { type: require('sequelize').DataTypes.TEXT }
}, { tableName: 'jobapplicants' });
Job.belongsToMany(User, { through: JobApplicants, as: 'applicants' });
User.belongsToMany(Job, { through: JobApplicants, as: 'appliedJobs' });

// Mentorship Associations
User.hasMany(Mentorship, { foreignKey: 'mentorId', as: 'mentoringRequests' });
User.hasMany(Mentorship, { foreignKey: 'studentId', as: 'learningRequests' });
Mentorship.belongsTo(User, { foreignKey: 'mentorId', as: 'mentor' });
Mentorship.belongsTo(User, { foreignKey: 'studentId', as: 'student' });

// Message Associations
User.hasMany(Message, { foreignKey: 'senderId', as: 'sentMessages' });
User.hasMany(Message, { foreignKey: 'receiverId', as: 'receivedMessages' });
Message.belongsTo(User, { foreignKey: 'senderId', as: 'sender' });
Message.belongsTo(User, { foreignKey: 'receiverId', as: 'receiver' });

// Donation Associations
User.hasMany(Donation, { foreignKey: 'donorId', as: 'donations' });
Donation.belongsTo(User, { foreignKey: 'donorId', as: 'donor' });

// Story Associations
User.hasMany(Story, { foreignKey: 'userId', as: 'stories' });
Story.belongsTo(User, { foreignKey: 'userId', as: 'author' });

module.exports = { User, Job, Event, Mentorship, Message, Donation, Story, Feedback, Menu };
