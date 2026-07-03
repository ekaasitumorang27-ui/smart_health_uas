const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Mulai seeding data awal...');

  // =======================================================
  // 1. ADMIN
  // =======================================================
  const adminPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@smarthealth.com' },
    update: {},
    create: {
      username: 'Admin Klinik',
      email: 'admin@smarthealth.com',
      password: adminPassword,
      role: 'ADMIN'
    }
  });
  console.log(`✅ Admin dibuat: ${admin.email} (password: admin123)`);

  // =======================================================
  // 2. DOKTER (3 contoh)
  // =======================================================
  const doctorPassword = await bcrypt.hash('dokter123', 10);

  const doctorsData = [
    { username: 'dr. Budi Santoso', email: 'budi@smarthealth.com', specialist: 'Dokter Umum' },
    { username: 'dr. Siti Aminah', email: 'siti@smarthealth.com', specialist: 'Spesialis Jantung' },
    { username: 'dr. Andi Wijaya', email: 'andi@smarthealth.com', specialist: 'Dokter Kulit' }
  ];

  for (const d of doctorsData) {
    const existingUser = await prisma.user.findUnique({ where: { email: d.email } });
    if (existingUser) {
      console.log(`⏭  Dokter ${d.username} sudah ada, dilewati.`);
      continue;
    }

    const doctor = await prisma.doctor.create({
      data: {
        specialist: d.specialist,
        user: {
          create: {
            username: d.username,
            email: d.email,
            password: doctorPassword,
            role: 'DOKTER'
          }
        },
        schedules: {
          create: [
            { dayOfWeek: 'Senin', startTime: '08:00', endTime: '12:00' },
            { dayOfWeek: 'Rabu', startTime: '13:00', endTime: '17:00' }
          ]
        }
      }
    });
    console.log(`✅ Dokter dibuat: ${d.username} (${d.email}, password: dokter123)`);
  }

  // =======================================================
  // 3. PASIEN CONTOH (1)
  // =======================================================
  const pasienPassword = await bcrypt.hash('pasien123', 10);
  const pasien = await prisma.user.upsert({
    where: { email: 'pasien@smarthealth.com' },
    update: {},
    create: {
      username: 'Pasien Contoh',
      email: 'pasien@smarthealth.com',
      password: pasienPassword,
      role: 'PASIEN'
    }
  });
  console.log(`✅ Pasien contoh dibuat: ${pasien.email} (password: pasien123)`);

  console.log('🌱 Seeding selesai!');
}

main()
  .catch((e) => {
    console.error('❌ Error saat seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
