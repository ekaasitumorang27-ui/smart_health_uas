# Panduan Deploy ke Railway

## Environment Variables yang Perlu Diisi di Railway Dashboard

Setelah deploy, buka tab **Variables** di service Railway kamu, isi:

```
DATABASE_URL = (otomatis terisi kalau kamu pakai MySQL dari Railway, lewat tombol "Add Reference")
JWT_SECRET = smarthealth_uas_secret_key_eka_241112564
PORT = (Railway akan isi otomatis, tidak perlu diisi manual)
```

## Urutan Setup di Railway

1. Buat **New Project** di Railway
2. Klik **"Deploy from GitHub repo"**, pilih repo project ini
3. Klik **"+ New"** di dalam project yang sama, pilih **"Database" → "MySQL"**
4. Klik service aplikasi (bukan database), buka tab **Variables**
5. Tambah variable `JWT_SECRET` (isi terserah, ini cuma untuk enkripsi token login)
6. Tambah variable `DATABASE_URL`, klik tombol referensi, pilih `MySQL.DATABASE_URL` dari database yang baru dibuat
7. Buka tab **Settings**, di bagian **Build**, pastikan **Build Command** terisi: `npm run build`
8. Buka tab **Settings**, di bagian **Deploy**, pastikan **Start Command** terisi: `npm start`
9. Klik **Deploy**

## Setelah Deploy Berhasil

1. Buka tab **Settings → Networking**, klik **"Generate Domain"** untuk dapat URL publik
2. Untuk isi data awal (admin/dokter/pasien), buka tab service, klik menu **"..."** → **"Shell"** (atau lewat Railway CLI), jalankan:
   ```
   npm run seed
   ```
