const express = require('express');
const router = express.Router();

// Import all routes
const mahasiswaRoutes = require('./mahasiswaRoutes');
const jadwalRoutes = require('./jadwalRoutes');
const bookingRoutes = require('./bookingRoutes');
const dataRoutes = require('./dataRoutes');
const statsRoutes = require('./statsRoutes');

// Mount routes
router.use('/mahasiswa', mahasiswaRoutes);
router.use('/jadwal', jadwalRoutes);
router.use('/booking', bookingRoutes);
router.use('/data', dataRoutes);
router.use('/stats', statsRoutes);

// Seed endpoint
router.post('/seed', (req, res) => {
    res.json({
        success: true,
        message: 'Untuk generate 5000 data dummy, jalankan: npm run seed',
        note: 'Data akan di-generate: 5000 mahasiswa, 100 ruang, 200 mata kuliah, dll.'
    });
});

// Home API route
router.get('/', (req, res) => {
    res.json({
        message: '🎓 Classroom Management API',
        endpoints: {
            // 7 Operasi Utama
            '1. POST   /api/jadwal': 'Insert jadwal baru',
            '2. GET    /api/jadwal/npm/:npm': 'Get jadwal mahasiswa',
            '3. GET    /api/jadwal/dosen/:nama': 'Get jadwal dosen',
            '4. POST   /api/jadwal/cek': 'Cek ketersediaan ruang',
            '5. POST   /api/booking': 'Insert booking',
            '6. GET    /api/booking/ruang/:id': 'Get booking ruang',
            '7. GET    /api/booking/occupancy/:id': 'Hitung occupancy rate',
            
            // Data Dummy 5000
            'GET    /api/mahasiswa/paginated': '5000 mahasiswa (paginated)',
            'GET    /api/mahasiswa/search': 'Search mahasiswa',
            'GET    /api/mahasiswa/:npm': 'Get mahasiswa by NPM',
            
            // Data Lain
            'GET    /api/data/dosen': 'Get semua dosen',
            'GET    /api/data/ruang': 'Get semua ruang',
            'GET    /api/data/mata-kuliah': 'Get semua mata kuliah',
            'GET    /api/stats': 'Get statistics',
            
            // Seed
            'POST   /api/seed': 'Info seed data'
        }
    });
});

module.exports = router;