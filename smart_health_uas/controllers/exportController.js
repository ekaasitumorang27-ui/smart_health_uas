const PDFDocument = require('pdfkit');
const prisma = require('../database');

// =======================================================
// EXPORT rekam medis ke PDF
// - PASIEN: hanya bisa export miliknya sendiri
// - DOKTER: hanya yang dia buat
// - ADMIN: semua
// REST: GET /api/export/health-record/:id/pdf
// =======================================================
exports.exportHealthRecordPDF = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const { role, id: userId, doctorId } = req.user;

    const record = await prisma.healthRecord.findUnique({
      where: { id },
      include: {
        user: { select: { username: true, email: true } },
        doctor: { include: { user: { select: { username: true } }, } },
        prescriptions: true
      }
    });

    if (!record) return res.status(404).json({ message: 'Rekam medis tidak ditemukan.' });

    if (role === 'PASIEN' && record.userId !== userId) {
      return res.status(403).json({ message: 'Anda tidak berhak mengakses rekam medis ini.' });
    }
    if (role === 'DOKTER' && record.doctorId !== doctorId) {
      return res.status(403).json({ message: 'Anda tidak berhak mengakses rekam medis ini.' });
    }

    const doc = new PDFDocument({ margin: 50 });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=rekam-medis-${id}.pdf`);

    doc.pipe(res);

    // === HEADER ===
    doc.fontSize(20).fillColor('#2e7d32').text('Smart Health Clinic', { align: 'center' });
    doc.fontSize(12).fillColor('black').text('Laporan Rekam Medis', { align: 'center' });
    doc.moveDown(2);

    // === INFO PASIEN ===
    doc.fontSize(12).fillColor('black');
    doc.text(`Nama Pasien : ${record.user.username}`);
    doc.text(`Email        : ${record.user.email}`);
    doc.text(`Dokter       : ${record.doctor.user.username}`);
    doc.text(`Tanggal      : ${record.date.toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })}`);
    doc.moveDown();

    // === DIAGNOSIS ===
    doc.fontSize(14).fillColor('#2e7d32').text('Diagnosis');
    doc.fontSize(12).fillColor('black').text(record.diagnosis);
    doc.moveDown();

    if (record.notes) {
      doc.fontSize(14).fillColor('#2e7d32').text('Catatan Medis');
      doc.fontSize(12).fillColor('black').text(record.notes);
      doc.moveDown();
    }

    // === RESEP OBAT ===
    if (record.prescriptions.length > 0) {
      doc.fontSize(14).fillColor('#2e7d32').text('Resep Obat');
      doc.moveDown(0.5);

      record.prescriptions.forEach((p, i) => {
        doc.fontSize(12).fillColor('black').text(
          `${i + 1}. ${p.namaObat} — Dosis: ${p.dosis}, Durasi: ${p.durasi}${p.catatan ? ` (${p.catatan})` : ''}`
        );
      });
      doc.moveDown();
    }

    doc.moveDown(2);
    doc.fontSize(10).fillColor('gray').text(
      `Dokumen ini dibuat otomatis oleh sistem Smart Health pada ${new Date().toLocaleString('id-ID')}`,
      { align: 'center' }
    );

    doc.end();
  } catch (error) {
    next(error);
  }
};
