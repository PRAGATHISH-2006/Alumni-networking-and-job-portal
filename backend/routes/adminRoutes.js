const express = require('express');
const router = express.Router();
const { getDashboardStats, getPendingAlumni, approveUser } = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');

router.get('/stats', protect, authorize('admin'), getDashboardStats);
router.get('/pending', protect, authorize('admin'), getPendingAlumni);
router.put('/approve/:id', protect, authorize('admin'), approveUser);

module.exports = router;
