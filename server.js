require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('morgan');

// Import routes
const apiRoutes = require('./routes/api');

// Import seeding function
const { seedDatabase } = require('./data/seedData');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// Database connection
mongoose.connect(process.env.DATABASE_URL || 'mongodb://localhost:27017/university_db', {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log('✅ Connected to MongoDB'))
.catch(err => console.error('❌ MongoDB connection error:', err));

// API Routes
app.use('/api', apiRoutes);

// Health check
app.get('/health', (req, res) => {
    res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
        uptime: process.uptime()
    });
});

// Root endpoint
app.get('/', (req, res) => {
    res.json({
        message: 'University Management System API',
        version: '2.0.0',
        documentation: '/api',
        health: '/health',
        seeding: {
            manual: 'POST /api/data/seed',
            status: 'GET /api/data/seed/status'
        }
    });
});

// Manual seeding command
if (process.argv.includes('--seed')) {
    console.log('🌱 Running database seeding via command line...');
    seedDatabase().then(() => {
        console.log('✅ Seeding completed!');
        process.exit(0);
    }).catch(error => {
        console.error('❌ Seeding failed:', error);
        process.exit(1);
    });
}

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('🔥 Server error:', err.stack);
    res.status(500).json({
        success: false,
        error: 'Internal server error',
        message: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

// Start server
app.listen(PORT, () => {
    console.log('========================================');
    console.log(`🚀 Server running on port ${PORT}`);
    console.log('========================================');
    console.log('📚 API Documentation:');
    console.log(`   📍 Local: http://localhost:${PORT}/api`);
    console.log('========================================');
    console.log('🎓 Universitas dengan:');
    console.log('   👥 4 Fakultas: Teknik, Ekonomi, Hukum, FISIP');
    console.log('   🎓 8 Jurusan: Informatika, SI, Manajemen, Akuntansi, Ilmu Hukum, Hukum Bisnis, Komunikasi, HI');
    console.log('   📚 200 Mata Kuliah');
    console.log('   🏫 100 Ruang Kuliah');
    console.log('   👨‍🎓 5000 Mahasiswa');
    console.log('========================================');
    console.log('🌱 Untuk seeding database:');
    console.log('   🔸 API: POST /api/data/seed');
    console.log('   🔸 CLI: npm run seed');
    console.log('========================================');
});