const express = require('express');
const router = express.Router();
const { sendMessage, getMessages, getChatList } = require('../controllers/messageController');
const { protect, approved } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');

// Multer storage config
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage });

router.use(protect);
router.use(approved);

router.get('/chats', getChatList);
router.get('/:userId', getMessages);
router.post('/', upload.single('image'), sendMessage);

module.exports = router;
