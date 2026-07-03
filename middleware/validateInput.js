// =======================================================
// MIDDLEWARE: Validasi Input
// Factory function — kirim daftar field yang wajib diisi.
// Pemakaian: validateInput(['email', 'password'])
// =======================================================
function validateInput(requiredFields = []) {
  return (req, res, next) => {
    const missing = requiredFields.filter(field => {
      const value = req.body[field];
      return value === undefined || value === null || value.toString().trim() === '';
    });

    if (missing.length > 0) {
      const message = `Field wajib diisi: ${missing.join(', ')}`;

      if (req.originalUrl.startsWith('/api')) {
        return res.status(400).json({ message });
      }

      return res.status(400).render('error', {
        title: 'Input Tidak Valid',
        message,
        layout: false
      });
    }

    next();
  };
}

// =======================================================
// VALIDASI: format email sederhana
// =======================================================
function validateEmail(req, res, next) {
  const email = req.body.email;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (email && !emailRegex.test(email)) {
    const message = 'Format email tidak valid.';
    if (req.originalUrl.startsWith('/api')) {
      return res.status(400).json({ message });
    }
    return res.status(400).render('error', { title: 'Input Tidak Valid', message, layout: false });
  }

  next();
}

module.exports = { validateInput, validateEmail };
