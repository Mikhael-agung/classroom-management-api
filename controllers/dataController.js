const Dosen = require('../models/Dosen');
const Ruang = require('../models/Ruang');
const MataKuliah = require('../models/MatKul');
const Mahasiswa = require('../models/Mahasiswa');
const Jadwal = require('../models/Jadwal');
const Booking = require('../models/Booking');
const MahasiswaKelas = require('../models/MahasiswaKelas');

// Get all dosen - UPDATE
exports.getDosen = async (req, res) => {
    try {
        const { fakultas, jurusan, page = 1, limit = 20 } = req.query;
        const skip = (page - 1) * limit;

        const query = {};
        if (fakultas) query.fakultas = fakultas;
        if (jurusan) query.jurusan = jurusan;

        const [dosen, total] = await Promise.all([
            Dosen.find(query)
                .skip(skip)
                .limit(parseInt(limit))
                .select('kode_dosen nama fakultas jurusan email keahlian status')
                .sort({ nama: 1 }),
            Dosen.countDocuments(query)
        ]);

        res.json({
            success: true,
            page: parseInt(page),
            limit: parseInt(limit),
            totalPages: Math.ceil(total / limit),
            totalRecords: total,
            data: dosen
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

// Get all ruang - UPDATE
exports.getRuang = async (req, res) => {
    try {
        const { lokasi_gedung, minKapasitas, maxKapasitas, page = 1, limit = 20 } = req.query;
        const skip = (page - 1) * limit;

        const query = {};
        if (lokasi_gedung) query.lokasi_gedung = lokasi_gedung;
        if (minKapasitas) query.kapasitas = { $gte: parseInt(minKapasitas) };
        if (maxKapasitas) query.kapasitas = { ...query.kapasitas, $lte: parseInt(maxKapasitas) };

        const [ruang, total] = await Promise.all([
            Ruang.find(query)
                .skip(skip)
                .limit(parseInt(limit))
                .select('kode nama kapasitas lokasi_gedung lantai fasilitas status')
                .sort({ lokasi_gedung: 1, lantai: 1, kode: 1 }),
            Ruang.countDocuments(query)
        ]);

        res.json({
            success: true,
            page: parseInt(page),
            limit: parseInt(limit),
            totalPages: Math.ceil(total / limit),
            totalRecords: total,
            data: ruang
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

// Get all mata kuliah - UPDATE
exports.getMataKuliah = async (req, res) => {
    try {
        const { fakultas, jurusan, semester_tipe, semester, page = 1, limit = 20 } = req.query;
        const skip = (page - 1) * limit;

        const query = {};
        if (fakultas) query.fakultas = fakultas;
        if (jurusan) query.jurusan = jurusan;
        if (semester_tipe) query.semester_tipe = semester_tipe;
        if (semester) query.semester = parseInt(semester);

        const [mataKuliah, total] = await Promise.all([
            MataKuliah.find(query)
                .populate('dosen_id', 'nama kode_dosen fakultas jurusan')
                .skip(skip)
                .limit(parseInt(limit))
                .sort({ jurusan: 1, semester: 1, kode: 1 }),
            MataKuliah.countDocuments(query)
        ]);

        res.json({
            success: true,
            page: parseInt(page),
            limit: parseInt(limit),
            totalPages: Math.ceil(total / limit),
            totalRecords: total,
            data: mataKuliah
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

// Get sample IDs for testing
exports.getSampleIds = async (req, res) => {
    try {
        // Get one sample from each collection
        const [matkul, ruang, dosen, jadwal, mahasiswa] = await Promise.all([
            MataKuliah.findOne().select('_id nama kode jurusan fakultas'),
            Ruang.findOne().select('_id kode nama lokasi_gedung'),
            Dosen.findOne().select('_id kode_dosen nama fakultas'),
            Jadwal.findOne().select('_id hari jam_mulai semester_aktif'),
            Mahasiswa.findOne().select('_id nim nama jurusan')
        ]);
        
        res.status(200).json({
            success: true,
            data: {
                mata_kuliah: matkul,
                ruang: ruang,
                dosen: dosen,
                jadwal: jadwal,
                mahasiswa: mahasiswa
            },
            instructions: "Use these IDs for testing API endpoints"
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// Seeding endpoint - TAMBAH IMPORT
exports.seedDatabase = async (req, res) => {
    try {
        res.status(202).json({
            success: true,
            message: 'Seeding process started in background. Check server logs for details.',
            note: 'This is an asynchronous operation. Data is being generated...'
        });

        // Run seeding in background
        setTimeout(async () => {
            try {
                const { seedDatabase } = require('../../data/seedData');
                await seedDatabase();
                console.log('✅ Seeding completed via API');
            } catch (error) {
                console.error('❌ Seeding error:', error);
            }
        }, 100);

    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

// Get seeding status - UPDATE
exports.getSeedingStatus = async (req, res) => {
    try {
        const counts = await Promise.all([
            Mahasiswa.countDocuments(),
            Dosen.countDocuments(),
            MataKuliah.countDocuments(),
            Ruang.countDocuments(),
            Jadwal.countDocuments(),
            MahasiswaKelas.countDocuments(),
            Booking.countDocuments()
        ]);

        const [mahasiswa, dosen, mataKuliah, ruang, jadwal, mahasiswaKelas, booking] = counts;

        res.json({
            success: true,
            data: {
                mahasiswa,
                dosen,
                mataKuliah,
                ruang,
                jadwal,
                mahasiswaKelas,
                booking,
                total: mahasiswa + dosen + mataKuliah + ruang + jadwal + mahasiswaKelas + booking
            },
            status: 'completed'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

// Get samples
exports.getSamples = async (req, res) => {
    try {
        // Get multiple samples
        const [matkulList, ruangList, dosenList, mahasiswaList, jadwalList] = await Promise.all([
            MataKuliah.find().limit(5).select('_id nama kode jurusan fakultas sks'),
            Ruang.find().limit(5).select('_id kode nama lokasi_gedung kapasitas'),
            Dosen.find().limit(5).select('_id kode_dosen nama fakultas jurusan'),
            Mahasiswa.find().limit(5).select('_id nim nama fakultas jurusan angkatan'),
            Jadwal.find().limit(5).select('_id hari jam_mulai jam_selesai semester_aktif')
        ]);

        res.status(200).json({
            success: true,
            data: {
                mata_kuliah: matkulList,
                ruang: ruangList,
                dosen: dosenList,
                mahasiswa: mahasiswaList,
                jadwal: jadwalList
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// Get data statistics
exports.getDataStats = async (req, res) => {
    try {
        const [mahasiswaStats, dosenStats, matkulStats, ruangStats] = await Promise.all([
            // Mahasiswa stats per jurusan dan fakultas
            Mahasiswa.aggregate([
                {
                    $group: {
                        _id: { fakultas: "$fakultas", jurusan: "$jurusan" },
                        total: { $sum: 1 },
                        perAngkatan: {
                            $push: "$angkatan"
                        }
                    }
                },
                {
                    $project: {
                        _id: 0,
                        fakultas: "$_id.fakultas",
                        jurusan: "$_id.jurusan",
                        total: 1,
                        angkatan2022: { $size: { $filter: { input: "$perAngkatan", as: "a", cond: { $eq: ["$$a", 2022] } } } },
                        angkatan2023: { $size: { $filter: { input: "$perAngkatan", as: "a", cond: { $eq: ["$$a", 2023] } } } },
                        angkatan2024: { $size: { $filter: { input: "$perAngkatan", as: "a", cond: { $eq: ["$$a", 2024] } } } },
                        angkatan2025: { $size: { $filter: { input: "$perAngkatan", as: "a", cond: { $eq: ["$$a", 2025] } } } }
                    }
                },
                { $sort: { fakultas: 1, jurusan: 1 } }
            ]),
            
            // Dosen stats
            Dosen.aggregate([
                {
                    $group: {
                        _id: { fakultas: "$fakultas", jurusan: "$jurusan" },
                        total: { $sum: 1 }
                    }
                },
                {
                    $project: {
                        _id: 0,
                        fakultas: "$_id.fakultas",
                        jurusan: "$_id.jurusan",
                        total: 1
                    }
                },
                { $sort: { fakultas: 1 } }
            ]),
            
            // Mata kuliah stats
            MataKuliah.aggregate([
                {
                    $group: {
                        _id: { fakultas: "$fakultas", jurusan: "$jurusan", semester_tipe: "$semester_tipe" },
                        total: { $sum: 1 },
                        totalSKS: { $sum: "$sks" },
                        avgSKS: { $avg: "$sks" }
                    }
                },
                {
                    $project: {
                        _id: 0,
                        fakultas: "$_id.fakultas",
                        jurusan: "$_id.jurusan",
                        semester_tipe: "$_id.semester_tipe",
                        total: 1,
                        totalSKS: 1,
                        avgSKS: { $round: ["$avgSKS", 2] }
                    }
                },
                { $sort: { fakultas: 1, jurusan: 1 } }
            ]),
            
            // Ruang stats
            Ruang.aggregate([
                {
                    $group: {
                        _id: "$lokasi_gedung",
                        total: { $sum: 1 },
                        totalKapasitas: { $sum: "$kapasitas" },
                        avgKapasitas: { $avg: "$kapasitas" },
                        minKapasitas: { $min: "$kapasitas" },
                        maxKapasitas: { $max: "$kapasitas" }
                    }
                },
                {
                    $project: {
                        _id: 0,
                        lokasi_gedung: "$_id",
                        total: 1,
                        totalKapasitas: 1,
                        avgKapasitas: { $round: ["$avgKapasitas", 0] },
                        minKapasitas: 1,
                        maxKapasitas: 1
                    }
                },
                { $sort: { lokasi_gedung: 1 } }
            ])
        ]);

        res.json({
            success: true,
            data: {
                mahasiswa: mahasiswaStats,
                dosen: dosenStats,
                mata_kuliah: matkulStats,
                ruang: ruangStats
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

// Clear all data
exports.clearAllData = async (req, res) => {
    try {
        // Konfirmasi password untuk keamanan
        const { confirmation, password } = req.body;
        
        if (!confirmation || confirmation !== 'DELETE_ALL_DATA') {
            return res.status(400).json({
                success: false,
                error: 'Konfirmasi tidak valid. Kirim {"confirmation": "DELETE_ALL_DATA"} untuk melanjutkan'
            });
        }

        // Optional: tambahkan password jika diperlukan
        if (password && password !== process.env.ADMIN_PASSWORD) {
            return res.status(401).json({
                success: false,
                error: 'Password tidak valid'
            });
        }

        console.log('🧹 Clearing all data...');
        
        // Hapus data dalam urutan yang benar (untuk referensi foreign key)
        const results = await Promise.allSettled([
            MahasiswaKelas.deleteMany({}),
            Booking.deleteMany({}),
            Jadwal.deleteMany({}),
            MataKuliah.deleteMany({}),
            Mahasiswa.deleteMany({}),
            Dosen.deleteMany({}),
            Ruang.deleteMany({})
        ]);

        const deletedCounts = {
            mahasiswaKelas: results[0].value?.deletedCount || 0,
            booking: results[1].value?.deletedCount || 0,
            jadwal: results[2].value?.deletedCount || 0,
            mataKuliah: results[3].value?.deletedCount || 0,
            mahasiswa: results[4].value?.deletedCount || 0,
            dosen: results[5].value?.deletedCount || 0,
            ruang: results[6].value?.deletedCount || 0,
            total: results.reduce((sum, result) => sum + (result.value?.deletedCount || 0), 0)
        };

        console.log(`✅ Cleared ${deletedCounts.total} documents`);

        res.json({
            success: true,
            message: 'Semua data berhasil dihapus',
            deleted: deletedCounts,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('❌ Error clearing data:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};