const express = require('express');
const router = express.Router();
const prisma = require('../../database');
const authMiddleware = require('../../middleware/authMiddleware');
const roleMiddleware = require('../../middleware/roleMiddleware');

router.use(authMiddleware);
router.use(roleMiddleware('PASIEN'));

// === Dashboard Pasien ===
router.get('/dashboard', async (req, res, next) => {
  try {
    const userId = req.user.id;
    const appointments = await prisma.appointment.findMany({
      where: { userId },
      include: { doctor: { include: { user: true } } },
      orderBy: { schedule: 'desc' },
      take: 5
    });
    res.render('pasien/dashboard', { title: 'Dashboard Pasien', activePage: 'dashboard', appointments });
  } catch (error) {
    next(error);
  }
});

// === Cari & Pilih Dokter untuk booking ===
router.get('/booking', async (req, res, next) => {
  try {
    const doctors = await prisma.doctor.findMany({
      include: { user: true, schedules: true, ratings: true }
    });
    const doctorsWithRating = doctors.map(d => {
      const total = d.ratings.reduce((s, r) => s + r.bintang, 0);
      const avg = d.ratings.length ? (total / d.ratings.length).toFixed(1) : null;
      return { ...d, avgRating: avg };
    });
    res.render('pasien/booking', { title: 'Buat Appointment', activePage: 'booking', doctors: doctorsWithRating });
  } catch (error) {
    next(error);
  }
});

// === Riwayat Appointment ===
router.get('/riwayat-appointment', async (req, res, next) => {
  try {
    const userId = req.user.id;
    const appointments = await prisma.appointment.findMany({
      where: { userId },
      include: { doctor: { include: { user: true } }, rating: true },
      orderBy: { schedule: 'desc' }
    });
    res.render('pasien/riwayatAppointment', { title: 'Riwayat Appointment', activePage: 'riwayat-appointment', appointments });
  } catch (error) {
    next(error);
  }
});

// === Riwayat Rekam Medis ===
router.get('/rekam-medis', async (req, res, next) => {
  try {
    const userId = req.user.id;
    const records = await prisma.healthRecord.findMany({
      where: { userId },
      include: { doctor: { include: { user: true } }, prescriptions: true },
      orderBy: { date: 'desc' }
    });
    res.render('pasien/rekamMedis', { title: 'Riwayat Rekam Medis', activePage: 'rekam-medis', records });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
