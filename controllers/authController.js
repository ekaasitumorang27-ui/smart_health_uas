const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../database');

// =======================================================
// GET: Halaman Register
// =======================================================
exports.getRegisterPage = (req, res) => {
  res.render('auth/register', { title: 'Daftar Akun', layout: false, error: null });
};

// =======================================================
// GET: Halaman Login
// =======================================================
exports.getLoginPage = (req, res) => {
  res.render('auth/login', { title: 'Login', layout: false, error: null });
};

// =======================================================
// POST: Proses Register
// Role default PASIEN. Role DOKTER hanya bisa dibuat oleh Admin
// lewat fitur manajemen dokter (lihat doctorController).
// =======================================================
exports.register = async (req, res, next) => {
  try {
    const { username, email, password, confirmPassword } = req.body;

    if (password !== confirmPassword) {
      return res.status(400).render('auth/register', {
        title: 'Daftar Akun',
        layout: false,
        error: 'Konfirmasi password tidak cocok.'
      });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).render('auth/register', {
        title: 'Daftar Akun',
        layout: false,
        error: 'Email sudah terdaftar. Silakan gunakan email lain.'
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        username,
        email,
        password: hashedPassword,
        role: 'PASIEN'
      }
    });

    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.cookie('token', token, { httpOnly: true, maxAge: 24 * 60 * 60 * 1000 });
    res.redirect('/pasien/dashboard');
  } catch (error) {
    next(error);
  }
};

// =======================================================
// POST: Proses Login
// =======================================================
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({
      where: { email },
      include: { doctorProfile: true }
    });

    if (!user) {
      return res.status(401).render('auth/login', {
        title: 'Login',
        layout: false,
        error: 'Email atau password salah.'
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).render('auth/login', {
        title: 'Login',
        layout: false,
        error: 'Email atau password salah.'
      });
    }

    const token = jwt.sign(
      {
        id: user.id,
        username: user.username,
        role: user.role,
        doctorId: user.doctorProfile?.id || null
      },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.cookie('token', token, { httpOnly: true, maxAge: 24 * 60 * 60 * 1000 });

    if (user.role === 'ADMIN') return res.redirect('/admin/dashboard');
    if (user.role === 'DOKTER') return res.redirect('/dokter/dashboard');
    return res.redirect('/pasien/dashboard');
  } catch (error) {
    next(error);
  }
};

// =======================================================
// GET: Logout
// =======================================================
exports.logout = (req, res) => {
  res.clearCookie('token');
  res.redirect('/auth/login');
};
