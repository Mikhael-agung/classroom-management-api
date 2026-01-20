const mongoose = require('mongoose');

const JadwalSchema = new mongoose.Schema({
    mata_kuliah_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'MataKuliah',
        required: true,
        index: true
    },
    ruang_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Ruang',
        required: true,
        index: true
    },
    hari: {
        type: String,
        required: true,
        enum: ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'],
        index: true
    },
    jam_mulai: {
        type: String,
        required: true,
        match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/,
        index: true
    },
    jam_selesai: {
        type: String,
        required: true,
        match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/
    },
    semester_aktif: {
        type: String,
        required: true,
        index: true
    },
    kelas: {
        type: String,
        required: true
    }
}, {
    timestamps: true
});

// Index untuk conflict checking
JadwalSchema.index({ ruang_id: 1, hari: 1, jam_mulai: 1, jam_selesai: 1 });
JadwalSchema.index({ hari: 1, jam_mulai: 1, jam_selesai: 1 });

module.exports = mongoose.model('Jadwal', JadwalSchema);