const mongoose = require('mongoose');

const RuangSchema = new mongoose.Schema({
    kode: {
        type: String,
        required: true,
        unique: true,
        uppercase: true
    },
    nama: {
        type: String,
        required: true
    },
    kapasitas: {
        type: Number,
        required: true,
        min: 30,
        max: 50
    },
    fasilitas: [{
        type: String,
        enum: ['proyektor', 'AC', 'whiteboard', 'komputer', 'sound system', 'internet', 'mic', 'layar']
    }],
    lokasi_gedung: {
        type: String,
        required: true,
        enum: ['Gedung A', 'Gedung B', 'Gedung C', 'Gedung D'],
        index: true
    },
    lantai: {
        type: Number,
        required: true,
        min: 1,
        max: 6
    },
    status: {
        type: String,
        enum: ['active', 'maintenance', 'closed'],
        default: 'active'
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Ruang', RuangSchema);