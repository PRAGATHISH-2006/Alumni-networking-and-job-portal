const express = require('express');
const router = express.Router();
const { requestMentorship, getMentorshipRequests, updateMentorshipStatus } = require('../controllers/mentorshipController');
const { protect } = require('../middleware/auth');

router.post('/request', protect, requestMentorship);
router.get('/requests', protect, getMentorshipRequests);
router.put('/:id', protect, updateMentorshipStatus);

module.exports = router;
