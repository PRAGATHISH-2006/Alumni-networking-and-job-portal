const { User } = require('../models');
const { Op } = require('sequelize');

exports.getAlumni = async (req, res) => {
    const { search, location, company, batch, department } = req.query;

    let where = {
        role: 'alumni'
    };

    if (location) {
        where.location = { [Op.like]: `%${location}%` };
    }

    if (company) {
        where.company = { [Op.like]: `%${company}%` };
    }

    if (batch) {
        where.batch = { [Op.like]: `%${batch}%` };
    }

    if (department) {
        where.department = { [Op.like]: `%${department}%` };
    }

    if (search) {
        where[Op.or] = [
            { name: { [Op.like]: `%${search}%` } },
            { skills: { [Op.like]: `%${search}%` } }
        ];
    }

    try {
        const alumni = await User.findAll({
            where,
            attributes: { exclude: ['password'] }
        });
        res.json(alumni);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.getUserById = async (req, res) => {
    try {
        const user = await User.findByPk(req.params.id, {
            attributes: { exclude: ['password'] }
        });
        if (user) {
            res.json(user);
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

exports.updateUserProfile = async (req, res) => {
    try {
        const user = await User.findByPk(req.user.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Update fields if they exist in req.body
        const fieldsToUpdate = [
            'name', 'bio', 'location', 'skills', 'company', 
            'position', 'batch', 'department', 'experience', 'interests',
            'institution', 'links'
        ];

        fieldsToUpdate.forEach(field => {
            if (req.body[field] !== undefined) {
                user[field] = req.body[field];
            }
        });

        await user.save();

        // Return updated user without password
        const updatedUser = user.toJSON();
        delete updatedUser.password;
        
        res.json(updatedUser);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
