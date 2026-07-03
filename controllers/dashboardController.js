const prisma = require('../database');

// =======================================================
// GET statistik untuk dashboard admin
// REST: GET /api/dashboard/stats
// Data ini akan dikonsumsi Chart.js di sisi frontend (EJS view)
// =======================================================
exports.getStats = async (req, res, next) => {
  try {
    const totalUsers = await prisma.user.count({ where: { role: 'PASIEN' } });
    const totalDoctors = await prisma.doctor.count();
    const totalAppointments = await prisma.appointment.count();

    // Appointment per bulan (6 bulan terakhir) — untuk line/bar chart
    const appointments = await prisma.appointment.findMany({
      select: { schedule: true, status: true }
    });

    const perBulan = {};
    appointments.forEach(a => {
      const bulan = a.schedule.toISOString().slice(0, 7); // "2026-06"
      perBulan[bulan] = (perBulan[bulan] || 0) + 1;
    });

    // Distribusi status appointment — untuk pie chart
    const statusCount = { PENDING: 0, DIKONFIRMASI: 0, SELESAI: 0, DIBATALKAN: 0 };
    appointments.forEach(a => {
      statusCount[a.status] = (statusCount[a.status] || 0) + 1;
    });

    // Dokter paling sering dipilih — untuk bar chart
    const doctorCounts = await prisma.appointment.groupBy({
      by: ['doctorId'],
      _count: { doctorId: true }
    });

    const doctorsInfo = await prisma.doctor.findMany({
      include: { user: { select: { username: true } } }
    });

    const topDoctors = doctorCounts
      .map(dc => {
        const doc = doctorsInfo.find(d => d.id === dc.doctorId);
        return { nama: doc?.user.username || 'Unknown', jumlah: dc._count.doctorId };
      })
      .sort((a, b) => b.jumlah - a.jumlah)
      .slice(0, 5);

    // Distribusi diagnosis (top 5) — dari rekam medis
    const records = await prisma.healthRecord.findMany({ select: { diagnosis: true } });
    const diagnosisCount = {};
    records.forEach(r => {
      diagnosisCount[r.diagnosis] = (diagnosisCount[r.diagnosis] || 0) + 1;
    });
    const topDiagnosis = Object.entries(diagnosisCount)
      .map(([diagnosis, jumlah]) => ({ diagnosis, jumlah }))
      .sort((a, b) => b.jumlah - a.jumlah)
      .slice(0, 5);

    res.json({
      totalUsers,
      totalDoctors,
      totalAppointments,
      perBulan,
      statusCount,
      topDoctors,
      topDiagnosis
    });
  } catch (error) {
    next(error);
  }
};
