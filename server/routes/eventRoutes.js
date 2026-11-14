const express = require('express');
const router = express.Router();
const eventController = require('../controllers/eventController');
const upload = require('../middleware/upload');

router.post('/upload', upload.single('file'), eventController.uploadLogs);
router.get('/events', eventController.getEvents);
router.post('/events/simulate', eventController.simulateEvent);
router.get('/events/download/sample/:format', eventController.downloadSample);

module.exports = router;
