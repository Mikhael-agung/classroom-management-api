const Dosen = require('../models/Dosen');
const Ruang = require('../models/Ruang');
const MataKuliah = require('../models/MatKul');

// Get all dosen
exports.getDosen = async (req, res) => {
    try {
        const dosen = await Dosen.find().select('kode_dosen nama prodi email');
        res.json({
            success: true,
            count: dosen.length,
            data: dosen
        });
    } catch (error) {
        res.status(500).json({ 
            success: false,
            error: error.message 
        });
    }
};

// Get all ruang
exports.getRuang = async (req, res) => {
    try {
        const { gedung, minKapasitas, page = 1, limit = 20 } = req.query;
        const skip = (page - 1) * limit;

        const query = {};
        if (gedung) query.gedung = gedung;
        if (minKapasitas) query.kapasitas = { $gte: parseInt(minKapasitas) };

        const [ruang, total] = await Promise.all([
            Ruang.find(query)
                .skip(skip)
                .limit(parseInt(limit))
                .select('kode nama kapasitas gedung lantai fasilitas'),
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

// Get all mata kuliah
exports.getMataKuliah = async (req, res) => {
    try {
        const { prodi, page = 1, limit = 20 } = req.query;
        const skip = (page - 1) * limit;

        const query = {};
        if (prodi) query.prodi = prodi;

        const [mataKuliah, total] = await Promise.all([
            MataKuliah.find(query)
                .populate('dosen_id', 'nama kode_dosen')
                .skip(skip)
                .limit(parseInt(limit))
                .sort({ kode: 1 }),
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

// ./controllers/dataController.js
exports.getSampleIds = async (req, res) => {
    try {
        // Get one sample from each collection
        const matkul = await MataKuliah.findOne().select('_id nama dosen_id');
        const ruang = await Ruang.findOne().select('_id kode nama');
        const dosen = await Dosen.findOne().select('_id kode_dosen nama');
        const jadwal = await Jadwal.findOne().select('_id hari jam_mulai');
        
        res.status(200).json({
            success: true,
            data: {
                mata_kuliah: matkul,
                ruang: ruang,
                dosen: dosen,
                jadwal: jadwal
            },
            instructions: "Use these IDs for testing API endpoints"
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

exports.getSamples = async (req, res) => {
    try {
        // Get multiple samples
        const matkulList = await MataKuliah.find().limit(5).select('_id nama dosen_id');
        const ruangList = await Ruang.find().limit(5).select('_id kode nama kapasitas');
        const dosenList = await Dosen.find().limit(5).select('_id kode_dosen nama prodi');
        
        res.status(200).json({
            success: true,
            data: {
                mata_kuliah: matkulList,
                ruang: ruangList,
                dosen: dosenList
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};