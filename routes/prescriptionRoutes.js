const express = require('express');
const router = express.Router();
const prescriptionController = require('../controllers/prescriptionController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const { validateInput } = require('../middleware/validateInput');

router.use(authMiddleware);

router.get('/by-record/:healthRecordId', prescriptionController.getPrescriptionsByRecord);

router.post(
  '/',
  roleMiddleware('DOKTER'),
  validateInput(['healthRecordId', 'namaObat', 'dosis', 'durasi']),
  prescriptionController.createPrescription
);

router.delete('/:id', roleMiddleware('DOKTER'), prescriptionController.deletePrescription);

module.exports = router;
