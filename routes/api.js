const express = require('express');
const router = express.Router();

// Import semua routes
const mahasiswaRoutes = require('./mahasiswaRoutes');
const jadwalRoutes = require('./jadwalRoutes');
const dataRoutes = require('./dataRoutes');
const statsRoutes = require('./statsRoutes');
const bookingRoutes = require('./bookingRoutes');

// API Documentation
router.get('/', (req, res) => {
    res.json({
        message: 'University Management System API',
        version: '2.0.0',
        description: 'API untuk sistem manajemen universitas dengan 8 jurusan dan 4 fakultas',
        endpoints: {
            mahasiswa: {
                path: '/api/mahasiswa',
                description: 'Operasi terkait mahasiswa',
                subpaths: [
                    'GET /api/mahasiswa/paginated - Get mahasiswa with pagination',
                    'GET /api/mahasiswa/search - Search mahasiswa',
                    'GET /api/mahasiswa/npm/:npm - Get mahasiswa by NPM',
                    'GET /api/mahasiswa/:npm/jadwal - Get jadwal mahasiswa',
                    'GET /api/mahasiswa/stats - Get mahasiswa statistics',
                    'POST /api/mahasiswa - Create new mahasiswa',
                    'PUT /api/mahasiswa/:id - Update mahasiswa',
                    'DELETE /api/mahasiswa/:id - Delete mahasiswa'
                ]
            },
            jadwal: {
                path: '/api/jadwal',
                description: 'Operasi terkait jadwal kuliah',
                subpaths: [
                    'POST /api/jadwal/insert - Insert jadwal (with conflict checking)',
                    'GET /api/jadwal/mahasiswa/:npm - Get jadwal by NPM',
                    'GET /api/jadwal/dosen/:nama - Get jadwal by dosen',
                    'GET /api/jadwal/all - Get all jadwal',
                    'GET /api/jadwal/jurusan/:jurusan - Get jadwal by jurusan',
                    'POST /api/jadwal/check-availability - Check room availability',
                    'DELETE /api/jadwal/clean-duplicates - Clean duplicate schedules',
                    'GET /api/jadwal/:id - Get jadwal by ID',
                    'POST /api/jadwal/assign-mahasiswa - Assign mahasiswa to jadwal'
                ]
            },
            data: {
                path: '/api/data',
                description: 'Data management and seeding',
                subpaths: [
                    'GET /api/data/dosen - Get all dosen',
                    'GET /api/data/ruang - Get all ruang',
                    'GET /api/data/mata-kuliah - Get all mata kuliah',
                    'GET /api/data/samples/ids - Get sample IDs',
                    'GET /api/data/samples/all - Get multiple samples',
                    'POST /api/data/seed - Seed database with dummy data',
                    'GET /api/data/seed/status - Get seeding status',
                    'GET /api/data/stats - Get data statistics',
                    'DELETE /api/data/clear - Clear all data (dangerous!)'
                ]
            },
            stats: {
                path: '/api/stats',
                description: 'Statistics and analytics',
                subpaths: [
                    'GET /api/stats - Get comprehensive statistics',
                    'GET /api/stats/dashboard - Get real-time dashboard stats',
                    'GET /api/stats/fakultas/:fakultas - Get faculty-specific statistics'
                ]
            },
            booking: {
                path: '/api/booking',
                description: 'Room booking operations',
                subpaths: [
                    'POST /api/booking - Create booking',
                    'GET /api/booking/ruang/:ruangId - Get booking by ruang',
                    'PUT /api/booking/:id/status - Update booking status',
                    'GET /api/booking/range - Get booking by date range',
                    'GET /api/booking/ruang/:ruangId/occupancy - Calculate occupancy rate',
                    'GET /api/booking/calendar - Get booking calendar view',
                    'GET /api/booking/available-rooms - Get available rooms'
                ]
            }
        },
        fakultas: ['Teknik', 'Ekonomi', 'Hukum', 'FISIP'],
        jurusan: [
            'Informatika', 'Sistem Informasi', 'Manajemen', 'Akuntansi',
            'Ilmu Hukum', 'Hukum Bisnis', 'Komunikasi', 'Hubungan Internasional'
        ],
        semester_tipe: ['Ganjil', 'Genap'],
        lokasi_gedung: ['Gedung A', 'Gedung B', 'Gedung C', 'Gedung D']
    });
});

// Mount semua routes
router.use('/mahasiswa', mahasiswaRoutes);
router.use('/jadwal', jadwalRoutes);
router.use('/data', dataRoutes);
router.use('/stats', statsRoutes);
router.use('/booking', bookingRoutes);

// 404 Handler untuk API routes
router.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        error: 'Endpoint tidak ditemukan',
        availableEndpoints: [
            '/api/mahasiswa',
            '/api/jadwal', 
            '/api/data',
            '/api/stats',
            '/api/booking'
        ]
    });
});

module.exports = router;