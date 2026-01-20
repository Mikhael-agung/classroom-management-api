const Booking = require('../models/Booking');
const Ruang = require('../models/Ruang');
const { cekKonflikBooking } = require('../utils/conflictChecker');
const mongoose = require('mongoose');

// 1. Insert booking - UPDATE
exports.insertBooking = async (req, res) => {
    try {
        const { ruang_id, tanggal, jam_mulai, jam_selesai, pemohon, keperluan, jumlah_peserta, kontak } = req.body;

        // Validasi
        const requiredFields = ['ruang_id', 'tanggal', 'jam_mulai', 'jam_selesai', 'pemohon', 'keperluan'];
        const missingFields = requiredFields.filter(field => !req.body[field]);
        
        if (missingFields.length > 0) {
            return res.status(400).json({ 
                success: false,
                error: `Field berikut wajib diisi: ${missingFields.join(', ')}` 
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
        
        // Cek kapasitas jika jumlah_peserta diisi
        if (jumlah_peserta && jumlah_peserta > ruang.kapasitas) {
            return res.status(400).json({
                success: false,
                error: `Jumlah peserta (${jumlah_peserta}) melebihi kapasitas ruang (${ruang.kapasitas})`
            });
        }

        // Cek konflik
        const konflikBooking = await cekKonflikBooking(ruang_id, tanggal, jam_mulai, jam_selesai);

        if (konflikBooking) {
            return res.status(400).json({
                success: false,
                error: 'Ruangan sudah dibooking',
                message: `Ruang ${ruang.kode} sudah dibooking oleh ${konflikBooking.pemohon}`,
                konflikDengan: {
                    id: konflikBooking._id,
                    pemohon: konflikBooking.pemohon,
                    tanggal: konflikBooking.tanggal,
                    jam: `${konflikBooking.jam_mulai} - ${konflikBooking.jam_selesai}`,
                    keperluan: konflikBooking.keperluan,
                    status: konflikBooking.status
                }
            });
        }

        const bookingData = {
            ruang_id,
            tanggal: new Date(tanggal),
            jam_mulai,
            jam_selesai,
            pemohon,
            keperluan,
            jumlah_peserta: jumlah_peserta || null,
            kontak: kontak || null,
            status: 'pending'
        };

        const booking = new Booking(bookingData);
        await booking.save();

        // Populate untuk response
        const populatedBooking = await Booking.findById(booking._id).populate('ruang_id');

        res.status(201).json({
            success: true,
            message: '✅ Booking berhasil dibuat',
            data: {
                id: populatedBooking._id,
                ruang: {
                    kode: populatedBooking.ruang_id.kode,
                    nama: populatedBooking.ruang_id.nama,
                    lokasi_gedung: populatedBooking.ruang_id.lokasi_gedung,
                    kapasitas: populatedBooking.ruang_id.kapasitas
                },
                tanggal: populatedBooking.tanggal.toISOString().split('T')[0],
                jam: `${populatedBooking.jam_mulai} - ${populatedBooking.jam_selesai}`,
                pemohon: populatedBooking.pemohon,
                keperluan: populatedBooking.keperluan,
                status: populatedBooking.status,
                jumlah_peserta: populatedBooking.jumlah_peserta,
                kontak: populatedBooking.kontak,
                created_at: populatedBooking.createdAt
            }
        });
    } catch (error) {
        res.status(500).json({ 
            success: false,
            error: error.message 
        });
    }
};

// 2. Get booking by ruang - UPDATE
exports.getBookingByRuang = async (req, res) => {
    try {
        const { status, tanggal_mulai, tanggal_selesai, limit = 20 } = req.query;
        
        const query = { ruang_id: req.params.ruangId };
        
        // Filter status
        if (status) query.status = status;
        
        // Filter tanggal
        if (tanggal_mulai || tanggal_selesai) {
            query.tanggal = {};
            if (tanggal_mulai) query.tanggal.$gte = new Date(tanggal_mulai);
            if (tanggal_selesai) query.tanggal.$lte = new Date(tanggal_selesai);
        }

        const bookings = await Booking.find(query)
            .populate('ruang_id', 'kode nama lokasi_gedung kapasitas')
            .sort({ tanggal: -1, jam_mulai: 1 })
            .limit(parseInt(limit));

        const ruang = await Ruang.findById(req.params.ruangId).select('kode nama lokasi_gedung kapasitas status');

        if (!ruang) {
            return res.status(404).json({
                success: false,
                error: 'Ruang tidak ditemukan'
            });
        }

        res.json({
            success: true,
            ruang: ruang,
            filters: { 
                status, 
                tanggal_mulai, 
                tanggal_selesai,
                limit: parseInt(limit)
            },
            count: bookings.length,
            data: bookings.map(b => ({
                id: b._id,
                tanggal: b.tanggal.toISOString().split('T')[0],
                jam_mulai: b.jam_mulai,
                jam_selesai: b.jam_selesai,
                pemohon: b.pemohon,
                keperluan: b.keperluan,
                status: b.status,
                jumlah_peserta: b.jumlah_peserta,
                kontak: b.kontak,
                created_at: b.createdAt,
                updated_at: b.updatedAt
            }))
        });
    } catch (error) {
        res.status(500).json({ 
            success: false,
            error: error.message 
        });
    }
};

// 3. Update booking status
exports.updateBookingStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, alasan } = req.body;
        
        if (!status || !['approved', 'rejected', 'canceled'].includes(status)) {
            return res.status(400).json({
                success: false,
                error: 'Status tidak valid. Pilih: approved, rejected, atau canceled'
            });
        }

        const booking = await Booking.findByIdAndUpdate(
            id,
            { 
                status,
                ...(alasan && { catatan: alasan })
            },
            { new: true }
        ).populate('ruang_id');

        if (!booking) {
            return res.status(404).json({
                success: false,
                error: 'Booking tidak ditemukan'
            });
        }

        res.json({
            success: true,
            message: `Status booking berhasil diupdate menjadi ${status}`,
            data: {
                id: booking._id,
                ruang: booking.ruang_id.nama,
                tanggal: booking.tanggal.toISOString().split('T')[0],
                jam: `${booking.jam_mulai} - ${booking.jam_selesai}`,
                pemohon: booking.pemohon,
                keperluan: booking.keperluan,
                status: booking.status,
                catatan: booking.catatan || null
            }
        });
    } catch (error) {
        res.status(500).json({ 
            success: false,
            error: error.message 
        });
    }
};

// 4. Get booking by date range
exports.getBookingByDateRange = async (req, res) => {
    try {
        const { start_date, end_date, lokasi_gedung, status } = req.query;
        
        if (!start_date || !end_date) {
            return res.status(400).json({
                success: false,
                error: 'start_date dan end_date harus diisi'
            });
        }

        const startDate = new Date(start_date);
        const endDate = new Date(end_date);
        endDate.setHours(23, 59, 59, 999);

        // Build query
        const query = {
            tanggal: { $gte: startDate, $lte: endDate }
        };
        
        if (status) query.status = status;

        // Jika ada filter lokasi gedung
        let ruangFilter = {};
        if (lokasi_gedung) {
            const ruangIds = await Ruang.find({ lokasi_gedung }).select('_id');
            if (ruangIds.length > 0) {
                query.ruang_id = { $in: ruangIds.map(r => r._id) };
            } else {
                // Jika tidak ada ruang di gedung tersebut, return empty
                return res.json({
                    success: true,
                    filters: { start_date, end_date, lokasi_gedung, status },
                    count: 0,
                    data: []
                });
            }
        }

        const bookings = await Booking.find(query)
            .populate({
                path: 'ruang_id',
                select: 'kode nama lokasi_gedung kapasitas'
            })
            .sort({ tanggal: 1, jam_mulai: 1 });

        // Group by date
        const bookingsByDate = {};
        bookings.forEach(booking => {
            const dateStr = booking.tanggal.toISOString().split('T')[0];
            if (!bookingsByDate[dateStr]) {
                bookingsByDate[dateStr] = [];
            }
            
            bookingsByDate[dateStr].push({
                id: booking._id,
                jam: `${booking.jam_mulai} - ${booking.jam_selesai}`,
                ruang: booking.ruang_id.nama,
                lokasi_gedung: booking.ruang_id.lokasi_gedung,
                pemohon: booking.pemohon,
                keperluan: booking.keperluan,
                status: booking.status,
                jumlah_peserta: booking.jumlah_peserta
            });
        });

        res.json({
            success: true,
            filters: { start_date, end_date, lokasi_gedung, status },
            total: bookings.length,
            data: bookingsByDate,
            summary: {
                approved: bookings.filter(b => b.status === 'approved').length,
                pending: bookings.filter(b => b.status === 'pending').length,
                rejected: bookings.filter(b => b.status === 'rejected').length,
                canceled: bookings.filter(b => b.status === 'canceled').length
            }
        });
    } catch (error) {
        res.status(500).json({ 
            success: false,
            error: error.message 
        });
    }
};

// 5. Hitung occupancy rate - UPDATE
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

        // Ambil booking yang approved
        const bookings = await Booking.find({
            ruang_id: ruangId,
            tanggal: { $gte: startDate, $lte: endDate },
            status: 'approved'
        });

        // Calculate total hours
        let totalHours = 0;
        bookings.forEach(booking => {
            const [startHour, startMinute] = booking.jam_mulai.split(':').map(Number);
            const [endHour, endMinute] = booking.jam_selesai.split(':').map(Number);
            totalHours += (endHour + endMinute / 60) - (startHour + startMinute / 60);
        });

        // Calculate occupancy rate
        // Asumsi: 22 hari kerja × 10 jam (07:00-17:00) = 220 jam
        const totalPossibleHours = 22 * 10;
        const occupancyRate = (totalHours / totalPossibleHours) * 100;

        // Hitung hari terpakai
        const uniqueDays = new Set(bookings.map(b => b.tanggal.toISOString().split('T')[0]));
        const daysUsed = uniqueDays.size;

        res.json({
            success: true,
            ruang: {
                kode: ruang.kode,
                nama: ruang.nama,
                lokasi_gedung: ruang.lokasi_gedung,
                kapasitas: ruang.kapasitas
            },
            periode: {
                bulan: currentMonth,
                tahun: currentYear,
                nama_bulan: startDate.toLocaleString('id-ID', { month: 'long' })
            },
            statistik: {
                totalBooking: bookings.length,
                hariTerpakai: daysUsed,
                hariTersedia: 22,
                totalJamBooking: totalHours.toFixed(2),
                totalJamTersedia: totalPossibleHours,
                occupancyRate: `${occupancyRate.toFixed(2)}%`,
                efficiencyScore: occupancyRate > 70 ? 'Tinggi' : occupancyRate > 40 ? 'Sedang' : 'Rendah'
            },
            rekomendasi: occupancyRate < 30 
                ? '✅ Ruang underutilized, bisa dijadwalkan lebih banyak'
                : occupancyRate > 80 
                ? '⚠️ Ruang hampir penuh, pertimbangkan ruang alternatif'
                : '✅ Utilisasi ruang optimal'
        });
    } catch (error) {
        res.status(500).json({ 
            success: false,
            error: error.message 
        });
    }
};

// 6. Get booking calendar view
exports.getBookingCalendar = async (req, res) => {
    try {
        const { tahun, bulan } = req.query;
        
        const year = parseInt(tahun) || new Date().getFullYear();
        const month = parseInt(bulan) || new Date().getMonth() + 1;
        
        const startDate = new Date(year, month - 1, 1);
        const endDate = new Date(year, month, 0);
        
        const bookings = await Booking.find({
            tanggal: { $gte: startDate, $lte: endDate },
            status: 'approved'
        })
        .populate('ruang_id', 'kode nama lokasi_gedung')
        .sort({ tanggal: 1, jam_mulai: 1 });
        
        // Format untuk calendar view
        const calendarData = {};
        
        // Inisialisasi semua hari dalam bulan
        const daysInMonth = new Date(year, month, 0).getDate();
        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(year, month - 1, day);
            const dateStr = date.toISOString().split('T')[0];
            calendarData[dateStr] = {
                date: dateStr,
                day: date.getDate(),
                dayName: date.toLocaleDateString('id-ID', { weekday: 'short' }),
                bookings: []
            };
        }
        
        // Isi dengan booking
        bookings.forEach(booking => {
            const dateStr = booking.tanggal.toISOString().split('T')[0];
            if (calendarData[dateStr]) {
                calendarData[dateStr].bookings.push({
                    id: booking._id,
                    ruang: booking.ruang_id.nama,
                    kode: booking.ruang_id.kode,
                    lokasi_gedung: booking.ruang_id.lokasi_gedung,
                    jam: `${booking.jam_mulai} - ${booking.jam_selesai}`,
                    pemohon: booking.pemohon,
                    keperluan: booking.keperluan,
                    jumlah_peserta: booking.jumlah_peserta
                });
            }
        });
        
        // Convert to array
        const calendarArray = Object.values(calendarData);
        
        res.json({
            success: true,
            periode: {
                tahun: year,
                bulan: month,
                nama_bulan: startDate.toLocaleString('id-ID', { month: 'long', year: 'numeric' })
            },
            totalHari: daysInMonth,
            totalBooking: bookings.length,
            data: calendarArray
        });
    } catch (error) {
        res.status(500).json({ 
            success: false,
            error: error.message 
        });
    }
};

// 7. Get available rooms for booking
exports.getAvailableRooms = async (req, res) => {
    try {
        const { tanggal, jam_mulai, jam_selesai, lokasi_gedung, min_kapasitas } = req.query;
        
        if (!tanggal || !jam_mulai || !jam_selesai) {
            return res.status(400).json({
                success: false,
                error: 'tanggal, jam_mulai, dan jam_selesai harus diisi'
            });
        }
        
        const bookingDate = new Date(tanggal);
        
        // Cari semua ruang yang memenuhi kriteria
        const roomQuery = { status: 'active' };
        if (lokasi_gedung) roomQuery.lokasi_gedung = lokasi_gedung;
        if (min_kapasitas) roomQuery.kapasitas = { $gte: parseInt(min_kapasitas) };
        
        const allRooms = await Ruang.find(roomQuery);
        
        // Cari ruang yang sudah dibooking pada waktu tersebut
        const bookedRooms = await Booking.find({
            tanggal: bookingDate,
            $or: [
                { jam_mulai: { $lt: jam_selesai, $gte: jam_mulai } },
                { jam_selesai: { $gt: jam_mulai, $lte: jam_selesai } },
                { 
                    $and: [
                        { jam_mulai: { $lte: jam_mulai } },
                        { jam_selesai: { $gte: jam_selesai } }
                    ]
                }
            ],
            status: { $in: ['pending', 'approved'] }
        }).distinct('ruang_id');
        
        // Filter ruang yang tersedia
        const availableRooms = allRooms.filter(room => 
            !bookedRooms.some(bookedId => bookedId.toString() === room._id.toString())
        );
        
        res.json({
            success: true,
            filters: {
                tanggal,
                jam: `${jam_mulai} - ${jam_selesai}`,
                lokasi_gedung: lokasi_gedung || 'Semua',
                min_kapasitas: min_kapasitas || 'Tidak ada'
            },
            summary: {
                totalRooms: allRooms.length,
                bookedRooms: bookedRooms.length,
                availableRooms: availableRooms.length,
                availabilityRate: ((availableRooms.length / allRooms.length) * 100).toFixed(2) + '%'
            },
            data: availableRooms.map(room => ({
                id: room._id,
                kode: room.kode,
                nama: room.nama,
                lokasi_gedung: room.lokasi_gedung,
                kapasitas: room.kapasitas,
                lantai: room.lantai,
                fasilitas: room.fasilitas,
                status: 'available'
            }))
        });
    } catch (error) {
        res.status(500).json({ 
            success: false,
            error: error.message 
        });
    }
};