const express = require('express');
const router = express.Router();
const { getAlumni, getUserById, updateUserProfile } = require('../controllers/userController');
const { protect } = require('../middleware/auth');

router.get('/alumni', getAlumni);
router.put('/profile', protect, updateUserProfile);
router.get('/:id', getUserById);

module.exports = router;
