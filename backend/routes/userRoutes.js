const express = require('express');
const router = express.Router();
const { getAlumni, getUserById } = require('../controllers/userController');
const { protect } = require('../middleware/auth');

router.get('/alumni', getAlumni);
router.get('/:id', getUserById);

module.exports = router;
