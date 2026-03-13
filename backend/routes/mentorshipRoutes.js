const express = require('express');
const router = express.Router();
const { requestMentorship, getMentorshipRequests, updateMentorshipStatus } = require('../controllers/mentorshipController');
const { protect, approved } = require('../middleware/auth');

router.use(protect);
router.use(approved);

router.post('/request', requestMentorship);
router.get('/requests', protect, getMentorshipRequests);
router.put('/:id', protect, updateMentorshipStatus);

module.exports = router;
