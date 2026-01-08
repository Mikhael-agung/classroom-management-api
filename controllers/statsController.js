const Mahasiswa = require('../models/Mahasiswa');
const Dosen = require('../models/Dosen');
const Ruang = require('../models/Ruang');
const Jadwal = require('../models/Jadwal');
const Booking = require('../models/Booking');

// Get statistics
exports.getStats = async (req, res) => {
    try {
        const [mahasiswaCount, dosenCount, ruangCount, jadwalCount, bookingCount] = await Promise.all([
            Mahasiswa.countDocuments(),
            Dosen.countDocuments(),
            Ruang.countDocuments(),
            Jadwal.countDocuments(),
            Booking.countDocuments()
        ]);
        
        res.json({
            success: true,
            data: {
                total: {
                    mahasiswa: mahasiswaCount,
                    dosen: dosenCount,
                    ruang: ruangCount,
                    jadwal: jadwalCount,
                    booking: bookingCount
                },
                persentase: {
                    ruangTerpakai: ((bookingCount / ruangCount) * 100).toFixed(2) + '%'
                }
            }
        });
    } catch (error) {
        res.status(500).json({ 
            success: false,
            error: error.message 
        });
    }
};