const mongoose = require('mongoose');

const MahasiswaSchema = new mongoose.Schema({
    nim: {
        type: String,
        required: true,
        unique: true,
        index: true
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
    angkatan: {
        type: Number,
        required: true,
        index: true
    },
    email: {
        type: String,
        required: true
    },
    no_hp: String,
    status: {
        type: String,
        enum: ['active', 'non-active', 'alumni'],
        default: 'active'
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Mahasiswa', MahasiswaSchema);