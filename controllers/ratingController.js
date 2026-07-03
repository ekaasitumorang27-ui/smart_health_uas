const prisma = require('../database');

// =======================================================
// CREATE rating — HANYA PASIEN, hanya untuk appointment SELESAI miliknya
// REST: POST /api/ratings
// =======================================================
exports.createRating = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { appointmentId, bintang, komentar } = req.body;

    const appointment = await prisma.appointment.findUnique({
      where: { id: Number(appointmentId) }
    });

    if (!appointment || appointment.userId !== userId) {
      return res.status(403).json({ message: 'Appointment ini bukan milik Anda.' });
    }
    if (appointment.status !== 'SELESAI') {
      return res.status(400).json({ message: 'Hanya bisa memberi rating untuk appointment yang sudah selesai.' });
    }

    const bintangNum = Number(bintang);
    if (bintangNum < 1 || bintangNum > 5) {
      return res.status(400).json({ message: 'Rating harus antara 1 sampai 5.' });
    }

    const rating = await prisma.rating.create({
      data: {
        appointmentId: Number(appointmentId),
        userId,
        doctorId: appointment.doctorId,
        bintang: bintangNum,
        komentar: komentar || null
      }
    });

    res.status(201).json(rating);
  } catch (error) {
    next(error);
  }
};

// =======================================================
// GET semua rating untuk seorang dokter (publik untuk login user)
// REST: GET /api/ratings/doctor/:doctorId
// =======================================================
exports.getRatingsByDoctor = async (req, res, next) => {
  try {
    const doctorId = Number(req.params.doctorId);

    const ratings = await prisma.rating.findMany({
      where: { doctorId },
      include: { user: { select: { username: true } } },
      orderBy: { createdAt: 'desc' }
    });

    res.json(ratings);
  } catch (error) {
    next(error);
  }
};
