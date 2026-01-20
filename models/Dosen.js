const mongoose = require('mongoose');

const DosenSchema = new mongoose.Schema({
    kode_dosen: {
        type: String,
        required: true,
        unique: true
    },
    nama: {
        type: String,
        required: true,
        index: true
    },
    fakultas: {
        type: String,
        required: true,
        enum: ['Teknik', 'Ekonomi', 'Hukum', 'FISIP'],
        index: true
    },
    jurusan: {
        type: String,
        required: true,
        enum: ['Informatika', 'Sistem Informasi', 'Manajemen', 'Akuntansi',
            'Ilmu Hukum', 'Hukum Bisnis', 'Komunikasi', 'Hubungan Internasional'],
        index: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    no_hp: String,
    keahlian: [String],
    status: {
        type: String,
        enum: ['active', 'non-active', 'cuti'],
        default: 'active'
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Dosen', DosenSchema);