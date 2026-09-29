const { Mentorship, MentorshipSession, User } = require('../models');
const { Op } = require('sequelize');

// In-memory fallback stores for sessions and signaling
const inMemorySessions = [];
const callSignals = new Map(); // roomId -> Array of { senderId, targetUserId, signal, timestamp }

exports.requestMentorship = async (req, res) => {
    const { mentorId, message, topic } = req.body;
    try {
        const existing = await Mentorship.findOne({
            where: { mentorId, studentId: req.user.id }
        });
        if (existing) return res.status(400).json({ message: 'Request already sent' });

        const mentorship = await Mentorship.create({
            mentorId,
            studentId: req.user.id,
            message,
            topic
        });
        res.status(201).json(mentorship);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.getMentorshipRequests = async (req, res) => {
    try {
        const requests = await Mentorship.findAll({
            where: {
                [Op.or]: [
                    { mentorId: req.user.id },
                    { studentId: req.user.id }
                ]
            },
            include: [
                { model: User, as: 'mentor', attributes: ['id', 'name', 'company', 'position', 'role', 'email', 'location', 'skills', 'bio'] },
                { model: User, as: 'student', attributes: ['id', 'name', 'batch', 'department', 'role', 'email', 'location', 'skills', 'bio'] }
            ],
            order: [['createdAt', 'DESC']]
        });
        res.json(requests);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

exports.updateMentorshipStatus = async (req, res) => {
    try {
        const mentorship = await Mentorship.findByPk(req.params.id);
        if (!mentorship) return res.status(404).json({ message: 'Not found' });

        if (mentorship.mentorId !== req.user.id) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        mentorship.status = req.body.status;
        await mentorship.save();
        res.json(mentorship);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

// ----------------- Mentorship Sessions / Class Scheduling -----------------

exports.getSessions = async (req, res) => {
    const { partnerId } = req.params;
    const userId = req.user.id;

    try {
        if (MentorshipSession) {
            try {
                // Ensure table exists
                await MentorshipSession.sync();
                const whereClause = partnerId
                    ? {
                        [Op.or]: [
                            { mentorId: userId, studentId: partnerId },
                            { mentorId: partnerId, studentId: userId }
                        ]
                    }
                    : {
                        [Op.or]: [
                            { mentorId: userId },
                            { studentId: userId }
                        ]
                    };

                const sessions = await MentorshipSession.findAll({
                    where: whereClause,
                    order: [['scheduledAt', 'ASC']]
                });
                return res.json(sessions);
            } catch (dbErr) {
                console.warn('DB session fetch fallback to memory:', dbErr.message);
            }
        }

        // In-memory fallback
        const filtered = inMemorySessions.filter(s => {
            const matchesUser = s.mentorId === userId || s.studentId === userId;
            if (!partnerId) return matchesUser;
            return (s.mentorId === userId && s.studentId === partnerId) || (s.mentorId === partnerId && s.studentId === userId);
        });
        res.json(filtered);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch sessions', error: error.message });
    }
};

exports.createSession = async (req, res) => {
    const { partnerId, title, scheduledAt, duration = 45, agenda } = req.body;
    const userId = req.user.id;
    const userRole = req.user.role;

    if (!partnerId || !title || !scheduledAt) {
        return res.status(400).json({ message: 'Missing required session parameters' });
    }

    const mentorId = userRole === 'alumni' ? userId : partnerId;
    const studentId = userRole === 'alumni' ? partnerId : userId;
    const roomId = 'room-' + Math.random().toString(36).substring(2, 9);

    const sessionPayload = {
        mentorId,
        studentId,
        title,
        scheduledAt,
        duration: Number(duration) || 45,
        status: 'Scheduled',
        roomId,
        agenda: agenda || ''
    };

    try {
        if (MentorshipSession) {
            try {
                await MentorshipSession.sync();
                const session = await MentorshipSession.create(sessionPayload);
                return res.status(201).json(session);
            } catch (dbErr) {
                console.warn('DB session create fallback to memory:', dbErr.message);
            }
        }

        const newSession = {
            id: 'sess-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
            ...sessionPayload,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        inMemorySessions.push(newSession);
        res.status(201).json(newSession);
    } catch (error) {
        res.status(500).json({ message: 'Failed to create session', error: error.message });
    }
};

exports.updateSession = async (req, res) => {
    const { id } = req.params;
    const { status, agenda, meetingNotes } = req.body;

    try {
        if (MentorshipSession) {
            try {
                const session = await MentorshipSession.findByPk(id);
                if (session) {
                    if (status) session.status = status;
                    if (agenda !== undefined) session.agenda = agenda;
                    if (meetingNotes !== undefined) session.meetingNotes = meetingNotes;
                    await session.save();
                    return res.json(session);
                }
            } catch (dbErr) {
                console.warn('DB session update fallback to memory:', dbErr.message);
            }
        }

        const memSession = inMemorySessions.find(s => s.id === id);
        if (memSession) {
            if (status) memSession.status = status;
            if (agenda !== undefined) memSession.agenda = agenda;
            if (meetingNotes !== undefined) memSession.meetingNotes = meetingNotes;
            return res.json(memSession);
        }

        res.status(404).json({ message: 'Session not found' });
    } catch (error) {
        res.status(500).json({ message: 'Failed to update session', error: error.message });
    }
};

// ----------------- WebRTC Video Call Signaling & Incoming Call Popups -----------------

const activeCalls = new Map(); // targetUserId -> { roomId, callerId, callerName, callerRole, status: 'ringing'|'accepted'|'rejected', timestamp }

exports.initiateCall = (req, res) => {
    const { targetUserId, roomId, callerName, callerRole } = req.body;
    const callerId = req.user.id;

    if (!targetUserId || !roomId) {
        return res.status(400).json({ message: 'targetUserId and roomId are required' });
    }

    const callData = {
        roomId,
        callerId,
        callerName: callerName || req.user.name || 'Member',
        callerRole: callerRole || req.user.role || 'User',
        targetUserId,
        status: 'ringing',
        timestamp: Date.now()
    };

    activeCalls.set(targetUserId, callData);
    res.json({ success: true, call: callData });
};

exports.checkIncomingCall = (req, res) => {
    const userId = req.user.id;
    const callData = activeCalls.get(userId);

    if (callData) {
        // Expire calls older than 45 seconds
        if (Date.now() - callData.timestamp > 45000) {
            activeCalls.delete(userId);
            return res.json({ hasIncoming: false });
        }
        return res.json({ hasIncoming: true, call: callData });
    }

    res.json({ hasIncoming: false });
};

exports.respondCall = (req, res) => {
    const { roomId, response } = req.body; // 'accepted' or 'rejected'
    const userId = req.user.id;

    // Find the call for this user or by roomId
    let foundCall = activeCalls.get(userId);
    if (!foundCall) {
        for (const [tId, call] of activeCalls.entries()) {
            if (call.roomId === roomId) {
                foundCall = call;
                break;
            }
        }
    }

    if (foundCall) {
        foundCall.status = response; // 'accepted' or 'rejected'
        if (response === 'rejected') {
            setTimeout(() => {
                if (foundCall.targetUserId) activeCalls.delete(foundCall.targetUserId);
            }, 6000);
        }
        return res.json({ success: true, status: response, call: foundCall });
    }

    res.status(404).json({ message: 'Call not found or expired' });
};

exports.getCallStatus = (req, res) => {
    const { roomId } = req.params;
    for (const [tId, call] of activeCalls.entries()) {
        if (call.roomId === roomId) {
            return res.json({ status: call.status, call });
        }
    }
    res.json({ status: 'ended' });
};

exports.sendSignal = (req, res) => {
    const { roomId, signal, targetUserId } = req.body;
    const senderId = req.user.id;

    if (!roomId || !signal) {
        return res.status(400).json({ message: 'roomId and signal are required' });
    }

    if (!callSignals.has(roomId)) {
        callSignals.set(roomId, []);
    }

    const roomList = callSignals.get(roomId);
    roomList.push({
        senderId,
        targetUserId,
        signal,
        timestamp: Date.now()
    });

    if (roomList.length > 100) {
        roomList.shift();
    }

    res.json({ success: true, message: 'Signal queued' });
};

exports.getSignals = (req, res) => {
    const { roomId } = req.params;
    const userId = req.user.id;

    if (!callSignals.has(roomId)) {
        return res.json({ signals: [] });
    }

    const roomList = callSignals.get(roomId);
    const pendingSignals = roomList.filter(s => 
        s.senderId !== userId && (!s.targetUserId || s.targetUserId === userId)
    );

    callSignals.set(roomId, roomList.filter(s => 
        s.senderId === userId || (s.targetUserId && s.targetUserId !== userId)
    ));

    res.json({ signals: pendingSignals });
};

exports.endCall = (req, res) => {
    const { roomId } = req.body;
    if (roomId) {
        if (callSignals.has(roomId)) {
            callSignals.delete(roomId);
        }
        for (const [tId, call] of activeCalls.entries()) {
            if (call.roomId === roomId) {
                activeCalls.delete(tId);
            }
        }
    }
    res.json({ success: true });
};

