const express = require('express');
const router = express.Router();
const alertController = require('../controllers/alertController');

router.get('/alerts', alertController.getAlerts);
router.get('/alerts/export/csv', alertController.exportCSV);
router.get('/alerts/:id', alertController.getAlertById);
router.delete('/alerts/:id', alertController.deleteAlert);

module.exports = router;
