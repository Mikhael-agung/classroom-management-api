const Jadwal = require('../models/Jadwal');
const Mahasiswa = require('../models/Mahasiswa');
const Dosen = require('../models/Dosen');
const MataKuliah = require('../models/MatKul');
const Ruang = require('../models/Ruang');
const { cekKonflikJadwal, cekKonflikTotal } = require('../utils/conflictChecker');

// 1. Insert jadwal baru
exports.insertJadwal = async (req, res) => {
    try {
        const { ruang_id, hari, jam_mulai, jam_selesai, mata_kuliah_id } = req.body;

        // Validasi
        if (!ruang_id || !hari || !jam_mulai || !jam_selesai || !mata_kuliah_id) {
            return res.status(400).json({ 
                success: false,
                error: 'Semua field wajib diisi' 
            });
        }

        // Cek konflik
        const konflik = await cekKonflikJadwal(ruang_id, hari, jam_mulai, jam_selesai);

        if (konflik) {
            return res.status(400).json({
                success: false,
                error: 'Konflik jadwal',
                message: 'Ruang sudah dipakai pada jam tersebut',
                konflikDengan: konflik
            });
        }

        const jadwal = new Jadwal(req.body);
        await jadwal.save();

        res.status(201).json({
            success: true,
            message: 'Jadwal berhasil ditambahkan',
            data: jadwal
        });
    } catch (error) {
        res.status(500).json({ 
            success: false,
            error: error.message 
        });
    }
};

// 2. Get jadwal mahasiswa by NPM
exports.getJadwalByNPM = async (req, res) => {
    try {
        const mahasiswa = await Mahasiswa.findOne({ nim: req.params.npm });

        if (!mahasiswa) {
            return res.status(404).json({ 
                success: false,
                error: 'Mahasiswa tidak ditemukan' 
            });
        }

        // Cari jadwal berdasarkan prodi mahasiswa
        const jadwal = await Jadwal.find()
            .populate({
                path: 'mata_kuliah_id',
                match: { prodi: mahasiswa.prodi },
                select: 'kode nama sks'
            })
            .populate('ruang_id', 'kode nama gedung')
            .limit(10)
            .sort({ hari: 1, jam_mulai: 1 });

        // Filter hanya yang punya mata kuliah
        const filteredJadwal = jadwal.filter(j => j.mata_kuliah_id);

        res.json({
            success: true,
            mahasiswa: {
                nim: mahasiswa.nim,
                nama: mahasiswa.nama,
                prodi: mahasiswa.prodi
            },
            totalJadwal: filteredJadwal.length,
            data: filteredJadwal
        });
    } catch (error) {
        res.status(500).json({ 
            success: false,
            error: error.message 
        });
    }
};

// 3. Get jadwal dosen by nama
exports.getJadwalByDosen = async (req, res) => {
    try {
        const dosen = await Dosen.findOne({
            nama: { $regex: req.params.nama, $options: 'i' }
        });

        if (!dosen) {
            return res.status(404).json({ 
                success: false,
                error: 'Dosen tidak ditemukan' 
            });
        }

        // Cari mata kuliah yang diajar dosen ini
        const mataKuliah = await MataKuliah.find({ dosen_id: dosen._id });
        const mataKuliahIds = mataKuliah.map(mk => mk._id);
        
        const jadwal = await Jadwal.find({ mata_kuliah_id: { $in: mataKuliahIds } })
            .populate('mata_kuliah_id', 'kode nama sks')
            .populate('ruang_id', 'kode nama gedung')
            .sort({ hari: 1, jam_mulai: 1 });

        res.json({
            success: true,
            dosen: {
                kode: dosen.kode_dosen,
                nama: dosen.nama,
                prodi: dosen.prodi
            },
            totalJadwal: jadwal.length,
            data: jadwal
        });
    } catch (error) {
        res.status(500).json({ 
            success: false,
            error: error.message 
        });
    }
};

// 4. Cek ketersediaan ruang
exports.cekKetersediaanRuang = async (req, res) => {
    try {
        const { ruang_id, hari, jam_mulai, jam_selesai, tanggal } = req.body;

        if (!ruang_id || !hari || !jam_mulai || !jam_selesai) {
            return res.status(400).json({ 
                success: false,
                error: 'ruang_id, hari, jam_mulai, jam_selesai wajib diisi' 
            });
        }

        const konflik = await cekKonflikTotal(ruang_id, hari, tanggal, jam_mulai, jam_selesai);
        const ruang = await Ruang.findById(ruang_id).select('kode nama kapasitas');

        res.json({
            success: true,
            ruang: ruang,
            waktu: {
                hari: hari,
                jam: `${jam_mulai} - ${jam_selesai}`,
                tanggal: tanggal || 'N/A'
            },
            ketersediaan: {
                tersedia: !konflik.adaKonflik,
                adaKonflik: konflik.adaKonflik,
                konflikJadwal: konflik.konflikJadwal,
                konflikBooking: konflik.konflikBooking
            }
        });
    } catch (error) {
        res.status(500).json({ 
            success: false,
            error: error.message 
        });
    }
};

// Get all jadwal
exports.getAllJadwal = async (req, res) => {
    try {
        const { hari, page = 1, limit = 20 } = req.query;
        const skip = (page - 1) * limit;

        const query = {};
        if (hari) query.hari = hari;

        const [jadwal, total] = await Promise.all([
            Jadwal.find(query)
                .populate('mata_kuliah_id', 'kode nama sks')
                .populate('ruang_id', 'kode nama gedung')
                .skip(skip)
                .limit(parseInt(limit))
                .sort({ hari: 1, jam_mulai: 1 }),
            Jadwal.countDocuments(query)
        ]);

        res.json({
            success: true,
            page: parseInt(page),
            limit: parseInt(limit),
            totalPages: Math.ceil(total / limit),
            totalRecords: total,
            data: jadwal
        });
    } catch (error) {
        res.status(500).json({ 
            success: false,
            error: error.message 
        });
    }
};