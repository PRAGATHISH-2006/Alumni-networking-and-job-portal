const { Message, User } = require('../models');
const { Op } = require('sequelize');

exports.sendMessage = async (req, res) => {
    try {
        const { receiverId, content } = req.body;
        const senderId = req.user.id;
        
        let imageUrl = null;
        if (req.file) {
            imageUrl = `/uploads/${req.file.filename}`;
        }

        const message = await Message.create({
            senderId,
            receiverId,
            content: content || '',
            imageUrl
        });

        res.status(201).json(message);
    } catch (error) {
        console.error('Send message error:', error);
        res.status(500).json({ message: 'Failed to send message' });
    }
};

exports.getMessages = async (req, res) => {
    try {
        const userId = req.user.id;
        const otherId = req.params.userId;

        const messages = await Message.findAll({
            where: {
                [Op.or]: [
                    { senderId: userId, receiverId: otherId },
                    { senderId: otherId, receiverId: userId }
                ]
            },
            order: [['createdAt', 'ASC']]
        });

        res.json(messages);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch messages' });
    }
};

exports.getChatList = async (req, res) => {
    try {
        const userId = req.user.id;
        
        // Find all unique users this user has chatted with
        const messages = await Message.findAll({
            where: {
                [Op.or]: [{ senderId: userId }, { receiverId: userId }]
            },
            attributes: ['senderId', 'receiverId'],
            order: [['createdAt', 'DESC']]
        });

        const chatPartnerIds = [...new Set(messages.map(m => 
            m.senderId === userId ? m.receiverId : m.senderId
        ))];

        const chatPartners = await User.findAll({
            where: { id: chatPartnerIds },
            attributes: ['id', 'name', 'role', 'company', 'position']
        });

        res.json(chatPartners);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch chat list' });
    }
};
