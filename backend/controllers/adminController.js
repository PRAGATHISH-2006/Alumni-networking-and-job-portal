const { User, Job, Event } = require('../models');

exports.getDashboardStats = async (req, res) => {
    try {
        const userCount = await User.count();
        const pendingAlumni = await User.count({ where: { role: 'alumni', isApproved: false } });
        const jobCount = await Job.count();
        const eventCount = await Event.count();

        res.json({ userCount, pendingAlumni, jobCount, eventCount });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.getPendingAlumni = async (req, res) => {
    try {
        const pending = await User.findAll({
            where: { role: 'alumni', isApproved: false },
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
