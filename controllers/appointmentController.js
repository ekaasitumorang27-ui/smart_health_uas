const prisma = require('../database');

// =======================================================
// GET appointment
// - PASIEN: hanya lihat miliknya sendiri
// - DOKTER: hanya lihat appointment yang ditujukan ke dia
// - ADMIN: lihat semua
// REST: GET /api/appointments
// =======================================================
exports.getAppointments = async (req, res, next) => {
  try {
    const { role, id, doctorId } = req.user;
    let where = {};

    if (role === 'PASIEN') where = { userId: id };
    else if (role === 'DOKTER') where = { doctorId: doctorId };
    // ADMIN: where = {} (semua)

    const appointments = await prisma.appointment.findMany({
      where,
      include: {
        user: { select: { username: true, email: true } },
        doctor: { include: { user: { select: { username: true } } } },
        healthRecord: true,
        rating: true
      },
      orderBy: { schedule: 'asc' }
    });

    res.json(appointments);
  } catch (error) {
    next(error);
  }
};

// =======================================================
// CREATE appointment (hanya PASIEN)
// VALIDASI ANTI-BENTROK: cek apakah dokter sudah ada appointment
// lain dalam rentang waktu yang sama (asumsi durasi praktik 30 menit)
// REST: POST /api/appointments
// =======================================================
exports.createAppointment = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { doctorId, schedule, keluhan } = req.body;

    const scheduleDate = new Date(schedule);
    if (isNaN(scheduleDate.getTime())) {
      return res.status(400).json({ message: 'Format tanggal/jam tidak valid.' });
    }
    if (scheduleDate < new Date()) {
      return res.status(400).json({ message: 'Tidak bisa membuat appointment di waktu yang sudah lewat.' });
    }

    const doctor = await prisma.doctor.findUnique({ where: { id: Number(doctorId) } });
    if (!doctor) return res.status(404).json({ message: 'Dokter tidak ditemukan.' });

    // Cek bentrok: window 30 menit sebelum & sesudah waktu yang diminta
    const windowStart = new Date(scheduleDate.getTime() - 29 * 60 * 1000);
    const windowEnd = new Date(scheduleDate.getTime() + 29 * 60 * 1000);

    const conflict = await prisma.appointment.findFirst({
      where: {
        doctorId: Number(doctorId),
        status: { in: ['PENDING', 'DIKONFIRMASI'] },
        schedule: { gte: windowStart, lte: windowEnd }
      }
    });

    if (conflict) {
      return res.status(409).json({
        message: 'Slot waktu ini sudah dipesan untuk dokter tersebut. Silakan pilih jam lain.'
      });
    }

    const appointment = await prisma.appointment.create({
      data: {
        userId,
        doctorId: Number(doctorId),
        schedule: scheduleDate,
        keluhan: keluhan || null
      },
      include: { doctor: { include: { user: true } } }
    });

    res.status(201).json(appointment);
  } catch (error) {
    next(error);
  }
};

// =======================================================
// UPDATE status appointment
// - DOKTER/ADMIN: bisa konfirmasi / selesaikan / batalkan
// - PASIEN: hanya bisa membatalkan miliknya sendiri
// REST: PUT /api/appointments/:id/status
// =======================================================
exports.updateStatus = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const { status } = req.body;
    const { role, id: userId, doctorId } = req.user;

    const appointment = await prisma.appointment.findUnique({ where: { id } });
    if (!appointment) return res.status(404).json({ message: 'Appointment tidak ditemukan.' });

    if (role === 'PASIEN') {
      if (appointment.userId !== userId) {
        return res.status(403).json({ message: 'Anda tidak berhak mengubah appointment ini.' });
      }
      if (status !== 'DIBATALKAN') {
        return res.status(403).json({ message: 'Pasien hanya dapat membatalkan appointment.' });
      }
    }

    if (role === 'DOKTER' && appointment.doctorId !== doctorId) {
      return res.status(403).json({ message: 'Anda tidak berhak mengubah appointment ini.' });
    }

    const updated = await prisma.appointment.update({
      where: { id },
      data: { status }
    });

    res.json(updated);
  } catch (error) {
    next(error);
  }
};

// =======================================================
// GET slot kosong dokter pada tanggal tertentu (helper untuk UI booking)
// REST: GET /api/appointments/available?doctorId=1&date=2026-07-01
// =======================================================
exports.getAvailableSlots = async (req, res, next) => {
  try {
    const { doctorId, date } = req.query;
    if (!doctorId || !date) {
      return res.status(400).json({ message: 'doctorId dan date wajib diisi.' });
    }

    const dayStart = new Date(`${date}T00:00:00`);
    const dayEnd = new Date(`${date}T23:59:59`);

    const booked = await prisma.appointment.findMany({
      where: {
        doctorId: Number(doctorId),
        status: { in: ['PENDING', 'DIKONFIRMASI'] },
        schedule: { gte: dayStart, lte: dayEnd }
      },
      select: { schedule: true }
    });

    res.json({ bookedSlots: booked.map(b => b.schedule) });
  } catch (error) {
    next(error);
  }
};
