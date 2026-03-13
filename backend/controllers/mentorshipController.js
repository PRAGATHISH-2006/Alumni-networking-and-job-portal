const { Mentorship, User } = require('../models');
const { Op } = require('sequelize');

exports.requestMentorship = async (req, res) => {
    const { mentorId, message, topic } = req.body;
    try {
        const existing = await Mentorship.findOne({
            where: { mentorId, studentId: req.user.id }
        });
        if (existing) return res.status(400).json({ message: 'Request already sent' });

        const mentorship = await Mentorship.create({
            mentorId,
            studentId: req.user.id,
            message,
            topic
        });
        res.status(201).json(mentorship);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.getMentorshipRequests = async (req, res) => {
    try {
        const requests = await Mentorship.findAll({
            where: {
                [Op.or]: [
                    { mentorId: req.user.id },
                    { studentId: req.user.id }
                ]
            },
            include: [
                { model: User, as: 'mentor', attributes: ['id', 'name', 'company', 'position', 'role'] },
                { model: User, as: 'student', attributes: ['id', 'name', 'batch', 'department', 'role'] }
            ],
            order: [['createdAt', 'DESC']]
        });
        res.json(requests);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

exports.updateMentorshipStatus = async (req, res) => {
    try {
        const mentorship = await Mentorship.findByPk(req.params.id);
        if (!mentorship) return res.status(404).json({ message: 'Not found' });

        if (mentorship.mentorId !== req.user.id) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        mentorship.status = req.body.status;
        await mentorship.save();
        res.json(mentorship);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};
