const Mahasiswa = require('../models/Mahasiswa');

// Get mahasiswa dengan pagination
exports.getMahasiswaPaginated = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 50;
        const skip = (page - 1) * limit;

        const [mahasiswa, total] = await Promise.all([
            Mahasiswa.find()
                .sort({ nim: 1 })
                .skip(skip)
                .limit(limit)
                .select('nim nama prodi angkatan email'),
            Mahasiswa.countDocuments()
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
        res.status(500).json({ error: error.message });
    }
};

// Search mahasiswa
exports.searchMahasiswa = async (req, res) => {
    try {
        const { nim, nama, prodi, angkatan, page = 1, limit = 50 } = req.query;
        const skip = (page - 1) * limit;

        const query = {};
        if (nim) query.nim = { $regex: nim, $options: 'i' };
        if (nama) query.nama = { $regex: nama, $options: 'i' };
        if (prodi) query.prodi = prodi;
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
            filters: { nim, nama, prodi, angkatan },
            page: parseInt(page),
            limit: parseInt(limit),
            totalPages: Math.ceil(total / limit),
            totalRecords: total,
            data: mahasiswa
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get mahasiswa by NPM
exports.getMahasiswaByNPM = async (req, res) => {
    try {
        const mahasiswa = await Mahasiswa.findOne({ nim: req.params.npm })
            .select('nim nama prodi angkatan email no_hp status');

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