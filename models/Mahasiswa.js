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
    nama_lengkap: String,
    prodi: {
        type: String,
        required: true,
        enum: ['Informatika', 'Sistem Informasi', 'Teknik Komputer'],
        index: true
    },
    angkatan: {
        type: Number,
        required: true,
        index: true
    },
    email: String,
    no_hp: String,
    status: {
        type: String,
        enum: ['active', 'non-active', 'alumni'],
        default: 'active'
    },
    kelas_ids: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Jadwal'
    }]
}, {
    timestamps: true
});

module.exports = mongoose.model('Mahasiswa', MahasiswaSchema);