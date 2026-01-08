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
        required: true
    },
    dosen_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Dosen'
    },
    prodi: {
        type: String,
        enum: ['Informatika', 'Sistem Informasi', 'Teknik Komputer']
    },
    semester: Number,
    deskripsi: String
}, {
    timestamps: true
});

module.exports = mongoose.model('MataKuliah', MataKuliahSchema);