const mongoose = require('mongoose');

const BookingSchema = new mongoose.Schema({
    ruang_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Ruang',
        required: true,
        index: true
    },
    tanggal: {
        type: Date,
        required: true
    },
    jam_mulai: {
        type: String,
        required: true,
        match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/
    },
    jam_selesai: {
        type: String,
        required: true,
        match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/
    },
    pemohon: {
        type: String,
        required: true
    },
    keperluan: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected', 'canceled'],
        default: 'pending'
    },
    kontak: String,
    jumlah_peserta: Number
}, {
    timestamps: true
});

BookingSchema.index({ ruang_id: 1, tanggal: 1, jam_mulai: 1, jam_selesai: 1 });

module.exports = mongoose.model('Booking', BookingSchema);