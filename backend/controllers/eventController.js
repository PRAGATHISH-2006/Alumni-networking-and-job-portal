const { Event, User } = require('../models');

exports.getEvents = async (req, res) => {
    console.log('GET /api/events requested');
    try {
        const events = await Event.findAll({
            include: [
                { model: User, as: 'organizer', attributes: ['name'] },
                { model: User, as: 'attendees', attributes: ['id', 'name'] }
            ],
            order: [['date', 'ASC']]
        });
        console.log(`Found ${events.length} events`);
        res.json(events);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.getEventById = async (req, res) => {
    try {
        const event = await Event.findByPk(req.params.id, {
            include: [
                { model: User, as: 'organizer', attributes: ['name'] },
                { model: User, as: 'attendees', attributes: ['id', 'name'] }
            ]
        });
        if (!event) return res.status(404).json({ message: 'Event not found' });
        res.json(event);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.registerForEvent = async (req, res) => {
    try {
        const { id: eventId } = req.params;
        const { id: userId } = req.user;

        console.log(`POST /api/events/register/${eventId} by user ${userId}`);

        const event = await Event.findByPk(eventId, {
            include: [{ model: User, as: 'attendees', attributes: ['id'] }]
        });

        if (!event) {
            return res.status(404).json({ message: 'Event not found' });
        }

        // Check if already registered
        const isRegistered = event.attendees?.some(attendee => 
            String(attendee.id).toLowerCase() === String(userId).toLowerCase()
        );
        
        if (isRegistered) {
            return res.status(400).json({ message: 'You are already registered for this event' });
        }

        await event.addAttendee(userId, { 
            through: { 
                jobStatus: req.body.jobStatus || 'N/A',
                company: req.body.company || 'N/A',
                regNo: req.body.regNo || 'N/A',
                college: req.body.college || 'N/A',
                batch: req.body.batch || 'N/A',
                dept: req.body.dept || 'N/A',
                dietary: req.body.dietary || 'None',
                interests: req.body.interests || '',
                paymentMethod: req.body.paymentMethod || 'card'
            } 
        });
        res.json({ message: 'Registered successfully' });
    } catch (error) {
        if (error.name === 'SequelizeUniqueConstraintError') {
            return res.status(400).json({ message: 'You are already registered for this event' });
        }
        console.error('Registration error details:', {
            message: error.message,
            stack: error.stack,
            eventId: req.params.id,
            userId: req.user?.id
        });
        res.status(500).json({ 
            message: 'Registration failed: Server error', 
            error: error.message 
        });
    }
};
