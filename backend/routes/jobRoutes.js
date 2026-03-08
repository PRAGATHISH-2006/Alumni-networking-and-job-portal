const express = require('express');
const router = express.Router();
const { getJobs, createJob, applyToJob } = require('../controllers/jobController');
const { protect, authorize } = require('../middleware/auth');

router.get('/', protect, getJobs);
router.post('/', protect, authorize('alumni', 'admin'), createJob);
router.post('/:id/apply', protect, applyToJob);

module.exports = router;
