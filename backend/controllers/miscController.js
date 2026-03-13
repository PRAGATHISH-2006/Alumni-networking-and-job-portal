const { Donation, Story, Feedback, User } = require('../models');

exports.submitFeedback = async (req, res) => {
    try {
        const feedback = await Feedback.create(req.body);
        res.status(201).json(feedback);
    } catch (error) {
        res.status(500).json({ message: 'Error submitting feedback' });
    }
};

exports.getPublishedStories = async (req, res) => {
    try {
        const stories = await Story.findAll({
            where: { isPublished: true },
            include: [{ model: User, as: 'author', attributes: ['name', 'batch', 'position', 'company'] }],
            order: [['createdAt', 'DESC']]
        });
        res.json(stories);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching stories' });
    }
};

exports.submitStory = async (req, res) => {
    try {
        const story = await Story.create({
            ...req.body,
            userId: req.user.id,
            name: req.user.name,
            batch: req.user.batch,
            role: req.user.position ? `${req.user.position} @ ${req.user.company}` : (req.user.role === 'admin' ? 'Administrator' : 'Alumnus'),
            isPublished: req.user.role === 'admin' // Auto-publish for admins
        });
        res.status(201).json(story);
    } catch (error) {
        res.status(500).json({ message: 'Error submitting story' });
    }
};

exports.processDonation = async (req, res) => {
    try {
        const donation = await Donation.create({
            ...req.body,
            donorId: req.user.id,
            status: 'Completed',
            receiptId: `REC-${Math.random().toString(36).substr(2, 9).toUpperCase()}`
        });
        res.status(201).json(donation);
    } catch (error) {
        res.status(500).json({ message: 'Error processing donation' });
    }
};

exports.getMyFeedback = async (req, res) => {
    try {
        const feedback = await Feedback.findAll({
            where: { email: req.user.email },
            order: [['createdAt', 'DESC']]
        });
        res.json(feedback);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching feedback history' });
    }
};
