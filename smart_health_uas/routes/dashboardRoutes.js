const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

router.use(authMiddleware);

// Statistik hanya untuk ADMIN
router.get('/stats', roleMiddleware('ADMIN'), dashboardController.getStats);

module.exports = router;
