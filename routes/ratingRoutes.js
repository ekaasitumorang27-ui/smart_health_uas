const express = require('express');
const router = express.Router();
const ratingController = require('../controllers/ratingController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const { validateInput } = require('../middleware/validateInput');

router.use(authMiddleware);

router.get('/doctor/:doctorId', ratingController.getRatingsByDoctor);

router.post(
  '/',
  roleMiddleware('PASIEN'),
  validateInput(['appointmentId', 'bintang']),
  ratingController.createRating
);

module.exports = router;
