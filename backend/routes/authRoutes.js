const express = require('express');
const router = express.Router();
const { registerUser, loginUser, logoutUser, getUserProfile, forgotPassword, resetPassword } = require('../controllers/authController');
const { protect } = require('../middleware/auth');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/logout', logoutUser);

// Password Reset (Public)
router.post('/forgot-password', (req, res, next) => {
    console.log('Forgot password request received for:', req.body.email);
    next();
}, forgotPassword);
router.post('/reset-password/:token', resetPassword);

// Protected routes below
router.get('/profile', protect, getUserProfile);

module.exports = router;
