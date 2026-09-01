const express = require('express');
const router = express.Router();
const { queryChatbot, submitFeedback, getChatbotStats } = require('./chatbot.controller');

router.post('/query', queryChatbot);
router.post('/feedback', submitFeedback);
router.get('/stats', getChatbotStats);

module.exports = router;
