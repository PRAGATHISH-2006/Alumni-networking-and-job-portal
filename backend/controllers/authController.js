const { User } = require('../models');
const jwt = require('jsonwebtoken');

const generateToken = (res, id) => {
    const token = jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d'
    });

    res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV !== 'development',
        sameSite: 'strict',
        maxAge: 30 * 24 * 60 * 60 * 1000
    });

    return token;
};

exports.registerUser = async (req, res) => {
    const { name, email, password, role, batch, department } = req.body;

    try {
        console.log('Registration attempt:', { email, role });
        const userExists = await User.findOne({ where: { email } });

        if (userExists) {
            console.log('Registration failed: User already exists');
            return res.status(400).json({ message: 'User already exists' });
        }

        const user = await User.create({
            name,
            email,
            password,
            role,
            isApproved: false,
            skills: req.body.skills || [],
            company: req.body.company || '',
            position: req.body.position || '',
            batch: batch || '',
            department: department || '',
            location: req.body.location || ''
        });

        if (user) {
            console.log('Registration successful:', user.id);
            const token = generateToken(res, user.id);
            const userResponse = user.toJSON();
            delete userResponse.password;
            res.status(201).json({
                ...userResponse,
                token
            });
        }
    } catch (error) {
        console.error('Registration Error:', error);
        // Include the actual error message so the frontend can see why it failed
        res.status(500).json({ message: `Server error: ${error.message}` });
    }
};

exports.loginUser = async (req, res) => {
    const { email, password } = req.body;

    try {
        console.log('Login attempt:', email);
        const user = await User.findOne({ where: { email } });

        if (!user) {
            console.log('Login failed: User not found');
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        console.log('User found, comparing passwords...');
        const isMatch = await user.comparePassword(password);
        console.log('Password match:', isMatch);

        if (isMatch) {
            const token = generateToken(res, user.id);
            const userResponse = user.toJSON();
            delete userResponse.password;
            res.json({
                ...userResponse,
                token
            });
        } else {
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error) {
        console.error('Login Error:', error);
        // Include the actual error message so the frontend can see why it failed (e.g., "secretOrPrivateKey must have a value")
        res.status(500).json({ message: `Server error: ${error.message}` });
    }
};

exports.logoutUser = (req, res) => {
    res.cookie('token', '', {
        httpOnly: true,
        expires: new Date(0)
    });
    res.status(200).json({ message: 'Logged out' });
};

exports.getUserProfile = async (req, res) => {
    const user = await User.findByPk(req.user.id);
    if (user) {
        res.json(user);
    } else {
        res.status(404).json({ message: 'User not found' });
    }
};
