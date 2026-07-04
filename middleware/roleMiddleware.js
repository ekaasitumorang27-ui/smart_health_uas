// =======================================================
// MIDDLEWARE: Otorisasi berbasis Role
// Pemakaian: roleMiddleware('ADMIN'), roleMiddleware('ADMIN', 'DOKTER')
// Wajib dipasang SETELAH authMiddleware karena butuh req.user
// =======================================================
function roleMiddleware(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      if (req.originalUrl.startsWith('/api')) {
        return res.status(401).json({ message: 'Akses ditolak. Silakan login terlebih dahulu.' });
      }
      return res.redirect('/auth/login');
    }

    if (!allowedRoles.includes(req.user.role)) {
      if (req.originalUrl.startsWith('/api')) {
        return res.status(403).json({
          message: `Akses ditolak. Role "${req.user.role}" tidak memiliki izin untuk mengakses fitur ini.`
        });
      }
      return res.status(403).render('error', {
        title: 'Akses Ditolak',
        message: `Anda tidak memiliki izin (role: ${req.user.role}) untuk mengakses halaman ini.`,
        layout: false
      });
    }

    next();
  };
}

module.exports = roleMiddleware;
