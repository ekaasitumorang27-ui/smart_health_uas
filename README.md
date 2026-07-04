# Smart Health — Sistem Reservasi & Rekam Medis Klinik

UAS Back-End Web Development — Eka Anastsya Situmorang (241112564)

## Cara Menjalankan di Laptop (Windows)

1. **Install dependencies**
   ```
   npm install
   ```

2. **Siapkan database MySQL**
   - Buat database baru bernama `smart_health_uas` (lewat phpMyAdmin/HeidiSQL/XAMPP)
   - Sesuaikan `.env` jika port MySQL kamu bukan `3307`:
     ```
     DATABASE_URL="mysql://root:@localhost:3307/smart_health_uas"
     ```

3. **Generate Prisma Client & jalankan migration**
   ```
   npx prisma generate
   npx prisma migrate dev --name init
   ```

4. **(Opsional) Isi data awal** — admin, 3 dokter contoh, 1 pasien contoh
   ```
   npm run seed
   ```
   Setelah seed, kamu bisa login dengan:
   - Admin: `admin@smarthealth.com` / `admin123`
   - Dokter: `budi@smarthealth.com` / `dokter123` (atau siti@, andi@)
   - Pasien: `pasien@smarthealth.com` / `pasien123`

5. **Jalankan server**
   ```
   npm run dev
   ```
   Buka `http://localhost:3000`

## Struktur Folder

```
controllers/    -> logic bisnis tiap fitur (REST API)
middleware/     -> auth, role-guard, error handler, validasi input
routes/          -> definisi endpoint API
routes/pages/    -> definisi route halaman (EJS) per role
views/           -> template EJS (partials, auth, admin, dokter, pasien)
public/          -> CSS & JS statis
prisma/          -> schema database & seed
```

## Fitur Utama (8 fitur)

1. Autentikasi & Otorisasi berbasis Role (Admin/Dokter/Pasien)
2. Manajemen Dokter & Jadwal Praktik (Admin)
3. Reservasi Appointment dengan validasi anti-bentrok
4. Rekam Medis Digital (diisi Dokter, dibaca Pasien)
5. Resep Obat Digital (e-Prescription)
6. Export Rekam Medis ke PDF
7. Dashboard Statistik Admin (Chart.js)
8. Rating & Ulasan Dokter

## Catatan Migrasi dari Project UTS

Project ini adalah pengembangan dari project UTS "smart_health_app" (Prisma + MySQL).
Perubahan utama:
- Skema database diperluas dari 3 model menjadi 7 model
- Ditambahkan autentikasi JWT + role-based authorization di semua endpoint
- Ditambahkan 4 middleware custom
- Tampilan diganti total dari HTML vanilla menjadi EJS multi-halaman dengan desain custom
- Bug rekomendasi dokter (utils/healthRecommendation.js yang tidak terpakai di UTS) sudah diperbaiki

## Deploy ke Hosting

Lihat panduan deploy terpisah yang akan diberikan setelah testing lokal berhasil.
