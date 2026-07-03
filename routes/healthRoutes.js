const express = require('express');
const router = express.Router();
const healthController = require('../controllers/healthController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const { validateInput } = require('../middleware/validateInput');

router.use(authMiddleware);

// GET semua rekam medis (otomatis difilter per role)
router.get('/', healthController.getHealthRecords);

// GET detail rekam medis
router.get('/:id', healthController.getHealthRecordById);

// CREATE rekam medis — HANYA DOKTER
router.post(
  '/',
  roleMiddleware('DOKTER'),
  validateInput(['userId', 'diagnosis']),
  healthController.createHealthRecord
);

module.exports = router;
