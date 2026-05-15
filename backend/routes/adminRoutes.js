const express = require('express');
const router = express.Router();
const { 
    getDashboardStats, 
    getPendingUsers, 
    approveUser, 
    getAllUsers, 
    deleteUser,
    getAllJobs,
    deleteJob,
    getAllDonations,
    getAllFeedback,
    updateFeedbackStatus,
    getAllStories,
    approveStory,
    getMentorshipRequests,
    updateUser,
    updateJob,
    updateStory,
    createStory,
    getAllEvents,
    createEvent,
    updateEvent,
    deleteEvent,
    createJob,
    resetDonations
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);
router.use(authorize('admin'));

router.get('/stats', getDashboardStats);

// Users
router.get('/users', getAllUsers);
router.get('/pending-users', getPendingUsers);
router.put('/users/:id', updateUser);
router.put('/users/approve/:id', approveUser);
router.delete('/users/:id', deleteUser);

// Jobs
router.get('/jobs', getAllJobs);
router.post('/jobs', createJob);
router.put('/jobs/:id', updateJob);
router.delete('/jobs/:id', deleteJob);

// Donations
router.get('/donations', getAllDonations);
router.delete('/donations', resetDonations);

// Feedback
router.get('/feedback', getAllFeedback);
router.put('/feedback/:id', updateFeedbackStatus);

// Stories
router.get('/stories', getAllStories);
router.post('/stories', createStory);
router.put('/stories/:id', updateStory);
router.put('/stories/approve/:id', approveStory);

// Mentorship
router.get('/mentorship-requests', getMentorshipRequests);

// Registrations
router.get('/registrations', require('../controllers/adminController').getAllRegistrations);

// Events
router.get('/events', getAllEvents);
router.post('/events', createEvent);
router.put('/events/:id', updateEvent);
router.delete('/events/:id', deleteEvent);

module.exports = router;
