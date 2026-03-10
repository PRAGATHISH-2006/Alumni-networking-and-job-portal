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

exports.registerForEvent = async (req, res) => {
    try {
        const event = await Event.findByPk(req.params.id);
        if (!event) return res.status(404).json({ message: 'Event not found' });

        await event.addAttendee(req.user.id);
        res.json({ message: 'Registered successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};
