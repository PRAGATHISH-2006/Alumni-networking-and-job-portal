const User = require('./User');
const Job = require('./Job');
const Event = require('./Event');
const Mentorship = require('./Mentorship');

// User - Job Associations
User.hasMany(Job, { foreignKey: 'postedBy', as: 'postedJobs' });
Job.belongsTo(User, { foreignKey: 'postedBy', as: 'poster' });

// User - Event Associations
User.hasMany(Event, { foreignKey: 'organizerId', as: 'organizedEvents' });
Event.belongsTo(User, { foreignKey: 'organizerId', as: 'organizer' });

// Many-to-Many Event - User (Attendees)
const EventAttendees = require('../config/db').sequelize.define('EventAttendees', {});
Event.belongsToMany(User, { through: EventAttendees, as: 'attendees' });
User.belongsToMany(Event, { through: EventAttendees, as: 'attendingEvents' });

// Many-to-Many Job - User (Applicants)
const JobApplicants = require('../config/db').sequelize.define('JobApplicants', {});
Job.belongsToMany(User, { through: JobApplicants, as: 'applicants' });
User.belongsToMany(Job, { through: JobApplicants, as: 'appliedJobs' });

// Mentorship Associations
User.hasMany(Mentorship, { foreignKey: 'mentorId', as: 'mentoringRequests' });
User.hasMany(Mentorship, { foreignKey: 'studentId', as: 'learningRequests' });
Mentorship.belongsTo(User, { foreignKey: 'mentorId', as: 'mentor' });
Mentorship.belongsTo(User, { foreignKey: 'studentId', as: 'student' });

module.exports = { User, Job, Event, Mentorship };
