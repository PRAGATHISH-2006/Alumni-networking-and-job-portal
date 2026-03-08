const { Event, User } = require('../models');

exports.getEvents = async (req, res) => {
    try {
        const events = await Event.findAll({
            include: [{ model: User, as: 'organizer', attributes: ['name'] }],
            order: [['date', 'ASC']]
        });
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
