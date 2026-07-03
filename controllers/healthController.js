const prisma = require('../database');
const { getDoctorRecommendation } = require('../utils/healthRecommendation');

// =======================================================
// GET rekam medis
// - PASIEN: hanya miliknya sendiri
// - DOKTER: hanya yang dia buat
// - ADMIN: semua
// REST: GET /api/health-records
// =======================================================
exports.getHealthRecords = async (req, res, next) => {
  try {
    const { role, id, doctorId } = req.user;
    let where = {};

    if (role === 'PASIEN') where = { userId: id };
    else if (role === 'DOKTER') where = { doctorId: doctorId };

    const records = await prisma.healthRecord.findMany({
      where,
      include: {
        user: { select: { username: true } },
        doctor: { include: { user: { select: { username: true } } } },
        prescriptions: true
      },
      orderBy: { date: 'desc' }
    });

    res.json(records);
  } catch (error) {
    next(error);
  }
};

// =======================================================
// CREATE rekam medis — HANYA DOKTER, untuk appointment miliknya
// Sekaligus memberi rekomendasi dokter spesialis lanjutan
// (memperbaiki bug UTS: dulu rekomendasi cuma hardcode 2 kondisi
// di controller dan tidak memakai utils/healthRecommendation.js)
// REST: POST /api/health-records
// =======================================================
exports.createHealthRecord = async (req, res, next) => {
  try {
    const doctorId = req.user.doctorId;
    if (!doctorId) {
      return res.status(403).json({ message: 'Hanya dokter yang dapat membuat rekam medis.' });
    }

    const { userId, appointmentId, diagnosis, notes } = req.body;

    // Pastikan appointment (jika disertakan) memang milik dokter ini
    if (appointmentId) {
      const appointment = await prisma.appointment.findUnique({
        where: { id: Number(appointmentId) }
      });
      if (!appointment || appointment.doctorId !== doctorId) {
        return res.status(403).json({ message: 'Appointment ini bukan milik Anda.' });
      }
    }

    const record = await prisma.healthRecord.create({
      data: {
        userId: Number(userId),
        doctorId,
        appointmentId: appointmentId ? Number(appointmentId) : null,
        diagnosis,
        notes: notes || null
      }
    });

    // Tandai appointment selesai jika terhubung
    if (appointmentId) {
      await prisma.appointment.update({
        where: { id: Number(appointmentId) },
        data: { status: 'SELESAI' }
      });
    }

    const recommendation = getDoctorRecommendation(diagnosis);

    res.status(201).json({ record, recommendation });
  } catch (error) {
    next(error);
  }
};

// =======================================================
// GET rekam medis by id (detail, termasuk resep)
// REST: GET /api/health-records/:id
// =======================================================
exports.getHealthRecordById = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const { role, id: userId, doctorId } = req.user;

    const record = await prisma.healthRecord.findUnique({
      where: { id },
      include: {
        user: { select: { username: true, email: true } },
        doctor: { include: { user: { select: { username: true } } } },
        prescriptions: true
      }
    });

    if (!record) return res.status(404).json({ message: 'Rekam medis tidak ditemukan.' });

    // Otorisasi tambahan: pasien hanya boleh lihat miliknya, dokter hanya yang dia buat
    if (role === 'PASIEN' && record.userId !== userId) {
      return res.status(403).json({ message: 'Anda tidak berhak melihat rekam medis ini.' });
    }
    if (role === 'DOKTER' && record.doctorId !== doctorId) {
      return res.status(403).json({ message: 'Anda tidak berhak melihat rekam medis ini.' });
    }

    res.json(record);
  } catch (error) {
    next(error);
  }
};
