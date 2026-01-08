require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/classroom_db', {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
    .then(() => console.log('✅ MongoDB Connected'))
    .catch(err => console.error('❌ MongoDB Connection Error:', err));

// Import routes
const apiRoutes = require('./routes/api');

// Use routes
app.use('/api', apiRoutes);

// Home route
app.get('/', (req, res) => {
    res.json({
        message: '🎓 Classroom Management API - Tugas Kuliah',
        author: 'Your Name',
        description: 'API untuk sistem manajemen ruang kuliah dengan 5000 data dummy',
        totalData: {
            mahasiswa: 5000,
            dosen: 10,
            ruang: 100,
            mataKuliah: 200,
            jadwal: 500,
            booking: 100
        },
        endpoints: [
            '=== 7 OPERASI UTAMA ===',
            '1. POST   /api/jadwal           - Insert jadwal baru (dengan cek konflik)',
            '2. GET    /api/jadwal/npm/:npm  - Get jadwal mahasiswa by NPM',
            '3. GET    /api/jadwal/dosen/:nama - Get jadwal dosen by nama',
            '4. POST   /api/jadwal/cek       - Cek ketersediaan ruang',
            '5. POST   /api/booking          - Insert booking ruang (dengan cek konflik)',
            '6. GET    /api/booking/ruang/:id - Get semua booking untuk ruang tertentu',
            '7. GET    /api/booking/occupancy/:id - Hitung occupancy rate per ruang',
            '',
            '=== DATA DUMMY 5000 ===',
            'GET    /api/mahasiswa/paginated?page=1&limit=50',
            'GET    /api/mahasiswa/search?prodi=Informatika',
            'GET    /api/mahasiswa/:npm',
            '',
            '=== DATA LAIN ===',
            'GET    /api/dosen',
            'GET    /api/ruang',
            'GET    /api/jadwal/all',
            'GET    /api/stats',
            '',
            '=== SEED DATA ===',
            'POST   /api/seed               - Info seed data',
            'npm run seed                   - Generate 5000 data dummy'
        ],
        note: 'API ini TANPA LOGIN/AUTH, langsung bisa dipakai di Postman!'
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: 'Endpoint tidak ditemukan' });
});

// Error handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Internal Server Error' });
});

// Start server
app.listen(PORT, () => {
    console.log(`========================================`);
    console.log(`🚀 SERVER BERJALAN: http://localhost:${PORT}`);
    console.log(`📚 Database: ${process.env.MONGODB_URI || 'classroom_db'}`);
    console.log(`🐛 Debug Mode: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🎓 Total Data: 5000+ mahasiswa, 100+ ruang, 200+ mata kuliah`);
    console.log(`========================================`);
});