require('dotenv').config();

const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const methodOverride = require('method-override');
const expressLayouts = require('express-ejs-layouts');
const path = require('path');

const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');

const app = express();

// =======================================================
// VIEW ENGINE
// =======================================================
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(expressLayouts);
app.set('layout', 'partials/layout');

// =======================================================
// MIDDLEWARE BAWAAN
// =======================================================
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(cookieParser());
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')));

// =======================================================
// HALAMAN UTAMA
// =======================================================
app.get('/', (req, res) => {
  res.render('landing', { title: 'Smart Health', layout: false });
});

// =======================================================
// ROUTES — HALAMAN (EJS, per role)
// =======================================================
app.use('/auth', require('./routes/authRoutes'));
app.use('/admin', require('./routes/pages/adminPages'));
app.use('/dokter', require('./routes/pages/dokterPages'));
app.use('/pasien', require('./routes/pages/pasienPages'));

// =======================================================
// ROUTES — REST API (JSON)
// =======================================================
app.use('/api/doctors', require('./routes/doctorRoutes'));
app.use('/api/appointments', require('./routes/appointmentRoutes'));
app.use('/api/health-records', require('./routes/healthRoutes'));
app.use('/api/prescriptions', require('./routes/prescriptionRoutes'));
app.use('/api/ratings', require('./routes/ratingRoutes'));
app.use('/api/dashboard', require('./routes/dashboardRoutes'));
app.use('/api/export', require('./routes/exportRoutes'));

// =======================================================
// 404 & ERROR HANDLER (selalu di paling bawah)
// =======================================================
app.use(notFoundHandler);
app.use(errorHandler);

// =======================================================
// RUN SERVER
// =======================================================
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(` Smart Health UAS running at http://localhost:${PORT}`);
});
