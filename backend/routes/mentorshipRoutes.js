const express = require('express');
const router = express.Router();
const { 
    requestMentorship, 
    getMentorshipRequests, 
    updateMentorshipStatus,
    getSessions,
    createSession,
    updateSession,
    sendSignal,
    getSignals,
    endCall,
    initiateCall,
    checkIncomingCall,
    respondCall,
    getCallStatus
} = require('../controllers/mentorshipController');
const { protect, approved } = require('../middleware/auth');

router.use(protect);
router.use(approved);

// Mentorship requests
router.post('/request', requestMentorship);
router.get('/requests', getMentorshipRequests);
router.put('/:id', updateMentorshipStatus);

// Class Schedules & Mentoring Sessions
router.get('/sessions', getSessions);
router.get('/sessions/:partnerId', getSessions);
router.post('/sessions', createSession);
router.put('/sessions/:id', updateSession);

// WebRTC Video Call Signaling & Live Incoming Calls
router.post('/call/initiate', initiateCall);
router.get('/call/incoming', checkIncomingCall);
router.post('/call/respond', respondCall);
router.get('/call/status/:roomId', getCallStatus);
router.post('/call/signal', sendSignal);
router.get('/call/signal/:roomId', getSignals);
router.post('/call/end', endCall);

module.exports = router;
