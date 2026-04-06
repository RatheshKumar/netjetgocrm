// backend/modules/collab/routes/index.js
const express = require('express');
const router = express.Router();

router.use('/announcements', require('./announcements.routes'));
router.use('/meetings', require('./meetings.routes'));
router.use('/articles', require('./articles.routes'));
router.use('/discussions', require('./discussions.routes'));

module.exports = router;
