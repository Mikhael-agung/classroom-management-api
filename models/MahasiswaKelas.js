const mongoose = require('mongoose');

const MahasiswaKelasSchema = new mongoose.Schema({
    mahasiswa_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Mahasiswa',
        required: true,
        index: true
    },
    jadwal_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Jadwal',
        required: true,
        index: true
    },
    created_at: {
        type: Date,
        default: Date.now
    }
});

// Compound index untuk mencegah duplikasi
MahasiswaKelasSchema.index({ mahasiswa_id: 1, jadwal_id: 1 }, { unique: true });

module.exports = mongoose.model('MahasiswaKelas', MahasiswaKelasSchema);