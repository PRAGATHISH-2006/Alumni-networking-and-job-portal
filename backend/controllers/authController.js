const { User } = require('../models');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const nodemailer = require('nodemailer');

const generateToken = (res, id) => {
    const token = jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d'
    });

    res.cookie('token', token, {
        httpOnly: true,
        secure: true, // MUST be true for cross-site cookies
        sameSite: 'none', // Allow Vercel (frontend) to send cookies to Render (backend)
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
        secure: true,
        sameSite: 'none',
        expires: new Date(0)
    });
    res.status(200).json({ message: 'Logged out' });
};

exports.getUserProfile = async (req, res) => {
    try {
        const user = await User.findByPk(req.user.id, {
            attributes: { exclude: ['password'] }
        });
        
        if (user) {
            // Re-generate token to ensure localStorage can be populated even if user logged in via cookies only
            const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
                expiresIn: '30d'
            });
            
            res.json({
                ...user.toJSON(),
                token
            });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

// Password Reset Logic
exports.forgotPassword = async (req, res) => {
    const { email } = req.body;

    try {
        const user = await User.findOne({ where: { email } });
        if (!user) {
            return res.status(404).json({ message: 'No user found with that email' });
        }

        // Generate reset token
        const resetToken = crypto.randomBytes(32).toString('hex');
        const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

        // Set token and expiry (1 hour)
        user.resetPasswordToken = hashedToken;
        user.resetPasswordExpire = Date.now() + 3600000;
        await user.save();

        // Create reset URL
        const resetUrl = `${req.headers.origin}/reset-password/${resetToken}`;
        
        // LOG FOR LOCAL DEVELOPMENT (so they can copy the link from terminal)
        console.log('-----------------------------------------');
        console.log('PASSWORD RESET LINK:', resetUrl);
        console.log('-----------------------------------------');

        // Configure Supabase SMTP
        const transporter = nodemailer.createTransport({
            host: 'smtp.supabase.co',
            port: 587,
            secure: false, // true for 465, false for 587
            auth: {
                user: 'postgres.ibtvlkmztoelwxybbthx',
                pass: 'Pragathish2006'
            }
        });

        const mailOptions = {
            from: '"Alumni Portal" <noreply@supabase.co>',
            to: user.email,
            subject: 'Password Reset Request',
            html: `
                <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
                    <h2>Password Reset Request</h2>
                    <p>You requested a password reset for your Alumni Portal account.</p>
                    <p>Please click the button below to reset your password. This link is valid for 1 hour.</p>
                    <a href="${resetUrl}" style="display: inline-block; padding: 12px 24px; background-color: #8b5cf6; color: white; text-decoration: none; border-radius: 8px; font-weight: bold; margin-top: 20px;">Reset Password</a>
                    <p style="margin-top: 30px; font-size: 0.8rem; color: #666;">If you did not request this, please ignore this email.</p>
                    <hr style="border: none; border-top: 1px solid #eee; margin-top: 30px;" />
                    <p style="font-size: 0.7rem; color: #999;">Alumni Networking and Job Portal</p>
                </div>
            `
        };

        await transporter.sendMail(mailOptions);
        res.status(200).json({ message: 'Email sent' });

    } catch (error) {
        console.error('Forgot Password Error:', error);
        res.status(500).json({ message: `Error sending email: ${error.message}` });
    }
};

exports.resetPassword = async (req, res) => {
    const { token } = req.params;
    const { password } = req.body;

    try {
        const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

        const user = await User.findOne({
            where: {
                resetPasswordToken: hashedToken,
                resetPasswordExpire: { [require('sequelize').Op.gt]: Date.now() }
            }
        });

        if (!user) {
            return res.status(400).json({ message: 'Invalid or expired token' });
        }

        // Update password and clear reset fields (Sequelize beforeSave hook will hash it)
        user.password = password;
        user.resetPasswordToken = null;
        user.resetPasswordExpire = null;
        await user.save();

        res.status(200).json({ message: 'Password reset successful' });

    } catch (error) {
        console.error('Reset Password Error:', error);
        res.status(500).json({ message: 'Error resetting password' });
    }
};
