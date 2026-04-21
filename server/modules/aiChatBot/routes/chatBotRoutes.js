const express = require('express');
const router = express.Router();
const { processChatMessage } = require('../controllers/chatBotController');
const { protect } = require('../../auth/middleware/authMiddleware');

router.post('/chat', protect, processChatMessage);

module.exports = router;
