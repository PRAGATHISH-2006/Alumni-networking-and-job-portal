const { Job, User } = require('../models');

exports.getJobs = async (req, res) => {
    console.log('GET /api/jobs requested');
    try {
        const jobs = await Job.findAll({
            include: [{ model: User, as: 'poster', attributes: ['name', 'email'] }],
            order: [['createdAt', 'DESC']]
        });
        console.log(`Found ${jobs.length} jobs`);
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

        const resumePath = req.file ? req.file.path.replace(/\\/g, '/') : null;
        const { details } = req.body;

        // Check if already applied
        const existing = await req.user.hasAppliedJob(job);
        if (existing) {
            return res.status(400).json({ message: 'You have already applied for this position' });
        }

        await job.addApplicant(req.user.id, { 
            through: { 
                resumePath, 
                details,
                status: 'Pending'
            } 
        });

        res.json({ message: 'Application submitted successfully' });
    } catch (error) {
        console.error('Apply error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.getJobApplicants = async (req, res) => {
    try {
        const job = await Job.findByPk(req.params.id, {
            include: [{
                model: User,
                as: 'applicants',
                attributes: ['id', 'name', 'email', 'role', 'batch', 'department'],
                through: { attributes: ['resumePath', 'details', 'status', 'interviewDate', 'adminMessage', 'createdAt', 'id'] }
            }]
        });

        if (!job) return res.status(404).json({ message: 'Job not found' });
        
        // Authorization: only poster or admin can see applicants
        if (job.postedBy !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Unauthorized access to applicants' });
        }

        res.json(job.applicants);
    } catch (error) {
        console.error('Fetch Applicants Error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.getUserApplications = async (req, res) => {
    try {
        const applications = await req.user.getAppliedJobs({
            include: [{ model: User, as: 'poster', attributes: ['name', 'company'] }],
            through: { attributes: ['status', 'interviewDate', 'adminMessage', 'createdAt'] }
        });
        res.json(applications);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

exports.manageApplication = async (req, res) => {
    const { status, interviewDate, interviewType, adminMessage } = req.body;
    try {
        // We need the junction record ID or jobID + userID
        // Using jobID (req.params.jobId) and applicantID (req.params.applicantId)
        const job = await Job.findByPk(req.params.jobId);
        if (!job) return res.status(404).json({ message: 'Job not found' });

        if (job.postedBy !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Unauthorized' });
        }

        const JobApplicants = Job.associations.applicants.through.model;
        const application = await JobApplicants.findOne({
            where: { JobId: req.params.jobId, UserId: req.params.applicantId }
        });

        if (!application) return res.status(404).json({ message: 'Application not found' });

        if (status) application.status = status;
        if (interviewDate) application.interviewDate = interviewDate;
        if (interviewType) application.interviewType = interviewType;
        if (adminMessage) application.adminMessage = adminMessage;

        await application.save();
        res.json({ message: 'Application updated successfully', application });
    } catch (error) {
        console.error('Manage error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

