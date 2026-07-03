const jwt = require('jsonwebtoken');

// =======================================================
// MIDDLEWARE: Verifikasi token JWT
// Token diambil dari cookie "token" (untuk halaman EJS)
// atau header Authorization (untuk akses API langsung)
// =======================================================
function authMiddleware(req, res, next) {
  try {
    const tokenFromCookie = req.cookies?.token;
    const tokenFromHeader = req.headers.authorization?.startsWith('Bearer ')
      ? req.headers.authorization.split(' ')[1]
      : null;

    const token = tokenFromCookie || tokenFromHeader;

    if (!token) {
      // Jika request API (mengharapkan JSON), kirim 401 JSON
      if (req.originalUrl.startsWith('/api')) {
        return res.status(401).json({ message: 'Akses ditolak. Silakan login terlebih dahulu.' });
      }
      // Jika request halaman, redirect ke login
      return res.redirect('/auth/login');
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { id, role, username }
    res.locals.currentUser = decoded; // tersedia langsung di semua view EJS

    next();
  } catch (error) {
    if (req.originalUrl.startsWith('/api')) {
      return res.status(401).json({ message: 'Token tidak valid atau sudah kedaluwarsa.' });
    }
    res.clearCookie('token');
    return res.redirect('/auth/login');
  }
}

module.exports = authMiddleware;
