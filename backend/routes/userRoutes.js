const express = require('express');
const router = express.Router();
const { getAlumni, getUserById } = require('../controllers/userController');
const { protect } = require('../middleware/auth');

router.get('/alumni', protect, getAlumni);
router.get('/:id', protect, getUserById);

module.exports = router;
