const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { getJobs, createJob, applyToJob, getJobApplicants, getUserApplications, manageApplication } = require('../controllers/jobController');
const { protect, authorize, approved } = require('../middleware/auth');

// Multer Storage for Resumes
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/resumes/');
    },
    filename: (req, file, cb) => {
        cb(null, `resume-${req.user.id}-${Date.now()}${path.extname(file.originalname)}`);
    }
});

const upload = multer({ 
    storage,
    fileFilter: (req, file, cb) => {
        const allowedTypes = ['.pdf', '.doc', '.docx'];
        const ext = path.extname(file.originalname).toLowerCase();
        if (allowedTypes.includes(ext)) {
            cb(null, true);
        } else {
            cb(new Error('Only PDF and Word documents are allowed'));
        }
    },
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB
});

router.use(protect);
router.use(approved);

router.get('/', getJobs);
router.post('/', authorize('alumni', 'admin'), createJob);
router.get('/my-applications', getUserApplications);
router.post('/:id/apply', upload.single('resume'), applyToJob);
router.get('/:id/applicants', authorize('alumni', 'admin'), getJobApplicants);
router.patch('/:jobId/manage/:applicantId', authorize('alumni', 'admin'), manageApplication);

module.exports = router;
