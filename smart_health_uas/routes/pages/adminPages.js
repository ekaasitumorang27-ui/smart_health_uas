const express = require('express');
const router = express.Router();
const prisma = require('../../database');
const authMiddleware = require('../../middleware/authMiddleware');
const roleMiddleware = require('../../middleware/roleMiddleware');

router.use(authMiddleware);
router.use(roleMiddleware('ADMIN'));

// === Dashboard ===
router.get('/dashboard', async (req, res, next) => {
  try {
    const totalUsers = await prisma.user.count({ where: { role: 'PASIEN' } });
    const totalDoctors = await prisma.doctor.count();
    const totalAppointments = await prisma.appointment.count();
    res.render('admin/dashboard', {
      title: 'Dashboard Admin',
      activePage: 'dashboard',
      totalUsers,
      totalDoctors,
      totalAppointments
    });
  } catch (error) {
    next(error);
  }
});

// === Manajemen Dokter ===
router.get('/dokter', async (req, res, next) => {
  try {
    const doctors = await prisma.doctor.findMany({
      include: { user: true, schedules: true }
    });
    res.render('admin/dokter', { title: 'Manajemen Dokter', activePage: 'dokter', doctors });
  } catch (error) {
    next(error);
  }
});

// === Manajemen Appointment (semua) ===
router.get('/appointments', async (req, res, next) => {
  try {
    const appointments = await prisma.appointment.findMany({
      include: { user: true, doctor: { include: { user: true } } },
      orderBy: { schedule: 'desc' }
    });
    res.render('admin/appointments', { title: 'Semua Appointment', activePage: 'appointments', appointments });
  } catch (error) {
    next(error);
  }
});

// === Daftar Pasien ===
router.get('/pasien', async (req, res, next) => {
  try {
    const pasien = await prisma.user.findMany({
      where: { role: 'PASIEN' },
      include: { appointments: true, healthRecords: true }
    });
    res.render('admin/pasien', { title: 'Daftar Pasien', activePage: 'pasien', pasien });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
