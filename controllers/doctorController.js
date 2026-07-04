const bcrypt = require('bcryptjs');
const prisma = require('../database');

// =======================================================
// GET semua dokter (publik untuk pasien lihat & pilih)
// REST: GET /api/doctors
// =======================================================
exports.getDoctors = async (req, res, next) => {
  try {
    const doctors = await prisma.doctor.findMany({
      include: {
        user: { select: { id: true, username: true, email: true } },
        schedules: true,
        ratings: { select: { bintang: true } }
      }
    });

    // hitung rata-rata rating per dokter
    const doctorsWithRating = doctors.map(doc => {
      const totalRating = doc.ratings.reduce((sum, r) => sum + r.bintang, 0);
      const avgRating = doc.ratings.length > 0 ? (totalRating / doc.ratings.length).toFixed(1) : null;
      return { ...doc, avgRating, jumlahRating: doc.ratings.length };
    });

    res.json(doctorsWithRating);
  } catch (error) {
    next(error);
  }
};

// =======================================================
// GET dokter by id (detail + jadwal)
// REST: GET /api/doctors/:id
// =======================================================
exports.getDoctorById = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const doctor = await prisma.doctor.findUnique({
      where: { id },
      include: {
        user: { select: { username: true, email: true } },
        schedules: true,
        ratings: { include: { user: { select: { username: true } } } }
      }
    });

    if (!doctor) return res.status(404).json({ message: 'Dokter tidak ditemukan.' });

    res.json(doctor);
  } catch (error) {
    next(error);
  }
};

// =======================================================
// CREATE dokter baru (hanya Admin)
// Membuat User (role DOKTER) + profil Doctor sekaligus
// REST: POST /api/doctors
// =======================================================
exports.createDoctor = async (req, res, next) => {
  try {
    const { username, email, password, specialist } = req.body;

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: 'Email sudah digunakan.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const doctor = await prisma.doctor.create({
      data: {
        specialist,
        user: {
          create: {
            username,
            email,
            password: hashedPassword,
            role: 'DOKTER'
          }
        }
      },
      include: { user: { select: { username: true, email: true } } }
    });

    res.status(201).json(doctor);
  } catch (error) {
    next(error);
  }
};

// =======================================================
// UPDATE dokter (hanya Admin)
// REST: PUT /api/doctors/:id
// =======================================================
exports.updateDoctor = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const { specialist, username } = req.body;

    const doctor = await prisma.doctor.update({
      where: { id },
      data: {
        specialist,
        user: username ? { update: { username } } : undefined
      },
      include: { user: true }
    });

    res.json(doctor);
  } catch (error) {
    next(error);
  }
};

// =======================================================
// DELETE dokter (hanya Admin) — hapus profil + user terkait
// REST: DELETE /api/doctors/:id
// =======================================================
exports.deleteDoctor = async (req, res, next) => {
  try {
    const id = Number(req.params.id);

    const doctor = await prisma.doctor.findUnique({ where: { id } });
    if (!doctor) return res.status(404).json({ message: 'Dokter tidak ditemukan.' });

    await prisma.user.delete({ where: { id: doctor.userId } }); // cascade hapus doctor juga

    res.json({ message: 'Dokter berhasil dihapus.' });
  } catch (error) {
    next(error);
  }
};

// =======================================================
// CREATE jadwal praktik untuk dokter (Admin atau Dokter sendiri)
// REST: POST /api/doctors/:id/schedules
// =======================================================
exports.addSchedule = async (req, res, next) => {
  try {
    const doctorId = Number(req.params.id);
    const { dayOfWeek, startTime, endTime } = req.body;

    const schedule = await prisma.schedule.create({
      data: { doctorId, dayOfWeek, startTime, endTime }
    });

    res.status(201).json(schedule);
  } catch (error) {
    next(error);
  }
};

// =======================================================
// DELETE jadwal
// REST: DELETE /api/doctors/schedules/:scheduleId
// =======================================================
exports.deleteSchedule = async (req, res, next) => {
  try {
    const scheduleId = Number(req.params.scheduleId);
    await prisma.schedule.delete({ where: { id: scheduleId } });
    res.json({ message: 'Jadwal berhasil dihapus.' });
  } catch (error) {
    next(error);
  }
};
