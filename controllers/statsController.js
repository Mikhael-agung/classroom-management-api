const Mahasiswa = require('../models/Mahasiswa');
const Dosen = require('../models/Dosen');
const Ruang = require('../models/Ruang');
const Jadwal = require('../models/Jadwal');
const Booking = require('../models/Booking');
const MataKuliah = require('../models/MatKul');
const MahasiswaKelas = require('../models/MahasiswaKelas');

// Get comprehensive statistics
exports.getStats = async (req, res) => {
    try {
        // Hitung semua statistik secara paralel
        const [
            totalMahasiswa,
            totalDosen,
            totalRuang,
            totalJadwal,
            totalBooking,
            totalMataKuliah,
            totalMahasiswaKelas,
            
            // Statistik mahasiswa per fakultas
            mahasiswaPerFakultas,
            
            // Statistik mahasiswa per jurusan
            mahasiswaPerJurusan,
            
            // Statistik dosen per fakultas
            dosenPerFakultas,
            
            // Statistik ruang per gedung
            ruangPerGedung,
            
            // Statistik mata kuliah per semester tipe
            matkulPerSemesterTipe,
            
            // Jadwal per hari
            jadwalPerHari,
            
            // Jadwal per semester aktif
            jadwalPerSemesterAktif,
            
            // Booking status
            bookingStatus,
            
            // Occupancy rate (jadwal vs kapasitas)
            occupancyStats
        ] = await Promise.all([
            // Basic counts
            Mahasiswa.countDocuments(),
            Dosen.countDocuments(),
            Ruang.countDocuments(),
            Jadwal.countDocuments(),
            Booking.countDocuments(),
            MataKuliah.countDocuments(),
            MahasiswaKelas.countDocuments(),
            
            // Aggregations
            Mahasiswa.aggregate([
                { $group: { _id: "$fakultas", total: { $sum: 1 } } },
                { $sort: { total: -1 } }
            ]),
            
            Mahasiswa.aggregate([
                { $group: { _id: "$jurusan", total: { $sum: 1 } } },
                { $sort: { total: -1 } }
            ]),
            
            Dosen.aggregate([
                { $group: { _id: "$fakultas", total: { $sum: 1 } } },
                { $sort: { total: -1 } }
            ]),
            
            Ruang.aggregate([
                { $group: { _id: "$lokasi_gedung", total: { $sum: 1 }, totalKapasitas: { $sum: "$kapasitas" } } },
                { $sort: { total: -1 } }
            ]),
            
            MataKuliah.aggregate([
                { $group: { _id: "$semester_tipe", total: { $sum: 1 } } },
                { $sort: { _id: 1 } }
            ]),
            
            Jadwal.aggregate([
                { $group: { _id: "$hari", total: { $sum: 1 } } },
                { $sort: { _id: 1 } }
            ]),
            
            Jadwal.aggregate([
                { $group: { _id: "$semester_aktif", total: { $sum: 1 } } },
                { $sort: { _id: 1 } }
            ]),
            
            Booking.aggregate([
                { $group: { _id: "$status", total: { $sum: 1 } } },
                { $sort: { total: -1 } }
            ]),
            
            // Occupancy stats
            Jadwal.aggregate([
                {
                    $lookup: {
                        from: "ruangs",
                        localField: "ruang_id",
                        foreignField: "_id",
                        as: "ruang"
                    }
                },
                { $unwind: "$ruang" },
                {
                    $group: {
                        _id: null,
                        totalJadwal: { $sum: 1 },
                        totalKapasitasTerpakai: { $sum: "$ruang.kapasitas" },
                        ruangTerpakai: { $addToSet: "$ruang_id" }
                    }
                },
                {
                    $project: {
                        _id: 0,
                        totalJadwal: 1,
                        totalKapasitasTerpakai: 1,
                        totalRuangTerpakai: { $size: "$ruangTerpakai" }
                    }
                }
            ])
        ]);
        
        // Hitung percentages dan format
        const totalRuangTerpakai = occupancyStats[0]?.totalRuangTerpakai || 0;
        const occupancyRateRuang = totalRuang > 0 ? ((totalRuangTerpakai / totalRuang) * 100).toFixed(2) : 0;
        
        // Format jadwal per hari
        const hariOrder = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
        const jadwalHariFormatted = hariOrder.map(hari => {
            const found = jadwalPerHari.find(j => j._id === hari);
            return {
                hari,
                total: found ? found.total : 0,
                percentage: totalJadwal > 0 ? ((found?.total || 0) / totalJadwal * 100).toFixed(2) + '%' : '0%'
            };
        });
        
        res.json({
            success: true,
            data: {
                totals: {
                    mahasiswa: totalMahasiswa,
                    dosen: totalDosen,
                    ruang: totalRuang,
                    jadwal: totalJadwal,
                    booking: totalBooking,
                    mataKuliah: totalMataKuliah,
                    mahasiswaKelas: totalMahasiswaKelas,
                    totalRecords: totalMahasiswa + totalDosen + totalRuang + totalJadwal + totalBooking + totalMataKuliah + totalMahasiswaKelas
                },
                
                distributions: {
                    mahasiswaPerFakultas: mahasiswaPerFakultas.map(item => ({
                        fakultas: item._id,
                        total: item.total,
                        percentage: ((item.total / totalMahasiswa) * 100).toFixed(2) + '%'
                    })),
                    
                    mahasiswaPerJurusan: mahasiswaPerJurusan.map(item => ({
                        jurusan: item._id,
                        total: item.total,
                        percentage: ((item.total / totalMahasiswa) * 100).toFixed(2) + '%'
                    })),
                    
                    dosenPerFakultas: dosenPerFakultas.map(item => ({
                        fakultas: item._id,
                        total: item.total,
                        percentage: ((item.total / totalDosen) * 100).toFixed(2) + '%'
                    })),
                    
                    ruangPerGedung: ruangPerGedung.map(item => ({
                        gedung: item._id,
                        total: item.total,
                        totalKapasitas: item.totalKapasitas,
                        percentage: ((item.total / totalRuang) * 100).toFixed(2) + '%'
                    })),
                    
                    matkulPerSemesterTipe: matkulPerSemesterTipe.map(item => ({
                        semester_tipe: item._id,
                        total: item.total,
                        percentage: ((item.total / totalMataKuliah) * 100).toFixed(2) + '%'
                    }))
                },
                
                schedules: {
                    jadwalPerHari: jadwalHariFormatted,
                    jadwalPerSemesterAktif: jadwalPerSemesterAktif.map(item => ({
                        semester_aktif: item._id,
                        total: item.total,
                        percentage: ((item.total / totalJadwal) * 100).toFixed(2) + '%'
                    }))
                },
                
                bookings: {
                    status: bookingStatus.map(item => ({
                        status: item._id,
                        total: item.total,
                        percentage: ((item.total / totalBooking) * 100).toFixed(2) + '%'
                    }))
                },
                
                utilization: {
                    ruangTerpakai: totalRuangTerpakai,
                    ruangTersedia: totalRuang - totalRuangTerpakai,
                    occupancyRate: occupancyRateRuang + '%',
                    kapasitasTerpakai: occupancyStats[0]?.totalKapasitasTerpakai || 0
                },
                
                averages: {
                    jadwalPerRuang: totalRuang > 0 ? (totalJadwal / totalRuang).toFixed(2) : 0,
                    mahasiswaPerJadwal: totalJadwal > 0 ? (totalMahasiswaKelas / totalJadwal).toFixed(2) : 0,
                    matkulPerDosen: totalDosen > 0 ? (totalMataKuliah / totalDosen).toFixed(2) : 0,
                    bookingPerRuang: totalRuang > 0 ? (totalBooking / totalRuang).toFixed(2) : 0
                },
                
                lastUpdated: new Date().toISOString()
            }
        });
        
    } catch (error) {
        res.status(500).json({ 
            success: false,
            error: error.message 
        });
    }
};

// Get real-time dashboard stats
exports.getDashboardStats = async (req, res) => {
    try {
        const now = new Date();
        const currentHour = now.getHours();
        const currentDay = now.getDay(); // 0 = Minggu, 1 = Senin, etc
        
        // Map day number to name
        const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
        const todayName = days[currentDay];
        
        // Cari jadwal hari ini
        const jadwalHariIni = await Jadwal.find({ hari: todayName })
            .populate({
                path: 'mata_kuliah_id',
                select: 'nama kode sks'
            })
            .populate({
                path: 'ruang_id',
                select: 'nama lokasi_gedung'
            })
            .sort({ jam_mulai: 1 });
        
        // Cari jadwal yang sedang berlangsung
        const jadwalBerlangsung = jadwalHariIni.filter(jadwal => {
            const [startHour, startMin] = jadwal.jam_mulai.split(':').map(Number);
            const [endHour, endMin] = jadwal.jam_selesai.split(':').map(Number);
            
            const startTime = startHour * 60 + startMin;
            const endTime = endHour * 60 + endMin;
            const currentTime = currentHour * 60 + now.getMinutes();
            
            return currentTime >= startTime && currentTime <= endTime;
        });
        
        // Cari booking hari ini
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const bookingsHariIni = await Booking.find({
            tanggal: { $gte: today, $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000) }
        }).populate('ruang_id', 'nama lokasi_gedung');
        
        // Hitung statistik cepat
        const [totalMahasiswa, totalDosen, totalRuang, activeBookings] = await Promise.all([
            Mahasiswa.countDocuments({ status: 'active' }),
            Dosen.countDocuments({ status: 'active' }),
            Ruang.countDocuments({ status: 'active' }),
            Booking.countDocuments({ 
                status: 'approved',
                tanggal: { $gte: today }
            })
        ]);
        
        res.json({
            success: true,
            data: {
                timestamp: now.toISOString(),
                today: todayName,
                currentTime: `${String(currentHour).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`,
                
                overview: {
                    totalMahasiswa,
                    totalDosen,
                    totalRuang,
                    activeBookings,
                    classesToday: jadwalHariIni.length,
                    ongoingClasses: jadwalBerlangsung.length
                },
                
                ongoingClasses: jadwalBerlangsung.map(j => ({
                    mataKuliah: j.mata_kuliah_id?.nama || 'Unknown',
                    kode: j.mata_kuliah_id?.kode || 'N/A',
                    ruang: j.ruang_id?.nama || 'Unknown',
                    gedung: j.ruang_id?.lokasi_gedung || 'Unknown',
                    waktu: `${j.jam_mulai} - ${j.jam_selesai}`,
                    sks: j.mata_kuliah_id?.sks || 0
                })),
                
                upcomingClasses: jadwalHariIni
                    .filter(j => {
                        const [startHour] = j.jam_mulai.split(':').map(Number);
                        return startHour > currentHour;
                    })
                    .slice(0, 5)
                    .map(j => ({
                        mataKuliah: j.mata_kuliah_id?.nama || 'Unknown',
                        waktu: `${j.jam_mulai} - ${j.jam_selesai}`,
                        ruang: j.ruang_id?.nama || 'Unknown'
                    })),
                
                todaysBookings: bookingsHariIni.slice(0, 5).map(b => ({
                    ruang: b.ruang_id?.nama || 'Unknown',
                    pemohon: b.pemohon,
                    waktu: `${b.jam_mulai} - ${b.jam_selesai}`,
                    keperluan: b.keperluan,
                    status: b.status
                }))
            }
        });
        
    } catch (error) {
        res.status(500).json({ 
            success: false,
            error: error.message 
        });
    }
};

// Get faculty-specific statistics
exports.getFacultyStats = async (req, res) => {
    try {
        const { fakultas } = req.params;
        
        if (!fakultas) {
            return res.status(400).json({
                success: false,
                error: 'Parameter fakultas diperlukan'
            });
        }
        
        // Validasi fakultas
        const validFakultas = ['Teknik', 'Ekonomi', 'Hukum', 'FISIP'];
        if (!validFakultas.includes(fakultas)) {
            return res.status(400).json({
                success: false,
                error: `Fakultas tidak valid. Pilih dari: ${validFakultas.join(', ')}`
            });
        }
        
        // Hitung statistik untuk fakultas tertentu
        const [
            totalMahasiswa,
            totalDosen,
            totalMataKuliah,
            jurusanList,
            ruangGedung,
            matkulPerJurusan
        ] = await Promise.all([
            // Total mahasiswa
            Mahasiswa.countDocuments({ fakultas }),
            
            // Total dosen
            Dosen.countDocuments({ fakultas }),
            
            // Total mata kuliah
            MataKuliah.countDocuments({ fakultas }),
            
            // Jurusan dalam fakultas ini
            Mahasiswa.distinct('jurusan', { fakultas }),
            
            // Ruang di gedung terkait (asumsi: Gedung A = Teknik, B = Ekonomi, C = Hukum, D = FISIP)
            Ruang.aggregate([
                {
                    $match: {
                        lokasi_gedung: `Gedung ${fakultas === 'Teknik' ? 'A' : fakultas === 'Ekonomi' ? 'B' : fakultas === 'Hukum' ? 'C' : 'D'}`
                    }
                },
                {
                    $group: {
                        _id: null,
                        total: { $sum: 1 },
                        totalKapasitas: { $sum: "$kapasitas" }
                    }
                }
            ]),
            
            // Mata kuliah per jurusan
            MataKuliah.aggregate([
                { $match: { fakultas } },
                {
                    $group: {
                        _id: "$jurusan",
                        total: { $sum: 1 },
                        totalSKS: { $sum: "$sks" },
                        ganjil: { $sum: { $cond: [{ $eq: ["$semester_tipe", "Ganjil"] }, 1, 0] } },
                        genap: { $sum: { $cond: [{ $eq: ["$semester_tipe", "Genap"] }, 1, 0] } }
                    }
                },
                { $sort: { _id: 1 } }
            ])
        ]);
        
        res.json({
            success: true,
            fakultas,
            data: {
                totals: {
                    mahasiswa: totalMahasiswa,
                    dosen: totalDosen,
                    mataKuliah: totalMataKuliah,
                    ruang: ruangGedung[0]?.total || 0,
                    totalKapasitas: ruangGedung[0]?.totalKapasitas || 0
                },
                
                jurusan: jurusanList,
                
                mataKuliahPerJurusan: matkulPerJurusan.map(item => ({
                    jurusan: item._id,
                    total: item.total,
                    totalSKS: item.totalSKS,
                    ganjil: item.ganjil,
                    genap: item.genap,
                    percentageGanjil: ((item.ganjil / item.total) * 100).toFixed(2) + '%',
                    percentageGenap: ((item.genap / item.total) * 100).toFixed(2) + '%'
                })),
                
                averages: {
                    mahasiswaPerDosen: totalDosen > 0 ? (totalMahasiswa / totalDosen).toFixed(2) : 0,
                    mataKuliahPerDosen: totalDosen > 0 ? (totalMataKuliah / totalDosen).toFixed(2) : 0,
                    mahasiswaPerMataKuliah: totalMataKuliah > 0 ? (totalMahasiswa / totalMataKuliah).toFixed(2) : 0
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