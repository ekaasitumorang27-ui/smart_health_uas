const express = require('express');
const router = express.Router();
const doctorController = require('../controllers/doctorController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const { validateInput } = require('../middleware/validateInput');

// =======================================================
// SEMUA route di bawah WAJIB login (authMiddleware)
// =======================================================
router.use(authMiddleware);

// GET semua dokter — semua role login boleh lihat (untuk pilih dokter)
router.get('/', doctorController.getDoctors);

// GET detail dokter — semua role login boleh lihat
router.get('/:id', doctorController.getDoctorById);

// CREATE dokter — HANYA ADMIN
router.post(
  '/',
  roleMiddleware('ADMIN'),
  validateInput(['username', 'email', 'password', 'specialist']),
  doctorController.createDoctor
);

// UPDATE dokter — HANYA ADMIN
router.put('/:id', roleMiddleware('ADMIN'), doctorController.updateDoctor);

// DELETE dokter — HANYA ADMIN
router.delete('/:id', roleMiddleware('ADMIN'), doctorController.deleteDoctor);

// CREATE jadwal — ADMIN atau DOKTER yang bersangkutan
router.post(
  '/:id/schedules',
  roleMiddleware('ADMIN', 'DOKTER'),
  validateInput(['dayOfWeek', 'startTime', 'endTime']),
  doctorController.addSchedule
);

// DELETE jadwal — ADMIN atau DOKTER
router.delete('/schedules/:scheduleId', roleMiddleware('ADMIN', 'DOKTER'), doctorController.deleteSchedule);

module.exports = router;
