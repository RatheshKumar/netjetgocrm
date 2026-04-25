const express = require('express');
const router = express.Router();
const hrAIController = require('./hr-ai.controller');

router.post('/chat', hrAIController.chat);

module.exports = router;
