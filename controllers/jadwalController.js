const Jadwal = require('../models/Jadwal');
const Mahasiswa = require('../models/Mahasiswa');
const MataKuliah = require('../models/MatKul');
const Dosen = require('../models/Dosen');
const Ruang = require('../models/Ruang');
const MahasiswaKelas = require('../models/MahasiswaKelas');
const { cekKonflikJadwal, hapusDataDuplikat } = require('../utils/conflictChecker');
const mongoose = require('mongoose');

// 1. INSERT JADWAL (dengan cek konflik dosen + ruang) - UPDATE
exports.insertJadwal = async (req, res) => {
    try {
        const { mata_kuliah_id, ruang_id, hari, jam_mulai, jam_selesai, semester_aktif, kelas } = req.body;
        
        console.log('📝 Insert jadwal request:', req.body);
        
        // Validasi input wajib - PERUBAHAN: semester_aktif bukan semester
        const requiredFields = ['mata_kuliah_id', 'ruang_id', 'hari', 'jam_mulai', 'jam_selesai', 'semester_aktif', 'kelas'];
        const missingFields = requiredFields.filter(field => !req.body[field]);
        
        if (missingFields.length > 0) {
            return res.status(400).json({
                success: false,
                error: `Field berikut harus diisi: ${missingFields.join(', ')}`
            });
        }
        
        // Validasi format jam
        const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
        if (!timeRegex.test(jam_mulai) || !timeRegex.test(jam_selesai)) {
            return res.status(400).json({
                success: false,
                error: 'Format jam tidak valid. Gunakan format HH:MM (contoh: 08:00)'
            });
        }
        
        // Validasi jam selesai > jam mulai
        const [startHour, startMinute] = jam_mulai.split(':').map(Number);
        const [endHour, endMinute] = jam_selesai.split(':').map(Number);
        
        const startTime = startHour * 60 + startMinute;
        const endTime = endHour * 60 + endMinute;
        
        if (endTime <= startTime) {
            return res.status(400).json({
                success: false,
                error: 'Jam selesai harus setelah jam mulai'
            });
        }
        
        // Validasi hari
        const validHari = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
        if (!validHari.includes(hari)) {
            return res.status(400).json({
                success: false,
                error: `Hari tidak valid. Pilih dari: ${validHari.join(', ')}`
            });
        }
        
        // Validasi mata kuliah dan dosen
        const mataKuliah = await MataKuliah.findById(mata_kuliah_id).populate('dosen_id');
        if (!mataKuliah) {
            return res.status(404).json({
                success: false,
                error: 'Mata kuliah tidak ditemukan'
            });
        }
        
        // CEK KONFLIK RUANG & DOSEN
        const { konflikRuang, konflikDosen, adaKonflik } = 
            await cekKonflikJadwal(ruang_id, hari, jam_mulai, jam_selesai, mata_kuliah_id);
        
        if (adaKonflik) {
            let errorMessage = '';
            const konflikDetails = {};
            
            if (konflikRuang) {
                errorMessage += '❌ Ruang sudah terpakai pada jam tersebut. ';
                konflikDetails.ruang = {
                    id: konflikRuang._id,
                    mata_kuliah: konflikRuang.mata_kuliah_id?.nama || 'Unknown',
                    ruang: konflikRuang.ruang_id?.nama || 'Unknown',
                    hari: konflikRuang.hari,
                    jam: `${konflikRuang.jam_mulai} - ${konflikRuang.jam_selesai}`,
                    kelas: konflikRuang.kelas
                };
            }
            
            if (konflikDosen) {
                errorMessage += '❌ Dosen sudah memiliki jadwal lain pada jam tersebut. ';
                konflikDetails.dosen = {
                    id: konflikDosen._id,
                    nama_dosen: konflikDosen.mata_kuliah_id?.dosen_id?.nama || 'Unknown',
                    mata_kuliah: konflikDosen.mata_kuliah_id?.nama || 'Unknown',
                    ruang: konflikDosen.ruang_id?.nama || 'Unknown',
                    hari: konflikDosen.hari,
                    jam: `${konflikDosen.jam_mulai} - ${konflikDosen.jam_selesai}`,
                    kelas: konflikDosen.kelas
                };
            }
            
            return res.status(409).json({ // 409 Conflict
                success: false,
                error: errorMessage.trim(),
                details: konflikDetails,
                timestamp: new Date().toISOString()
            });
        }
        
        // Cek kapasitas ruang
        const ruang = await Ruang.findById(ruang_id);
        if (!ruang) {
            return res.status(404).json({
                success: false,
                error: 'Ruang tidak ditemukan'
            });
        }
        
        // Buat jadwal baru jika tidak ada konflik
        const newJadwal = new Jadwal({
            mata_kuliah_id,
            ruang_id,
            hari,
            jam_mulai,
            jam_selesai,
            semester_aktif, // PERUBAHAN: semester_aktif
            kelas
        });
        
        await newJadwal.save();
        
        // Populate untuk response
        const populatedJadwal = await Jadwal.findById(newJadwal._id)
            .populate({
                path: 'mata_kuliah_id',
                populate: { path: 'dosen_id' }
            })
            .populate('ruang_id');
        
        console.log('✅ Jadwal berhasil ditambahkan:', newJadwal._id);
        
        res.status(201).json({
            success: true,
            message: '🎉 Jadwal berhasil ditambahkan',
            data: {
                id: populatedJadwal._id,
                hari: populatedJadwal.hari,
                jam: `${populatedJadwal.jam_mulai} - ${populatedJadwal.jam_selesai}`,
                mata_kuliah: populatedJadwal.mata_kuliah_id?.nama || 'Unknown',
                dosen: populatedJadwal.mata_kuliah_id?.dosen_id?.nama || 'Unknown',
                ruang: populatedJadwal.ruang_id?.nama || 'Unknown',
                kapasitas: populatedJadwal.ruang_id?.kapasitas || 0,
                lokasi_gedung: populatedJadwal.ruang_id?.lokasi_gedung || 'Unknown',
                kelas: populatedJadwal.kelas,
                semester_aktif: populatedJadwal.semester_aktif, // PERUBAHAN
                created_at: populatedJadwal.createdAt
            }
        });
        
    } catch (error) {
        console.error('🔥 Error inserting jadwal:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Server error',
            message: error.message,
            timestamp: new Date().toISOString()
        });
    }
};

// 2. GET JADWAL MAHASISWA BY NPM - UPDATE
exports.getJadwalByNPM = async (req, res) => {
    try {
        const { npm } = req.params;
        
        console.log('📋 Get jadwal for NPM:', npm);
        
        // Validasi NPM
        if (!npm || npm.length < 3) {
            return res.status(400).json({
                success: false,
                error: 'NPM tidak valid'
            });
        }
        
        // Cari mahasiswa
        const mahasiswa = await Mahasiswa.findOne({ nim: npm });
        
        if (!mahasiswa) {
            return res.status(404).json({
                success: false,
                error: `Mahasiswa dengan NPM ${npm} tidak ditemukan`
            });
        }
        
        // Cari jadwal melalui MahasiswaKelas
        const mahasiswaKelas = await MahasiswaKelas.find({ 
            mahasiswa_id: mahasiswa._id 
        }).populate({
            path: 'jadwal_id',
            populate: [
                {
                    path: 'mata_kuliah_id',
                    select: 'nama kode sks jurusan semester_tipe semester',
                    populate: {
                        path: 'dosen_id',
                        select: 'nama kode_dosen'
                    }
                },
                {
                    path: 'ruang_id',
                    select: 'nama lokasi_gedung kapasitas fasilitas'
                }
            ]
        });
        
        // Format response
        const jadwalList = mahasiswaKelas.map(item => ({
            id: item.jadwal_id._id,
            hari: item.jadwal_id.hari,
            jam: `${item.jadwal_id.jam_mulai} - ${item.jadwal_id.jam_selesai}`,
            mata_kuliah: item.jadwal_id.mata_kuliah_id.nama,
            kode_matkul: item.jadwal_id.mata_kuliah_id.kode,
            dosen: item.jadwal_id.mata_kuliah_id.dosen_id.nama,
            ruang: item.jadwal_id.ruang_id.nama,
            lokasi_gedung: item.jadwal_id.ruang_id.lokasi_gedung,
            kelas: item.jadwal_id.kelas,
            semester_aktif: item.jadwal_id.semester_aktif,
            sks: item.jadwal_id.mata_kuliah_id.sks,
            jurusan: item.jadwal_id.mata_kuliah_id.jurusan,
            semester_tipe: item.jadwal_id.mata_kuliah_id.semester_tipe
        }));
        
        // Group by hari
        const jadwalByHari = {};
        jadwalList.forEach(jadwal => {
            if (!jadwalByHari[jadwal.hari]) {
                jadwalByHari[jadwal.hari] = [];
            }
            jadwalByHari[jadwal.hari].push(jadwal);
        });
        
        // Urutkan hari
        const hariOrder = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
        const sortedJadwal = {};
        hariOrder.forEach(hari => {
            if (jadwalByHari[hari]) {
                // Urutkan berdasarkan jam mulai
                jadwalByHari[hari].sort((a, b) => {
                    const [aHour] = a.jam.split(' - ')[0].split(':').map(Number);
                    const [bHour] = b.jam.split(' - ')[0].split(':').map(Number);
                    return aHour - bHour;
                });
                sortedJadwal[hari] = jadwalByHari[hari];
            }
        });
        
        console.log(`✅ Found ${jadwalList.length} jadwal for ${mahasiswa.nama}`);
        
        res.status(200).json({
            success: true,
            data: {
                mahasiswa: {
                    nama: mahasiswa.nama,
                    npm: mahasiswa.nim,
                    fakultas: mahasiswa.fakultas,
                    jurusan: mahasiswa.jurusan,
                    angkatan: mahasiswa.angkatan,
                    status: mahasiswa.status
                },
                jadwal: sortedJadwal,
                summary: {
                    total_matkul: jadwalList.length,
                    total_sks: jadwalList.reduce((sum, j) => sum + j.sks, 0)
                },
                timestamp: new Date().toISOString()
            }
        });
        
    } catch (error) {
        console.error('🔥 Error getting jadwal by NPM:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Server error',
            message: error.message 
        });
    }
};

// 3. GET JADWAL DOSEN BY NAMA - UPDATE
exports.getJadwalByDosen = async (req, res) => {
    try {
        const { nama } = req.params;
        
        console.log('👨‍🏫 Get jadwal for dosen:', nama);
        
        if (!nama || nama.length < 2) {
            return res.status(400).json({
                success: false,
                error: 'Nama dosen minimal 2 karakter'
            });
        }
        
        // Cari dosen berdasarkan nama
        const dosen = await Dosen.find({
            nama: { $regex: nama, $options: 'i' }
        });
        
        if (!dosen || dosen.length === 0) {
            return res.status(404).json({
                success: false,
                error: `Dosen dengan nama "${nama}" tidak ditemukan`
            });
        }
        
        // Cari mata kuliah yang diajar oleh dosen ini
        const mataKuliah = await MataKuliah.find({
            dosen_id: { $in: dosen.map(d => d._id) }
        });
        
        // Cari jadwal untuk mata kuliah tersebut
        const jadwal = await Jadwal.find({
            mata_kuliah_id: { $in: mataKuliah.map(mk => mk._id) }
        })
        .populate({
            path: 'mata_kuliah_id',
            populate: { path: 'dosen_id' }
        })
        .populate('ruang_id');
        
        // Group by dosen dan hari
        const result = {};
        dosen.forEach(d => {
            const jadwalDosenIni = jadwal.filter(j => 
                j.mata_kuliah_id?.dosen_id?._id?.toString() === d._id.toString()
            );
            
            // Group by hari untuk dosen ini
            const jadwalByHari = {};
            jadwalDosenIni.forEach(jadwalItem => {
                if (!jadwalByHari[jadwalItem.hari]) {
                    jadwalByHari[jadwalItem.hari] = [];
                }
                
                jadwalByHari[jadwalItem.hari].push({
                    id: jadwalItem._id,
                    jam: `${jadwalItem.jam_mulai} - ${jadwalItem.jam_selesai}`,
                    mata_kuliah: jadwalItem.mata_kuliah_id?.nama || 'Unknown',
                    kode_matkul: jadwalItem.mata_kuliah_id?.kode || 'N/A',
                    ruang: jadwalItem.ruang_id?.nama || 'Unknown',
                    lokasi_gedung: jadwalItem.ruang_id?.lokasi_gedung || 'Unknown',
                    kelas: jadwalItem.kelas,
                    semester_aktif: jadwalItem.semester_aktif,
                    sks: jadwalItem.mata_kuliah_id?.sks || 0
                });
            });
            
            // Urutkan hari
            const hariOrder = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
            const sortedJadwal = {};
            hariOrder.forEach(hari => {
                if (jadwalByHari[hari]) {
                    jadwalByHari[hari].sort((a, b) => {
                        const [aHour] = a.jam.split(' - ')[0].split(':').map(Number);
                        const [bHour] = b.jam.split(' - ')[0].split(':').map(Number);
                        return aHour - bHour;
                    });
                    sortedJadwal[hari] = jadwalByHari[hari];
                }
            });
            
            result[d.nama] = {
                dosen_info: {
                    kode_dosen: d.kode_dosen,
                    nama: d.nama,
                    fakultas: d.fakultas,
                    jurusan: d.jurusan,
                    email: d.email
                },
                jadwal: sortedJadwal,
                summary: {
                    total_jadwal: jadwalDosenIni.length,
                    total_matkul: new Set(jadwalDosenIni.map(j => j.mata_kuliah_id?._id)).size,
                    total_sks: jadwalDosenIni.reduce((sum, j) => sum + (j.mata_kuliah_id?.sks || 0), 0)
                }
            };
        });
        
        console.log(`✅ Found ${jadwal.length} jadwal for ${dosen.length} dosen`);
        
        res.status(200).json({
            success: true,
            data: result,
            summary: {
                total_dosen: dosen.length,
                total_jadwal: jadwal.length,
                timestamp: new Date().toISOString()
            }
        });
        
    } catch (error) {
        console.error('🔥 Error getting jadwal by dosen:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Server error',
            message: error.message 
        });
    }
};

// 4. GET ALL JADWAL (untuk admin/overview) - UPDATE
exports.getAllJadwal = async (req, res) => {
    try {
        const { 
            hari, 
            ruang, 
            dosen, 
            jurusan,
            fakultas,
            semester_aktif,
            page = 1, 
            limit = 50,
            sort = 'hari',
            order = 'asc' 
        } = req.query;
        
        console.log('📊 Get all jadwal with filters:', req.query);
        
        // Build query
        let query = {};
        let populateOptions = [
            {
                path: 'mata_kuliah_id',
                populate: { path: 'dosen_id' }
            },
            'ruang_id'
        ];
        
        // Filter by hari
        if (hari) {
            const validHari = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
            if (validHari.includes(hari)) {
                query.hari = hari;
            }
        }
        
        // Filter by semester_aktif
        if (semester_aktif) {
            query.semester_aktif = semester_aktif;
        }
        
        // Filter by ruang (partial match)
        if (ruang) {
            const ruangIds = await Ruang.find({ 
                $or: [
                    { nama: { $regex: ruang, $options: 'i' } },
                    { kode: { $regex: ruang, $options: 'i' } }
                ]
            }).select('_id');
            
            if (ruangIds.length > 0) {
                query.ruang_id = { $in: ruangIds.map(r => r._id) };
            }
        }
        
        // Filter by jurusan
        if (jurusan) {
            const matkulIds = await MataKuliah.find({ 
                jurusan: { $regex: jurusan, $options: 'i' } 
            }).select('_id');
            
            if (matkulIds.length > 0) {
                query.mata_kuliah_id = { $in: matkulIds.map(m => m._id) };
            }
        }
        
        // Filter by fakultas
        if (fakultas) {
            const matkulIds = await MataKuliah.find({ 
                fakultas: { $regex: fakultas, $options: 'i' } 
            }).select('_id');
            
            if (matkulIds.length > 0) {
                query.mata_kuliah_id = { $in: matkulIds.map(m => m._id) };
            }
        }
        
        const skip = (page - 1) * limit;
        const sortOrder = order === 'desc' ? -1 : 1;
        
        // Determine sort field
        let sortField = 'hari';
        if (sort === 'jam') sortField = 'jam_mulai';
        if (sort === 'ruang') sortField = 'ruang_id';
        if (sort === 'semester') sortField = 'semester_aktif';
        
        // Hitung total
        const total = await Jadwal.countDocuments(query);
        
        // Ambil data
        let jadwalList = await Jadwal.find(query)
            .populate(populateOptions)
            .skip(skip)
            .limit(parseInt(limit))
            .sort({ [sortField]: sortOrder, jam_mulai: 1 });
        
        // Filter by dosen (setelah populate, karena perlu akses nested field)
        if (dosen) {
            jadwalList = jadwalList.filter(jadwal => {
                const namaDosen = jadwal.mata_kuliah_id?.dosen_id?.nama || '';
                return namaDosen.toLowerCase().includes(dosen.toLowerCase());
            });
        }
        
        // Format response
        const formattedJadwal = jadwalList.map(jadwal => ({
            id: jadwal._id,
            hari: jadwal.hari,
            jam_mulai: jadwal.jam_mulai,
            jam_selesai: jadwal.jam_selesai,
            semester_aktif: jadwal.semester_aktif,
            kelas: jadwal.kelas,
            mata_kuliah: {
                id: jadwal.mata_kuliah_id?._id,
                kode: jadwal.mata_kuliah_id?.kode,
                nama: jadwal.mata_kuliah_id?.nama,
                sks: jadwal.mata_kuliah_id?.sks,
                jurusan: jadwal.mata_kuliah_id?.jurusan,
                fakultas: jadwal.mata_kuliah_id?.fakultas,
                semester: jadwal.mata_kuliah_id?.semester,
                semester_tipe: jadwal.mata_kuliah_id?.semester_tipe
            },
            dosen: {
                id: jadwal.mata_kuliah_id?.dosen_id?._id,
                kode_dosen: jadwal.mata_kuliah_id?.dosen_id?.kode_dosen,
                nama: jadwal.mata_kuliah_id?.dosen_id?.nama,
                fakultas: jadwal.mata_kuliah_id?.dosen_id?.fakultas,
                jurusan: jadwal.mata_kuliah_id?.dosen_id?.jurusan
            },
            ruang: {
                id: jadwal.ruang_id?._id,
                kode: jadwal.ruang_id?.kode,
                nama: jadwal.ruang_id?.nama,
                kapasitas: jadwal.ruang_id?.kapasitas,
                lokasi_gedung: jadwal.ruang_id?.lokasi_gedung,
                lantai: jadwal.ruang_id?.lantai
            },
            created_at: jadwal.createdAt,
            updated_at: jadwal.updatedAt
        }));
        
        console.log(`✅ Found ${total} total jadwal, showing ${formattedJadwal.length}`);
        
        res.status(200).json({
            success: true,
            data: formattedJadwal,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / limit),
                showing: formattedJadwal.length
            },
            filters: {
                hari: hari || 'All',
                ruang: ruang || 'All',
                dosen: dosen || 'All',
                jurusan: jurusan || 'All',
                fakultas: fakultas || 'All',
                semester_aktif: semester_aktif || 'All',
                sort_by: sort,
                sort_order: order
            },
            timestamp: new Date().toISOString()
        });
        
    } catch (error) {
        console.error('🔥 Error getting all jadwal:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Server error',
            message: error.message 
        });
    }
};

// 5. GET JADWAL BY MATA KULIAH JURUSAN
exports.getJadwalByJurusan = async (req, res) => {
    try {
        const { jurusan } = req.params;
        const { semester_aktif, semester_tipe } = req.query;
        
        // Cari mata kuliah berdasarkan jurusan
        const query = { jurusan };
        if (semester_tipe) query.semester_tipe = semester_tipe;
        
        const mataKuliah = await MataKuliah.find(query);
        
        if (mataKuliah.length === 0) {
            return res.status(404).json({
                success: false,
                error: `Tidak ada mata kuliah untuk jurusan ${jurusan}`
            });
        }
        
        // Cari jadwal untuk mata kuliah tersebut
        const jadwalQuery = {
            mata_kuliah_id: { $in: mataKuliah.map(mk => mk._id) }
        };
        
        if (semester_aktif) {
            jadwalQuery.semester_aktif = semester_aktif;
        }
        
        const jadwal = await Jadwal.find(jadwalQuery)
            .populate({
                path: 'mata_kuliah_id',
                populate: { path: 'dosen_id' }
            })
            .populate('ruang_id')
            .sort({ hari: 1, jam_mulai: 1 });
        
        // Format response
        const formattedJadwal = jadwal.map(j => ({
            id: j._id,
            hari: j.hari,
            jam_mulai: j.jam_mulai,
            jam_selesai: j.jam_selesai,
            kelas: j.kelas,
            semester_aktif: j.semester_aktif,
            mata_kuliah: {
                nama: j.mata_kuliah_id.nama,
                kode: j.mata_kuliah_id.kode,
                sks: j.mata_kuliah_id.sks,
                semester: j.mata_kuliah_id.semester,
                semester_tipe: j.mata_kuliah_id.semester_tipe
            },
            dosen: {
                nama: j.mata_kuliah_id.dosen_id.nama,
                kode_dosen: j.mata_kuliah_id.dosen_id.kode_dosen
            },
            ruang: {
                nama: j.ruang_id.nama,
                lokasi_gedung: j.ruang_id.lokasi_gedung,
                kapasitas: j.ruang_id.kapasitas
            }
        }));
        
        res.status(200).json({
            success: true,
            jurusan,
            total: formattedJadwal.length,
            filters: {
                semester_aktif: semester_aktif || 'All',
                semester_tipe: semester_tipe || 'All'
            },
            data: formattedJadwal
        });
    } catch (error) {
        console.error('🔥 Error getting jadwal by jurusan:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Server error',
            message: error.message 
        });
    }
};

// 6. ASSIGN MAHASISWA KE JADWAL (untuk MahasiswaKelas)
exports.assignMahasiswaToJadwal = async (req, res) => {
    try {
        const { mahasiswa_id, jadwal_id } = req.body;
        
        // Validasi input
        if (!mahasiswa_id || !jadwal_id) {
            return res.status(400).json({
                success: false,
                error: 'mahasiswa_id dan jadwal_id harus diisi'
            });
        }
        
        // Cek apakah mahasiswa dan jadwal ada
        const [mahasiswa, jadwal] = await Promise.all([
            Mahasiswa.findById(mahasiswa_id),
            Jadwal.findById(jadwal_id).populate('mata_kuliah_id')
        ]);
        
        if (!mahasiswa) {
            return res.status(404).json({
                success: false,
                error: 'Mahasiswa tidak ditemukan'
            });
        }
        
        if (!jadwal) {
            return res.status(404).json({
                success: false,
                error: 'Jadwal tidak ditemukan'
            });
        }
        
        // Cek apakah jurusan mahasiswa sesuai dengan jurusan mata kuliah
        if (mahasiswa.jurusan !== jadwal.mata_kuliah_id.jurusan) {
            return res.status(400).json({
                success: false,
                error: 'Jurusan mahasiswa tidak sesuai dengan jurusan mata kuliah'
            });
        }
        
        // Cek apakah sudah terdaftar
        const existing = await MahasiswaKelas.findOne({
            mahasiswa_id,
            jadwal_id
        });
        
        if (existing) {
            return res.status(400).json({
                success: false,
                error: 'Mahasiswa sudah terdaftar di jadwal ini'
            });
        }
        
        // Buat entri MahasiswaKelas
        const mahasiswaKelas = new MahasiswaKelas({
            mahasiswa_id,
            jadwal_id
        });
        
        await mahasiswaKelas.save();
        
        res.status(201).json({
            success: true,
            message: 'Mahasiswa berhasil didaftarkan ke jadwal',
            data: {
                mahasiswa: {
                    nama: mahasiswa.nama,
                    nim: mahasiswa.nim,
                    jurusan: mahasiswa.jurusan
                },
                jadwal: {
                    mata_kuliah: jadwal.mata_kuliah_id.nama,
                    hari: jadwal.hari,
                    jam: `${jadwal.jam_mulai} - ${jadwal.jam_selesai}`,
                    semester_aktif: jadwal.semester_aktif
                },
                assignment_id: mahasiswaKelas._id
            }
        });
    } catch (error) {
        console.error('🔥 Error assigning mahasiswa to jadwal:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Server error',
            message: error.message 
        });
    }
};