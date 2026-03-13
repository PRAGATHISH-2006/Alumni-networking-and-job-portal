const express = require('express');
const router = express.Router();
const { getEvents, getEventById, registerForEvent } = require('../controllers/eventController');
const { protect, approved } = require('../middleware/auth');

router.get('/', getEvents);
router.get('/id/:id', getEventById);
router.post('/register/:id', protect, approved, registerForEvent);

module.exports = router;
