const express = require('express');
const router = express.Router();
const exportController = require('../controllers/exportController');
const authMiddleware = require('../middleware/authMiddleware');

router.use(authMiddleware);

router.get('/health-record/:id/pdf', exportController.exportHealthRecordPDF);

module.exports = router;
