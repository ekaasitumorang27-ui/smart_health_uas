// =======================================================
// MIDDLEWARE: Error Handler Global
// Menangkap semua error yang dilempar (atau next(error))
// dari controller mana pun, supaya respons error konsisten.
// =======================================================
function errorHandler(err, req, res, next) {
  console.error('🔥 ERROR:', err.message);

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Terjadi kesalahan pada server.';

  // Prisma error khusus (misal unique constraint, foreign key, dsb)
  if (err.code === 'P2002') {
    if (req.originalUrl.startsWith('/api')) {
      return res.status(400).json({ message: 'Data sudah ada (duplikat). Email mungkin sudah terdaftar.' });
    }
    return res.status(400).render('error', {
      title: 'Data Duplikat',
      message: 'Email sudah terdaftar, gunakan email lain.',
      layout: false
    });
  }

  if (req.originalUrl.startsWith('/api')) {
    return res.status(statusCode).json({ message });
  }

  res.status(statusCode).render('error', {
    title: 'Terjadi Kesalahan',
    message,
    layout: false
  });
}

// =======================================================
// MIDDLEWARE: 404 Not Found handler
// =======================================================
function notFoundHandler(req, res) {
  if (req.originalUrl.startsWith('/api')) {
    return res.status(404).json({ message: 'Endpoint tidak ditemukan.' });
  }
  res.status(404).render('error', {
    title: '404 - Halaman Tidak Ditemukan',
    message: 'Halaman yang Anda cari tidak ditemukan.',
    layout: false
  });
}

module.exports = { errorHandler, notFoundHandler };
