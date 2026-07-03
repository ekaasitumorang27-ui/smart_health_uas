const prisma = require('../database');

// =======================================================
// CREATE resep — HANYA DOKTER, terkait ke rekam medis miliknya
// REST: POST /api/prescriptions
// =======================================================
exports.createPrescription = async (req, res, next) => {
  try {
    const doctorId = req.user.doctorId;
    if (!doctorId) return res.status(403).json({ message: 'Hanya dokter yang dapat membuat resep.' });

    const { healthRecordId, namaObat, dosis, durasi, catatan } = req.body;

    const record = await prisma.healthRecord.findUnique({ where: { id: Number(healthRecordId) } });
    if (!record || record.doctorId !== doctorId) {
      return res.status(403).json({ message: 'Rekam medis ini bukan milik Anda.' });
    }

    const prescription = await prisma.prescription.create({
      data: {
        healthRecordId: Number(healthRecordId),
        doctorId,
        namaObat,
        dosis,
        durasi,
        catatan: catatan || null
      }
    });

    res.status(201).json(prescription);
  } catch (error) {
    next(error);
  }
};

// =======================================================
// GET resep berdasarkan rekam medis
// REST: GET /api/prescriptions/by-record/:healthRecordId
// =======================================================
exports.getPrescriptionsByRecord = async (req, res, next) => {
  try {
    const healthRecordId = Number(req.params.healthRecordId);
    const { role, id: userId, doctorId } = req.user;

    const record = await prisma.healthRecord.findUnique({ where: { id: healthRecordId } });
    if (!record) return res.status(404).json({ message: 'Rekam medis tidak ditemukan.' });

    if (role === 'PASIEN' && record.userId !== userId) {
      return res.status(403).json({ message: 'Anda tidak berhak melihat resep ini.' });
    }
    if (role === 'DOKTER' && record.doctorId !== doctorId) {
      return res.status(403).json({ message: 'Anda tidak berhak melihat resep ini.' });
    }

    const prescriptions = await prisma.prescription.findMany({
      where: { healthRecordId }
    });

    res.json(prescriptions);
  } catch (error) {
    next(error);
  }
};

// =======================================================
// DELETE resep — HANYA DOKTER pembuat
// REST: DELETE /api/prescriptions/:id
// =======================================================
exports.deletePrescription = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const doctorId = req.user.doctorId;

    const prescription = await prisma.prescription.findUnique({ where: { id } });
    if (!prescription) return res.status(404).json({ message: 'Resep tidak ditemukan.' });
    if (prescription.doctorId !== doctorId) {
      return res.status(403).json({ message: 'Anda tidak berhak menghapus resep ini.' });
    }

    await prisma.prescription.delete({ where: { id } });
    res.json({ message: 'Resep berhasil dihapus.' });
  } catch (error) {
    next(error);
  }
};
