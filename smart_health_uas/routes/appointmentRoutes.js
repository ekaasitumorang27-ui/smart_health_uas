const express = require('express');
const router = express.Router();
const appointmentController = require('../controllers/appointmentController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const { validateInput } = require('../middleware/validateInput');

router.use(authMiddleware);

// GET appointment (otomatis difilter sesuai role di controller)
router.get('/', appointmentController.getAppointments);

// GET slot kosong (untuk halaman booking)
router.get('/available', appointmentController.getAvailableSlots);

// CREATE appointment — HANYA PASIEN
router.post(
  '/',
  roleMiddleware('PASIEN'),
  validateInput(['doctorId', 'schedule']),
  appointmentController.createAppointment
);

// UPDATE status — PASIEN (batalkan), DOKTER/ADMIN (konfirmasi/selesaikan)
router.put(
  '/:id/status',
  roleMiddleware('PASIEN', 'DOKTER', 'ADMIN'),
  validateInput(['status']),
  appointmentController.updateStatus
);

module.exports = router;
