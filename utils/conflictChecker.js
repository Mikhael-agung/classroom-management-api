const Jadwal = require('../models/Jadwal');
const Booking = require('../models/Booking');

exports.cekKonflikJadwal = async (ruang_id, hari, jam_mulai, jam_selesai, excludeId = null) => {
    const query = {
        ruang_id,
        hari,
        $or: [
            { jam_mulai: { $lt: jam_selesai, $gte: jam_mulai } },
            { jam_selesai: { $gt: jam_mulai, $lte: jam_selesai } },
            { 
                $and: [
                    { jam_mulai: { $lte: jam_mulai } },
                    { jam_selesai: { $gte: jam_selesai } }
                ]
            }
        ]
    };
    
    if (excludeId) {
        query._id = { $ne: excludeId };
    }
    
    return await Jadwal.findOne(query);
};

exports.cekKonflikBooking = async (ruang_id, tanggal, jam_mulai, jam_selesai, excludeId = null) => {
    const query = {
        ruang_id,
        tanggal: { $eq: new Date(tanggal) },
        $or: [
            { jam_mulai: { $lt: jam_selesai, $gte: jam_mulai } },
            { jam_selesai: { $gt: jam_mulai, $lte: jam_selesai } },
            { 
                $and: [
                    { jam_mulai: { $lte: jam_mulai } },
                    { jam_selesai: { $gte: jam_selesai } }
                ]
            }
        ]
    };
    
    if (excludeId) {
        query._id = { $ne: excludeId };
    }
    
    return await Booking.findOne(query);
};

exports.cekKonflikTotal = async (ruang_id, hari, tanggal, jam_mulai, jam_selesai) => {
    const konflikJadwal = await exports.cekKonflikJadwal(ruang_id, hari, jam_mulai, jam_selesai);
    const konflikBooking = await exports.cekKonflikBooking(ruang_id, tanggal, jam_mulai, jam_selesai);
    
    return {
        konflikJadwal,
        konflikBooking,
        adaKonflik: !!(konflikJadwal || konflikBooking)
    };
};