const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { validateInput, validateEmail } = require('../middleware/validateInput');

// =======================================================
// HALAMAN
// =======================================================
router.get('/register', authController.getRegisterPage);
router.get('/login', authController.getLoginPage);

// =======================================================
// PROSES (pakai middleware validasi input — REST POST)
// =======================================================
router.post(
  '/register',
  validateInput(['username', 'email', 'password', 'confirmPassword']),
  validateEmail,
  authController.register
);

router.post(
  '/login',
  validateInput(['email', 'password']),
  validateEmail,
  authController.login
);

router.get('/logout', authController.logout);

module.exports = router;
