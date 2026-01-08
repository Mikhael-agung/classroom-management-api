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
        min: 10
    },
    fasilitas: [{
        type: String,
        enum: ['proyektor', 'AC', 'whiteboard', 'komputer', 'sound system', 'internet']
    }],
    gedung: {
        type: String,
        required: true
    },
    lantai: {
        type: Number,
        default: 1
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