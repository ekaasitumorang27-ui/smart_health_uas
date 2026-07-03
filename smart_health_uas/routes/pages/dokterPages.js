const express = require('express');
const router = express.Router();
const prisma = require('../../database');
const authMiddleware = require('../../middleware/authMiddleware');
const roleMiddleware = require('../../middleware/roleMiddleware');

router.use(authMiddleware);
router.use(roleMiddleware('DOKTER'));

// === Dashboard Dokter ===
router.get('/dashboard', async (req, res, next) => {
  try {
    const doctorId = req.user.doctorId;
    const todayAppointments = await prisma.appointment.findMany({
      where: { doctorId },
      include: { user: true },
      orderBy: { schedule: 'asc' }
    });
    res.render('dokter/dashboard', {
      title: 'Dashboard Dokter',
      activePage: 'dashboard',
      appointments: todayAppointments
    });
  } catch (error) {
    next(error);
  }
});

// === Jadwal Praktik ===
router.get('/jadwal', async (req, res, next) => {
  try {
    const doctorId = req.user.doctorId;
    const doctor = await prisma.doctor.findUnique({
      where: { id: doctorId },
      include: { schedules: true }
    });
    res.render('dokter/jadwal', { title: 'Jadwal Praktik', activePage: 'jadwal', doctor });
  } catch (error) {
    next(error);
  }
});

// === Form Isi Rekam Medis untuk appointment tertentu ===
router.get('/rekam-medis/:appointmentId', async (req, res, next) => {
  try {
    const appointmentId = Number(req.params.appointmentId);
    const doctorId = req.user.doctorId;

    const appointment = await prisma.appointment.findUnique({
      where: { id: appointmentId },
      include: { user: true }
    });

    if (!appointment || appointment.doctorId !== doctorId) {
      return res.status(403).render('error', { title: 'Akses Ditolak', message: 'Appointment ini bukan milik Anda.', layout: false });
    }

    res.render('dokter/rekamMedisForm', { title: 'Isi Rekam Medis', activePage: 'dashboard', appointment });
  } catch (error) {
    next(error);
  }
});

// === Daftar Rekam Medis yang sudah dibuat dokter ===
router.get('/riwayat', async (req, res, next) => {
  try {
    const doctorId = req.user.doctorId;
    const records = await prisma.healthRecord.findMany({
      where: { doctorId },
      include: { user: true, prescriptions: true },
      orderBy: { date: 'desc' }
    });
    res.render('dokter/riwayat', { title: 'Riwayat Rekam Medis', activePage: 'riwayat', records });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
