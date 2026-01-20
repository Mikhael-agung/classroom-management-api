const mongoose = require('mongoose');

const MataKuliahSchema = new mongoose.Schema({
    kode: {
        type: String,
        required: true,
        unique: true
    },
    nama: {
        type: String,
        required: true,
        index: true
    },
    sks: {
        type: Number,
        required: true,
        min: 1,
        max: 6
    },
    dosen_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Dosen'
    },
    jurusan: {
        type: String,
        required: true,
        enum: ['Informatika', 'Sistem Informasi', 'Manajemen', 'Akuntansi',
            'Ilmu Hukum', 'Hukum Bisnis', 'Komunikasi', 'Hubungan Internasional'],
        index: true
    },
    fakultas: {
        type: String,
        required: true,
        enum: ['Teknik', 'Ekonomi', 'Hukum', 'FISIP'],
        index: true
    },
    semester_tipe: {
        type: String,
        required: true,
        enum: ['Ganjil'],
        index: true
    },
    semester: {
        type: Number,
        required: true,
        min: 1,
        max: 8
    },
    deskripsi: String
}, {
    timestamps: true
});

module.exports = mongoose.model('MataKuliah', MataKuliahSchema);