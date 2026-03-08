const { Job, User } = require('../models');

exports.getJobs = async (req, res) => {
    try {
        const jobs = await Job.findAll({
            include: [{ model: User, as: 'poster', attributes: ['name', 'email'] }],
            order: [['createdAt', 'DESC']]
        });
        res.json(jobs);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.createJob = async (req, res) => {
    const { title, company, location, type, description, salary } = req.body;

    try {
        const job = await Job.create({
            title,
            company,
            location,
            type,
            description,
            salary,
            postedBy: req.user.id
        });
        res.status(201).json(job);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.applyToJob = async (req, res) => {
    try {
        const job = await Job.findByPk(req.params.id);
        if (!job) return res.status(404).json({ message: 'Job not found' });

        await job.addApplicant(req.user.id);
        res.json({ message: 'Applied successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};
