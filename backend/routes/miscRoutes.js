const express = require('express');
const router = express.Router();
const { submitFeedback, getPublishedStories, submitStory, processDonation } = require('../controllers/miscController');
const { protect, approved } = require('../middleware/auth');

// Public
router.post('/feedback', submitFeedback);
router.get('/stories', getPublishedStories);

// Protected
router.use(protect);
router.use(approved);
router.get('/feedback/history', require('../controllers/miscController').getMyFeedback);
router.post('/stories', submitStory);
router.post('/donate', processDonation);

module.exports = router;
