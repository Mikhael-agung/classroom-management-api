const Mahasiswa = require('../models/Mahasiswa');
const MahasiswaKelas = require('../models/MahasiswaKelas');
const Jadwal = require('../models/Jadwal');
const MataKuliah = require('../models/MatKul');

// Get mahasiswa dengan pagination
exports.getMahasiswaPaginated = async (req, res) => {
    try {
        const { fakultas, jurusan, angkatan, status, page = 1, limit = 50 } = req.query;
        const skip = (page - 1) * limit;

        // Build query berdasarkan model baru
        const query = {};
        if (fakultas) query.fakultas = fakultas;
        if (jurusan) query.jurusan = jurusan;
        if (angkatan) query.angkatan = parseInt(angkatan);
        if (status) query.status = status;

        const [mahasiswa, total] = await Promise.all([
            Mahasiswa.find(query)
                .sort({ nim: 1 })
                .skip(skip)
                .limit(limit)
                .select('nim nama fakultas jurusan angkatan email status'),
            Mahasiswa.countDocuments(query)
        ]);

        res.json({
            success: true,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
            totalRecords: total,
            data: mahasiswa
        });
    } catch (error) {
        res.status(500).json({ 
            success: false,
            error: error.message 
        });
    }
};

// Search mahasiswa
exports.searchMahasiswa = async (req, res) => {
    try {
        const { nim, nama, fakultas, jurusan, angkatan, page = 1, limit = 50 } = req.query;
        const skip = (page - 1) * limit;

        // Build query dengan field baru
        const query = {};
        if (nim) query.nim = { $regex: nim, $options: 'i' };
        if (nama) query.nama = { $regex: nama, $options: 'i' };
        if (fakultas) query.fakultas = fakultas;
        if (jurusan) query.jurusan = jurusan;
        if (angkatan) query.angkatan = parseInt(angkatan);

        const [mahasiswa, total] = await Promise.all([
            Mahasiswa.find(query)
                .sort({ nim: 1 })
                .skip(skip)
                .limit(parseInt(limit)),
            Mahasiswa.countDocuments(query)
        ]);

        res.json({
            success: true,
            filters: { nim, nama, fakultas, jurusan, angkatan },
            page: parseInt(page),
            limit: parseInt(limit),
            totalPages: Math.ceil(total / limit),
            totalRecords: total,
            data: mahasiswa
        });
    } catch (error) {
        res.status(500).json({ 
            success: false,
            error: error.message 
        });
    }
};

// Get mahasiswa by NPM (NIM)
exports.getMahasiswaByNPM = async (req, res) => {
    try {
        const mahasiswa = await Mahasiswa.findOne({ nim: req.params.npm })
            .select('nim nama fakultas jurusan angkatan email no_hp status');

        if (!mahasiswa) {
            return res.status(404).json({ 
                success: false,
                error: 'Mahasiswa tidak ditemukan' 
            });
        }

        res.json({
            success: true,
            data: mahasiswa
        });
    } catch (error) {
        res.status(500).json({ 
            success: false,
            error: error.message 
        });
    }
};

// Get jadwal mahasiswa by NPM
exports.getJadwalMahasiswa = async (req, res) => {
    try {
        const { npm } = req.params;
        
        // Cari mahasiswa
        const mahasiswa = await Mahasiswa.findOne({ nim: npm });
        if (!mahasiswa) {
            return res.status(404).json({
                success: false,
                error: 'Mahasiswa tidak ditemukan'
            });
        }

        // Cari semua jadwal mahasiswa melalui MahasiswaKelas
        const mahasiswaKelas = await MahasiswaKelas.find({ 
            mahasiswa_id: mahasiswa._id 
        }).populate({
            path: 'jadwal_id',
            populate: [
                {
                    path: 'mata_kuliah_id',
                    select: 'nama kode sks jurusan semester_tipe semester'
                },
                {
                    path: 'ruang_id',
                    select: 'nama lokasi_gedung kapasitas'
                }
            ]
        });

        // Format response
        const jadwal = mahasiswaKelas.map(item => ({
            id: item.jadwal_id._id,
            hari: item.jadwal_id.hari,
            jam_mulai: item.jadwal_id.jam_mulai,
            jam_selesai: item.jadwal_id.jam_selesai,
            semester_aktif: item.jadwal_id.semester_aktif,
            kelas: item.jadwal_id.kelas,
            mata_kuliah: {
                nama: item.jadwal_id.mata_kuliah_id.nama,
                kode: item.jadwal_id.mata_kuliah_id.kode,
                sks: item.jadwal_id.mata_kuliah_id.sks,
                jurusan: item.jadwal_id.mata_kuliah_id.jurusan,
                semester: item.jadwal_id.mata_kuliah_id.semester,
                semester_tipe: item.jadwal_id.mata_kuliah_id.semester_tipe
            },
            ruang: {
                nama: item.jadwal_id.ruang_id.nama,
                lokasi_gedung: item.jadwal_id.ruang_id.lokasi_gedung,
                kapasitas: item.jadwal_id.ruang_id.kapasitas
            }
        }));

        // Group by hari
        const jadwalByHari = {};
        jadwal.forEach(item => {
            if (!jadwalByHari[item.hari]) {
                jadwalByHari[item.hari] = [];
            }
            jadwalByHari[item.hari].push(item);
        });

        // Urutkan jam
        Object.keys(jadwalByHari).forEach(hari => {
            jadwalByHari[hari].sort((a, b) => {
                const [aHour, aMin] = a.jam_mulai.split(':').map(Number);
                const [bHour, bMin] = b.jam_mulai.split(':').map(Number);
                return (aHour * 60 + aMin) - (bHour * 60 + bMin);
            });
        });

        res.json({
            success: true,
            mahasiswa: {
                nim: mahasiswa.nim,
                nama: mahasiswa.nama,
                fakultas: mahasiswa.fakultas,
                jurusan: mahasiswa.jurusan,
                angkatan: mahasiswa.angkatan
            },
            total_jadwal: jadwal.length,
            total_sks: jadwal.reduce((total, item) => total + item.mata_kuliah.sks, 0),
            jadwal: jadwalByHari
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

// Get statistik mahasiswa per jurusan/fakultas
exports.getStatsMahasiswa = async (req, res) => {
    try {
        const { groupBy = 'jurusan' } = req.query; // 'jurusan' atau 'fakultas'
        
        const aggregation = [
            {
                $group: {
                    _id: `$${groupBy}`,
                    total: { $sum: 1 },
                    perAngkatan: {
                        $push: {
                            angkatan: "$angkatan",
                            count: 1
                        }
                    }
                }
            },
            {
                $project: {
                    _id: 0,
                    [groupBy]: "$_id",
                    total: 1,
                    perAngkatan: {
                        $reduce: {
                            input: "$perAngkatan",
                            initialValue: [],
                            in: {
                                $let: {
                                    vars: {
                                        found: {
                                            $filter: {
                                                input: "$$value",
                                                as: "item",
                                                cond: { $eq: ["$$item.angkatan", "$$this.angkatan"] }
                                            }
                                        }
                                    },
                                    in: {
                                        $cond: {
                                            if: { $gt: [{ $size: "$$found" }, 0] },
                                            then: {
                                                $map: {
                                                    input: "$$value",
                                                    as: "item",
                                                    in: {
                                                        $cond: {
                                                            if: { $eq: ["$$item.angkatan", "$$this.angkatan"] },
                                                            then: {
                                                                angkatan: "$$item.angkatan",
                                                                count: { $add: ["$$item.count", 1] }
                                                            },
                                                            else: "$$item"
                                                        }
                                                    }
                                                }
                                            },
                                            else: {
                                                $concatArrays: [
                                                    "$$value",
                                                    [{ angkatan: "$$this.angkatan", count: 1 }]
                                                ]
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            },
            { $sort: { total: -1 } }
        ];

        const stats = await Mahasiswa.aggregate(aggregation);

        res.json({
            success: true,
            groupBy,
            totalMahasiswa: await Mahasiswa.countDocuments(),
            stats
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

// Create new mahasiswa
exports.createMahasiswa = async (req, res) => {
    try {
        const { nim, nama, fakultas, jurusan, angkatan, email, no_hp } = req.body;

        // Validate required fields
        if (!nim || !nama || !fakultas || !jurusan || !angkatan) {
            return res.status(400).json({
                success: false,
                error: 'NIM, nama, fakultas, jurusan, dan angkatan harus diisi'
            });
        }

        // Check if NIM already exists
        const existingMahasiswa = await Mahasiswa.findOne({ nim });
        if (existingMahasiswa) {
            return res.status(400).json({
                success: false,
                error: 'NIM sudah terdaftar'
            });
        }

        // Create new mahasiswa
        const mahasiswa = new Mahasiswa({
            nim,
            nama,
            fakultas,
            jurusan,
            angkatan: parseInt(angkatan),
            email,
            no_hp,
            status: 'active'
        });

        await mahasiswa.save();

        res.status(201).json({
            success: true,
            message: 'Mahasiswa berhasil ditambahkan',
            data: mahasiswa
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

// Update mahasiswa
exports.updateMahasiswa = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        // Remove fields that shouldn't be updated
        delete updates.nim;
        delete updates._id;

        const mahasiswa = await Mahasiswa.findByIdAndUpdate(
            id,
            updates,
            { new: true, runValidators: true }
        );

        if (!mahasiswa) {
            return res.status(404).json({
                success: false,
                error: 'Mahasiswa tidak ditemukan'
            });
        }

        res.json({
            success: true,
            message: 'Mahasiswa berhasil diupdate',
            data: mahasiswa
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

// Delete mahasiswa
exports.deleteMahasiswa = async (req, res) => {
    try {
        const { id } = req.params;

        // Hapus data terkait di MahasiswaKelas
        await MahasiswaKelas.deleteMany({ mahasiswa_id: id });

        const mahasiswa = await Mahasiswa.findByIdAndDelete(id);

        if (!mahasiswa) {
            return res.status(404).json({
                success: false,
                error: 'Mahasiswa tidak ditemukan'
            });
        }

        res.json({
            success: true,
            message: 'Mahasiswa berhasil dihapus'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};