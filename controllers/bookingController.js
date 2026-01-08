const Booking = require('../models/Booking');
const Ruang = require('../models/Ruang');
const { cekKonflikBooking } = require('../utils/conflictChecker');

// 5. Insert booking
exports.insertBooking = async (req, res) => {
    try {
        const { ruang_id, tanggal, jam_mulai, jam_selesai, pemohon, keperluan } = req.body;

        // Validasi
        if (!ruang_id || !tanggal || !jam_mulai || !jam_selesai || !pemohon || !keperluan) {
            return res.status(400).json({ 
                success: false,
                error: 'Semua field wajib diisi' 
            });
        }

        // Cek apakah ruang ada
        const ruang = await Ruang.findById(ruang_id);
        if (!ruang) {
            return res.status(404).json({ 
                success: false,
                error: 'Ruang tidak ditemukan' 
            });
        }

        // Cek konflik
        const konflikBooking = await cekKonflikBooking(ruang_id, tanggal, jam_mulai, jam_selesai);

        if (konflikBooking) {
            return res.status(400).json({
                success: false,
                error: 'Ruangan sudah dibooking',
                message: `Ruang ${ruang.kode} sudah dibooking oleh ${konflikBooking.pemohon}`,
                konflikDengan: konflikBooking
            });
        }

        const bookingData = {
            ruang_id,
            tanggal: new Date(tanggal),
            jam_mulai,
            jam_selesai,
            pemohon,
            keperluan,
            status: 'pending'
        };

        const booking = new Booking(bookingData);
        await booking.save();

        res.status(201).json({
            success: true,
            message: 'Booking berhasil dibuat',
            bookingId: booking._id,
            data: booking
        });
    } catch (error) {
        res.status(500).json({ 
            success: false,
            error: error.message 
        });
    }
};

// 6. Get booking by ruang
exports.getBookingByRuang = async (req, res) => {
    try {
        const { status, limit = 20 } = req.query;
        
        const query = { ruang_id: req.params.ruangId };
        if (status) query.status = status;

        const bookings = await Booking.find(query)
            .populate('ruang_id', 'kode nama')
            .sort({ tanggal: -1, jam_mulai: 1 })
            .limit(parseInt(limit));

        const ruang = await Ruang.findById(req.params.ruangId).select('kode nama');

        res.json({
            success: true,
            ruang: ruang,
            filters: { status },
            count: bookings.length,
            data: bookings
        });
    } catch (error) {
        res.status(500).json({ 
            success: false,
            error: error.message 
        });
    }
};

// 7. Hitung occupancy rate
exports.hitungOccupancyRate = async (req, res) => {
    try {
        const { bulan, tahun } = req.query;
        const ruangId = req.params.ruangId;

        const currentMonth = parseInt(bulan) || new Date().getMonth() + 1;
        const currentYear = parseInt(tahun) || new Date().getFullYear();

        const startDate = new Date(currentYear, currentMonth - 1, 1);
        const endDate = new Date(currentYear, currentMonth, 0);

        const ruang = await Ruang.findById(ruangId);
        if (!ruang) {
            return res.status(404).json({ 
                success: false,
                error: 'Ruang tidak ditemukan' 
            });
        }

        const bookings = await Booking.find({
            ruang_id: ruangId,
            tanggal: { $gte: startDate, $lte: endDate },
            status: 'approved'
        });

        // Calculate total hours
        let totalHours = 0;
        bookings.forEach(booking => {
            const start = booking.jam_mulai.split(':').map(Number);
            const end = booking.jam_selesai.split(':').map(Number);
            totalHours += (end[0] + end[1] / 60) - (start[0] + start[1] / 60);
        });

        // Calculate occupancy rate
        const totalPossibleHours = 22 * 8; // 22 hari * 8 jam
        const occupancyRate = (totalHours / totalPossibleHours) * 100;

        res.json({
            success: true,
            ruang: {
                kode: ruang.kode,
                nama: ruang.nama,
                kapasitas: ruang.kapasitas
            },
            periode: `${currentMonth}/${currentYear}`,
            statistik: {
                totalBooking: bookings.length,
                totalJamBooking: totalHours.toFixed(2),
                totalJamTersedia: totalPossibleHours,
                occupancyRate: `${occupancyRate.toFixed(2)}%`
            }
        });
    } catch (error) {
        res.status(500).json({ 
            success: false,
            error: error.message 
        });
    }
};