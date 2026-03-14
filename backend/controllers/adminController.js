const { User, Job, Event, Donation, Mentorship, Story, Feedback } = require('../models');
const { Op } = require('sequelize');

exports.getDashboardStats = async (req, res) => {
    try {
        const studentCount = await User.count({ where: { role: 'student' } });
        const alumniCount = await User.count({ where: { role: 'alumni' } });
        const pendingUsers = await User.count({ where: { role: { [Op.in]: ['alumni', 'student'] }, isApproved: false } });
        const jobCount = await Job.count();
        const eventCount = await Event.count();
        const donationCount = await Donation.count();
        const mentorshipCount = await Mentorship.count();
        const feedbackCount = await Feedback.count({ where: { status: 'New' } });

        const totalDonations = await Donation.sum('amount') || 0;
        
        // Correct Event collections calculation: Sum of (event price * attendee count)
        const events = await Event.findAll({
            include: [{ model: User, as: 'attendees', attributes: ['id'] }]
        });
        
        let eventCollections = 0;
        let totalRegistrations = 0;
        events.forEach(event => {
            const attendeeCount = event.attendees ? event.attendees.length : 0;
            eventCollections += (event.price * attendeeCount);
            totalRegistrations += attendeeCount;
        });

        // Recent Activities
        const recentUsers = await User.findAll({ 
            where: { role: { [Op.ne]: 'admin' } },
            limit: 5, 
            order: [['createdAt', 'DESC']], 
            attributes: ['id', 'name', 'role', 'createdAt'] 
        });
        const recentJobs = await Job.findAll({ limit: 5, order: [['createdAt', 'DESC']], attributes: ['id', 'title', 'company', 'createdAt'] });
        const recentDonations = await Donation.findAll({ limit: 5, order: [['createdAt', 'DESC']], include: [{ model: User, as: 'donor', attributes: ['name'] }] });

        res.json({ 
            studentCount, 
            alumniCount, 
            pendingUsers, 
            jobCount, 
            eventCount,
            donationCount,
            mentorshipCount,
            feedbackCount,
            totalDonations,
            eventCollections,
            totalRegistrations,
            recentActivities: {
                users: recentUsers,
                jobs: recentJobs,
                donations: recentDonations
            }
        });
    } catch (error) {
        console.error('Stats Error:', error);
        res.status(500).json({ message: `Server error: ${error.message}` });
    }
};

exports.updateUser = async (req, res) => {
    try {
        const user = await User.findByPk(req.params.id);
        if (!user) return res.status(404).json({ message: 'User not found' });
        await user.update(req.body);
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: 'Error updating user' });
    }
};

exports.updateJob = async (req, res) => {
    try {
        const job = await Job.findByPk(req.params.id);
        if (!job) return res.status(404).json({ message: 'Job not found' });
        await job.update(req.body);
        res.json(job);
    } catch (error) {
        res.status(500).json({ message: 'Error updating job' });
    }
};

exports.updateStory = async (req, res) => {
    try {
        const story = await Story.findByPk(req.params.id);
        if (!story) return res.status(404).json({ message: 'Story not found' });
        await story.update(req.body);
        res.json(story);
    } catch (error) {
        res.status(500).json({ message: 'Error updating story' });
    }
};

exports.getAllEvents = async (req, res) => {
    try {
        const events = await Event.findAll({
            include: [
                { model: User, as: 'organizer', attributes: ['name', 'email'] },
                { 
                    model: User, 
                    as: 'attendees', 
                    attributes: ['name', 'role', 'email'], 
                    through: { 
                        attributes: ['jobStatus', 'company', 'regNo', 'college', 'batch', 'dept', 'dietary', 'interests', 'paymentMethod'] 
                    } 
                }
            ],
            order: [['date', 'DESC']]
        });
        res.json(events);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching events' });
    }
};

exports.createEvent = async (req, res) => {
    try {
        const event = await Event.create({
            ...req.body,
            organizerId: req.user.id
        });
        res.status(201).json(event);
    } catch (error) {
        res.status(500).json({ message: 'Error creating event' });
    }
};

exports.updateEvent = async (req, res) => {
    try {
        const event = await Event.findByPk(req.params.id);
        if (!event) return res.status(404).json({ message: 'Event not found' });
        await event.update(req.body);
        res.json(event);
    } catch (error) {
        res.status(500).json({ message: 'Error updating event' });
    }
};

exports.deleteEvent = async (req, res) => {
    try {
        const event = await Event.findByPk(req.params.id);
        if (!event) return res.status(404).json({ message: 'Event not found' });
        await event.destroy();
        res.json({ message: 'Event deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting event' });
    }
};

exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.findAll({
            attributes: { exclude: ['password'] },
            order: [['createdAt', 'DESC']]
        });
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

exports.getPendingUsers = async (req, res) => {
    try {
        const pending = await User.findAll({
            where: { 
                role: { [Op.in]: ['alumni', 'student'] }, 
                isApproved: false 
            },
            attributes: { exclude: ['password'] }
        });
        res.json(pending);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

exports.approveUser = async (req, res) => {
    try {
        const user = await User.findByPk(req.params.id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        user.isApproved = true;
        await user.save();
        res.json({ message: 'User approved' });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

exports.deleteUser = async (req, res) => {
    try {
        const user = await User.findByPk(req.params.id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        await user.destroy();
        res.json({ message: 'User removed from system' });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

exports.getAllJobs = async (req, res) => {
    try {
        const jobs = await Job.findAll({
            include: [{ model: User, as: 'poster', attributes: ['name', 'email'] }],
            order: [['createdAt', 'DESC']]
        });
        res.json(jobs);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

exports.deleteJob = async (req, res) => {
    try {
        const job = await Job.findByPk(req.params.id);
        if (!job) return res.status(404).json({ message: 'Job post not found' });

        await job.destroy();
        res.json({ message: 'Job post removed' });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

exports.getAllDonations = async (req, res) => {
    try {
        const donations = await Donation.findAll({
            include: [{ model: User, as: 'donor', attributes: ['name', 'email'] }],
            order: [['createdAt', 'DESC']]
        });
        res.json(donations);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

exports.getAllFeedback = async (req, res) => {
    try {
        const feedbacks = await Feedback.findAll({ order: [['createdAt', 'DESC']] });
        res.json(feedbacks);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

exports.updateFeedbackStatus = async (req, res) => {
    try {
        const feedback = await Feedback.findByPk(req.params.id);
        if (!feedback) return res.status(404).json({ message: 'Feedback not found' });
        feedback.status = req.body.status;
        if (req.body.adminResponse) feedback.adminResponse = req.body.adminResponse;
        await feedback.save();
        res.json(feedback);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

exports.getAllStories = async (req, res) => {
    try {
        const stories = await Story.findAll({
            include: [{ model: User, as: 'author', attributes: ['name'] }],
            order: [['createdAt', 'DESC']]
        });
        res.json(stories);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

exports.approveStory = async (req, res) => {
    try {
        const story = await Story.findByPk(req.params.id);
        if (!story) return res.status(404).json({ message: 'Story not found' });
        story.isPublished = true;
        await story.save();
        res.json({ message: 'Story published' });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

exports.getMentorshipRequests = async (req, res) => {
    try {
        const requests = await Mentorship.findAll({
            include: [
                { model: User, as: 'mentor', attributes: ['name'] },
                { model: User, as: 'student', attributes: ['name'] }
            ],
            order: [['createdAt', 'DESC']]
        });
        res.json(requests);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

exports.getAllRegistrations = async (req, res) => {
    try {
        const events = await Event.findAll({
            include: [
                { 
                    model: User, 
                    as: 'attendees', 
                    attributes: ['name', 'email', 'role'], 
                    through: { 
                        attributes: ['regNo', 'batch', 'dept', 'jobStatus', 'company'] 
                    } 
                }
            ]
        });

        // Flatten the data: [ { attendeeName, eventTitle, regNo, role, ... }, ... ]
        const registrations = [];
        events.forEach(event => {
            if (event.attendees) {
                event.attendees.forEach(attendee => {
                    registrations.push({
                        id: `${event.id}-${attendee.id}`,
                        attendeeName: attendee.name,
                        attendeeEmail: attendee.email,
                        attendeeRole: attendee.role,
                        eventTitle: event.title,
                        eventId: event.id,
                        regNo: attendee.EventAttendees?.regNo || 'N/A',
                        batch: attendee.EventAttendees?.batch || 'N/A',
                        dept: attendee.EventAttendees?.dept || 'N/A',
                        jobStatus: attendee.EventAttendees?.jobStatus || 'N/A',
                        createdAt: attendee.EventAttendees?.createdAt
                    });
                });
            }
        });

        // Sort by date descending
        registrations.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        res.json(registrations);
    } catch (error) {
        console.error('Error fetching registrations:', error);
        res.status(500).json({ message: 'Error fetching registrations' });
    }
};

exports.createJob = async (req, res) => {
    try {
        const job = await Job.create({ ...req.body, postedBy: req.user.id });
        res.status(201).json(job);
    } catch (error) {
        res.status(500).json({ message: 'Error creating job' });
    }
};

exports.createStory = async (req, res) => {
    try {
        const story = await Story.create({ 
            ...req.body, 
            userId: req.user.id, 
            isPublished: true, 
            name: req.user.name, 
            role: 'Administrator' 
        });
        res.status(201).json(story);
    } catch (error) {
        res.status(500).json({ message: 'Error creating story' });
    }
};
