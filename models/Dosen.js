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
    prodi: {
        type: String,
        enum: ['Informatika', 'Sistem Informasi', 'Teknik Komputer']
    },
    email: String,
    mata_kuliah_ids: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'MataKuliah'
    }]
}, {
    timestamps: true
});

module.exports = mongoose.model('Dosen', DosenSchema);