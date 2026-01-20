require('dotenv').config();
const mongoose = require('mongoose');
const { faker } = require('@faker-js/faker');
const Mahasiswa = require('../models/Mahasiswa');
const Dosen = require('../models/Dosen');
const MataKuliah = require('../models/MatKul');
const Ruang = require('../models/Ruang');
const Jadwal = require('../models/Jadwal');
const Booking = require('../models/Booking');
const MahasiswaKelas = require('../models/MahasiswaKelas');

// ===== KONFIGURASI DATA =====
const FAKULTAS = ['Teknik', 'Ekonomi', 'Hukum', 'FISIP'];
const JURUSAN = {
    'Teknik': ['Informatika', 'Sistem Informasi'],
    'Ekonomi': ['Manajemen', 'Akuntansi'],
    'Hukum': ['Ilmu Hukum', 'Hukum Bisnis'],
    'FISIP': ['Komunikasi', 'Hubungan Internasional']
};

const SEMESTER_GANJIL = [1, 3, 5, 7];
const SEMESTER_GENAP = [2, 4, 6, 8];
const HARI = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
const JAM_KULIAH = [
    ['07:00', '08:40'], ['08:50', '10:30'], ['10:40', '12:20'],
    ['13:00', '14:40'], ['14:50', '16:30'], ['16:40', '18:20'], ['18:30', '20:10']
];
const GEDUNG = ['Gedung A', 'Gedung B', 'Gedung C', 'Gedung D'];

// ===== DATA MATA KULIAH PER JURUSAN (25 per jurusan) =====
const MATA_KULIAH_PER_JURUSAN = {
    'Informatika': [
        'Algoritma dan Pemrograman', 'Struktur Data', 'Basis Data', 'Pemrograman Berorientasi Objek',
        'Jaringan Komputer', 'Sistem Operasi', 'Rekayasa Perangkat Lunak', 'Kecerdasan Buatan',
        'Machine Learning', 'Data Mining', 'Pemrograman Web', 'Mobile Programming',
        'Cloud Computing', 'Keamanan Jaringan', 'Computer Vision', 'Big Data Analytics',
        'Internet of Things', 'UI/UX Design', 'Testing dan QA', 'Manajemen Proyek TI',
        'Komputasi Paralel', 'Data Science', 'Blockchain', 'DevOps', 'Cyber Security'
    ],
    'Sistem Informasi': [
        'Analisis Sistem', 'Sistem Informasi Manajemen', 'Manajemen Proyek TI', 'Basis Data',
        'Pemrograman Web', 'E-Commerce', 'ERP', 'Business Intelligence', 'IT Governance',
        'Enterprise Architecture', 'Database Management', 'System Analysis', 'Digital Business',
        'Information Security', 'Data Warehousing', 'IT Audit', 'Strategic Management',
        'Project Management', 'UI/UX Design', 'Cloud Computing', 'Big Data',
        'Digital Transformation', 'IT Service Management', 'Knowledge Management', 'CRM Systems'
    ],
    'Manajemen': [
        'Manajemen Keuangan', 'Manajemen Pemasaran', 'Manajemen Sumber Daya Manusia',
        'Manajemen Operasi', 'Manajemen Strategik', 'Perilaku Organisasi', 'Kewirausahaan',
        'Manajemen Rantai Pasok', 'Manajemen Kualitas', 'Manajemen Proyek',
        'Manajemen Investasi', 'Manajemen Risiko', 'Business Ethics', 'International Business',
        'Digital Marketing', 'Brand Management', 'Human Capital Management', 'Operations Research',
        'Strategic Management', 'Financial Management', 'Marketing Research', 'Organizational Theory',
        'Business Communication', 'Corporate Governance', 'Change Management'
    ],
    'Akuntansi': [
        'Akuntansi Keuangan', 'Akuntansi Biaya', 'Akuntansi Manajemen', 'Auditing',
        'Perpajakan', 'Sistem Informasi Akuntansi', 'Akuntansi Sektor Publik',
        'Akuntansi Internasional', 'Analisis Laporan Keuangan', 'Akuntansi Perbankan',
        'Akuntansi Pajak', 'Audit Internal', 'Forensic Accounting', 'Management Accounting',
        'Corporate Reporting', 'Financial Accounting', 'Accounting Theory', 'Cost Accounting',
        'Tax Planning', 'Financial Statement Analysis', 'Accounting Information Systems',
        'Public Sector Accounting', 'International Accounting', 'Accounting Ethics', 'Audit Assurance'
    ],
    'Ilmu Hukum': [
        'Hukum Perdata', 'Hukum Pidana', 'Hukum Tata Negara', 'Hukum Administrasi Negara',
        'Hukum Internasional', 'Hukum Dagang', 'Hukum Acara', 'Hukum Agraria',
        'Hukum Lingkungan', 'Hukum Keluarga', 'Hukum Waris', 'Hukum Perburuhan',
        'Hukum Pajak', 'Hukum Perjanjian', 'Hukum Pertanahan', 'Hukum Kesehatan',
        'Hukum Media', 'Hukum Teknologi', 'Hukum Islam', 'Hukum Adat',
        'Hukum Kepailitan', 'Hukum Investasi', 'Hukum Perusahaan', 'Hukum Kontrak', 'Legal Drafting'
    ],
    'Hukum Bisnis': [
        'Hukum Kontrak Bisnis', 'Hukum Perusahaan', 'Hukum Pasar Modal', 'Hukum Perbankan',
        'Hukum Asuransi', 'Hukum Ketenagakerjaan', 'Hukum Persaingan Usaha',
        'Hukum Kekayaan Intelektual', 'Hukum Investasi', 'Hukum Dagang Internasional',
        'Hukum Perpajakan', 'Hukum Kepailitan', 'Hukum Merger dan Akuisisi',
        'Hukum Perlindungan Konsumen', 'Hukum E-Commerce', 'Corporate Governance',
        'Business Law', 'Contract Law', 'Commercial Law', 'Corporate Law',
        'Securities Law', 'Banking Law', 'Insurance Law', 'Competition Law', 'IP Law'
    ],
    'Komunikasi': [
        'Teori Komunikasi', 'Komunikasi Massa', 'Komunikasi Antar Budaya', 'Public Relations',
        'Jurnalistik', 'Media Planning', 'Advertising', 'Brand Communication',
        'Digital Media', 'Social Media Marketing', 'Komunikasi Politik', 'Komunikasi Organisasi',
        'Communication Research', 'Media Ethics', 'Broadcasting', 'Content Creation',
        'Visual Communication', 'Strategic Communication', 'Crisis Communication',
        'Communication Strategy', 'Media Management', 'Corporate Communication',
        'Interpersonal Communication', 'Persuasive Communication', 'Communication Design'
    ],
    'Hubungan Internasional': [
        'Teori Hubungan Internasional', 'Diplomasi', 'Politik Internasional',
        'Organisasi Internasional', 'Hukum Internasional', 'Ekonomi Politik Internasional',
        'Keamanan Internasional', 'Studi Perdamaian dan Konflik', 'Foreign Policy Analysis',
        'International Political Economy', 'Global Governance', 'Diplomatic Protocol',
        'International Negotiation', 'Regional Studies', 'Human Rights',
        'International Development', 'Globalization Studies', 'International Security',
        'Diplomatic History', 'International Law', 'Foreign Policy', 'International Organizations',
        'Conflict Resolution', 'International Relations Theory', 'Diplomatic Practice'
    ]
};

// ===== HELPER FUNCTIONS =====
function getFakultasByJurusan(jurusan) {
    for (const [fak, jurusans] of Object.entries(JURUSAN)) {
        if (jurusans.includes(jurusan)) return fak;
    }
    return 'Teknik';
}

function generateNIM(jurusan, angkatan, index) {
    const kodeJurusan = {
        'Informatika': '01',
        'Sistem Informasi': '02',
        'Manajemen': '03',
        'Akuntansi': '04',
        'Ilmu Hukum': '05',
        'Hukum Bisnis': '06',
        'Komunikasi': '07',
        'Hubungan Internasional': '08'
    };
    return `${angkatan}${kodeJurusan[jurusan]}${String(index).padStart(4, '0')}`;
}

function generateKodeDosen(index) {
    return `D${String(index).padStart(3, '0')}`;
}

function generateKodeMatkul(jurusan, index) {
    const prefix = jurusan.substring(0, 3).toUpperCase();
    return `${prefix}${String(index).padStart(3, '0')}`;
}

// ===== CONFLICT CHECKER =====
async function cekKonflikJadwal(ruangId, hari, jamMulai, jamSelesai, dosenId, excludeId = null) {
    const query = {
        $or: [
            // Konflik ruang
            {
                ruang_id: ruangId,
                hari: hari,
                $or: [
                    { jam_mulai: { $lt: jamSelesai, $gte: jamMulai } },
                    { jam_selesai: { $gt: jamMulai, $lte: jamSelesai } },
                    { jam_mulai: { $lte: jamMulai }, jam_selesai: { $gte: jamSelesai } }
                ]
            },
            // Konflik dosen (jika ada dosenId)
            ...(dosenId ? [{
                'mata_kuliah_id.dosen_id': dosenId,
                hari: hari,
                $or: [
                    { jam_mulai: { $lt: jamSelesai, $gte: jamMulai } },
                    { jam_selesai: { $gt: jamMulai, $lte: jamSelesai } },
                    { jam_mulai: { $lte: jamMulai }, jam_selesai: { $gte: jamSelesai } }
                ]
            }] : [])
        ]
    };

    if (excludeId) {
        query._id = { $ne: excludeId };
    }

    return await Jadwal.findOne(query).populate('mata_kuliah_id');
}

// ===== GENERATE 100 DOSEN =====
async function generateDosen() {
    console.log('🔨 Generating 100 dosen...');
    const dosenList = [];

    for (let i = 1; i <= 100; i++) {
        const jurusanKeys = Object.keys(MATA_KULIAH_PER_JURUSAN);
        const jurusan = faker.helpers.arrayElement(jurusanKeys);
        const fakultas = getFakultasByJurusan(jurusan);

        dosenList.push({
            kode_dosen: generateKodeDosen(i),
            nama: faker.person.fullName(),
            fakultas: fakultas,
            jurusan: jurusan,
            email: faker.internet.email().toLowerCase(),
            no_hp: faker.phone.number('08##########'),
            keahlian: faker.helpers.arrayElements([
                'Penelitian', 'Pengajaran', 'Konsultasi', 'Pelatihan', 'Mentoring'
            ], 2),
            status: 'active'
        });
    }

    console.log(`✅ Generated ${dosenList.length} dosen`);
    return dosenList;
}

// ===== GENERATE 100 RUANG =====
async function generateRuang() {
    console.log('🔨 Generating 100 ruang...');
    const ruangList = [];
    const fasilitasOptions = ['proyektor', 'AC', 'whiteboard', 'komputer', 'sound system', 'internet', 'mic', 'layar'];

    for (let i = 1; i <= 100; i++) {
        const gedung = faker.helpers.arrayElement(GEDUNG);
        const lantai = faker.number.int({ min: 1, max: 6 });
        const kapasitas = faker.number.int({ min: 30, max: 50 });

        ruangList.push({
            kode: `${gedung.charAt(gedung.length - 1)}${lantai}${String(i).padStart(2, '0')}`,
            nama: `Ruang ${gedung} ${lantai}.${String(i).padStart(2, '0')}`,
            kapasitas: kapasitas,
            fasilitas: faker.helpers.arrayElements(fasilitasOptions, faker.number.int({ min: 3, max: 6 })),
            lokasi_gedung: gedung,
            lantai: lantai,
            status: 'active'
        });
    }

    console.log(`✅ Generated ${ruangList.length} ruang`);
    return ruangList;
}

// ===== GENERATE 200 MATA KULIAH =====
// ===== GENERATE MATA KULIAH DENGAN DOSEN YANG BENAR =====
async function generateMataKuliah(dosenList) {
    console.log('🔨 Generating 200 mata kuliah (25 per jurusan)...');
    const matkulList = [];
    let matkulCounter = 1;

    // 8 jurusan × 25 matkul = 200 matkul
    for (const [jurusan, matkulNames] of Object.entries(MATA_KULIAH_PER_JURUSAN)) {
        const fakultas = getFakultasByJurusan(jurusan);

        // Filter dosen untuk jurusan ini
        const dosenJurusan = dosenList.filter(d => d.jurusan === jurusan);

        if (dosenJurusan.length === 0) {
            console.warn(`⚠️  Tidak ada dosen untuk jurusan ${jurusan}, akan assign random dosen`);
        }

        // Ambil 25 nama matkul untuk jurusan ini
        const selectedMatkulNames = matkulNames.slice(0, 25);

        for (let i = 0; i < 25; i++) {
            const nama = selectedMatkulNames[i];

            // Semester 1-8 secara merata
            const semester = Math.floor(i / 3) + 1; // 1-8
            const safeSemester = Math.min(semester, 8);
            const semesterTipe = safeSemester % 2 === 1 ? 'Ganjil' : 'Genap';

            // Pilih dosen untuk matkul ini
            let selectedDosen;
            if (dosenJurusan.length > 0) {
                // Pilih dosen dari jurusan yang sama (round-robin)
                selectedDosen = dosenJurusan[i % dosenJurusan.length];
            } else {
                // Pilih random dosen jika tidak ada di jurusan
                selectedDosen = dosenList[Math.floor(Math.random() * dosenList.length)];
            }

            matkulList.push({
                kode: generateKodeMatkul(jurusan, matkulCounter),
                nama: nama,
                sks: faker.helpers.arrayElement([2, 3, 4]),
                dosen_id: selectedDosen._id, // INI DOSEN_ID YANG BENAR!
                jurusan: jurusan,
                fakultas: fakultas,
                semester_tipe: semesterTipe,
                semester: safeSemester,
                deskripsi: `Mata kuliah ${nama} untuk jurusan ${jurusan}, semester ${safeSemester} (${semesterTipe}) - Dosen: ${selectedDosen.nama}`
            });

            matkulCounter++;
        }

        console.log(`   ✅ Generated 25 mata kuliah untuk jurusan ${jurusan}`);
        console.log(`      Dosen available: ${dosenJurusan.length}`);
        if (dosenJurusan.length > 0) {
            console.log(`      Sample dosen: ${dosenJurusan[0].nama} (${dosenJurusan[0].kode_dosen})`);
        }
    }

    console.log(`✅ Generated ${matkulList.length} mata kuliah`);

    // Validasi: Pastikan semua mata kuliah punya dosen_id
    const matkulTanpaDosen = matkulList.filter(mk => !mk.dosen_id);
    if (matkulTanpaDosen.length > 0) {
        console.error(`❌ ERROR: ${matkulTanpaDosen.length} mata kuliah tanpa dosen_id!`);
        matkulTanpaDosen.forEach((mk, idx) => {
            console.error(`   ${idx + 1}. ${mk.nama} (${mk.jurusan}) - NO DOSEN`);
        });
        throw new Error('Mata kuliah tanpa dosen assignment');
    }

    return matkulList;
}

// ===== GENERATE 5000 MAHASISWA =====
async function generateMahasiswa() {
    console.log('🔨 Generating 5000 mahasiswa...');
    const mahasiswaList = [];
    const angkatanOptions = [2022, 2023, 2024, 2025];

    // Hitung distribusi per jurusan (5000 / 8 = 625 per jurusan)
    const perJurusan = 625;

    Object.keys(MATA_KULIAH_PER_JURUSAN).forEach((jurusan, jurusanIndex) => {
        const fakultas = getFakultasByJurusan(jurusan);

        for (let i = 1; i <= perJurusan; i++) {
            const angkatan = faker.helpers.arrayElement(angkatanOptions);
            const index = (jurusanIndex * perJurusan) + i;

            mahasiswaList.push({
                nim: generateNIM(jurusan, angkatan, i),
                nama: faker.person.fullName(),
                fakultas: fakultas,
                jurusan: jurusan,
                angkatan: angkatan,
                email: faker.internet.email().toLowerCase(),
                no_hp: faker.phone.number('08##########'),
                status: 'active'
            });

            // Progress indicator
            if (index % 1000 === 0) {
                console.log(`   Generated ${index} mahasiswa...`);
            }
        }
    });

    console.log(`✅ Generated ${mahasiswaList.length} mahasiswa`);
    return mahasiswaList;
}

// ===== GENERATE JADWAL DENGAN CONFLICT CHECKING =====
async function generateJadwal(mataKuliahList, ruangList, dosenList) {
    console.log('🔨 Generating jadwal...');
    const jadwalList = [];

    // Pastikan mata kuliah sudah punya _id (sudah di-insert)
    if (!mataKuliahList[0] || !mataKuliahList[0]._id) {
        console.error('❌ ERROR: Mata kuliah belum di-insert ke database!');
        console.error('   Pastikan insert mata kuliah dulu sebelum generate jadwal');
        return jadwalList;
    }

    console.log(`   Total mata kuliah: ${mataKuliahList.length}`);
    console.log(`   Total ruang: ${ruangList.length}`);

    // Group mata kuliah by jurusan
    const matkulByJurusan = {};
    mataKuliahList.forEach(mk => {
        if (!matkulByJurusan[mk.jurusan]) {
            matkulByJurusan[mk.jurusan] = [];
        }
        matkulByJurusan[mk.jurusan].push(mk);
    });

    // Untuk SETIAP jurusan, buat jadwal
    Object.keys(matkulByJurusan).forEach(jurusan => {
        console.log(`   📅 Generating jadwal untuk jurusan: ${jurusan}`);

        const matkulJurusan = matkulByJurusan[jurusan];
        const ruangSamples = ruangList.slice(0, 15); // Ambil 15 ruang

        // Buat 15-20 jadwal per jurusan
        const jumlahJadwal = Math.min(20, matkulJurusan.length);

        for (let i = 0; i < jumlahJadwal; i++) {
            const matkul = matkulJurusan[i];
            const hari = faker.helpers.arrayElement(HARI);
            const jam = faker.helpers.arrayElement(JAM_KULIAH);
            const ruang = faker.helpers.arrayElement(ruangSamples);
            const kelas = faker.helpers.arrayElement(['A', 'B', 'C', 'D']);

            // Tentukan semester aktif
            const semesterAktif = matkul.semester_tipe === 'Ganjil' ? 'Ganjil 2023/2024' : 'Genap 2023/2024';

            jadwalList.push({
                mata_kuliah_id: matkul._id, // INI _id YANG SUDAH ADA!
                ruang_id: ruang._id, // INI _id YANG SUDAH ADA!
                hari: hari,
                jam_mulai: jam[0],
                jam_selesai: jam[1],
                semester_aktif: semesterAktif,
                kelas: kelas
            });
        }

        console.log(`      ✅ Generated ${jumlahJadwal} jadwal`);
    });

    console.log(`✅ TOTAL generated ${jadwalList.length} jadwal`);

    // Tampilkan summary
    console.log('📊 Jadwal per jurusan:');
    const summary = {};
    jadwalList.forEach(j => {
        const matkul = mataKuliahList.find(m => m._id.equals(j.mata_kuliah_id));
        if (matkul) {
            summary[matkul.jurusan] = (summary[matkul.jurusan] || 0) + 1;
        }
    });

    Object.entries(summary).forEach(([jurusan, count]) => {
        console.log(`   ${jurusan}: ${count} jadwal`);
    });

    return jadwalList;
}

// ===== GENERATE MAHASISWA KELAS YANG BENAR =====
async function generateMahasiswaKelas(mahasiswaList, jadwalList, mataKuliahList) {
    console.log('🔨 Generating mahasiswa kelas...');

    if (jadwalList.length === 0) {
        console.error('❌ ERROR: Tidak ada jadwal yang tersedia!');
        return [];
    }

    console.log(`   Total jadwal: ${jadwalList.length}`);
    console.log(`   Total mahasiswa: ${mahasiswaList.length}`);

    // Group jadwal by jurusan untuk akses cepat
    const jadwalByJurusan = {};
    jadwalList.forEach(jadwal => {
        const matkul = mataKuliahList.find(m => m._id.equals(jadwal.mata_kuliah_id));
        if (matkul) {
            const jurusan = matkul.jurusan;
            if (!jadwalByJurusan[jurusan]) {
                jadwalByJurusan[jurusan] = [];
            }
            jadwalByJurusan[jurusan].push(jadwal);
        }
    });

    console.log('📊 Jadwal tersedia per jurusan:');
    Object.entries(jadwalByJurusan).forEach(([jurusan, jadwals]) => {
        console.log(`   ${jurusan}: ${jadwals.length} jadwal`);
    });

    const mahasiswaKelasList = [];
    let totalAssignments = 0;

    // Untuk SETIAP mahasiswa
    for (let i = 0; i < mahasiswaList.length; i++) {
        const mahasiswa = mahasiswaList[i];
        const jurusan = mahasiswa.jurusan;
        const availableJadwal = jadwalByJurusan[jurusan] || [];

        if (availableJadwal.length === 0) {
            // Skip jika tidak ada jadwal untuk jurusan ini
            if (i % 500 === 0) {
                console.warn(`⚠️  Mahasiswa ${mahasiswa.nim} (${jurusan}): tidak ada jadwal`);
            }
            continue;
        }

        // Assign 3-5 jadwal per mahasiswa
        const jumlahJadwal = faker.number.int({ min: 3, max: 5 });
        const maxAssign = Math.min(jumlahJadwal, availableJadwal.length);

        // Pilih jadwal unik secara random
        const selectedIndices = new Set();
        while (selectedIndices.size < maxAssign) {
            const randomIndex = faker.number.int({ min: 0, max: availableJadwal.length - 1 });
            selectedIndices.add(randomIndex);
        }

        // Buat entri MahasiswaKelas
        for (const index of selectedIndices) {
            mahasiswaKelasList.push({
                mahasiswa_id: mahasiswa._id,
                jadwal_id: availableJadwal[index]._id
            });
            totalAssignments++;
        }

        // Progress indicator
        if (totalAssignments % 1000 === 0) {
            console.log(`   Generated ${totalAssignments} assignments...`);
        }
    }

    console.log(`✅ Generated ${totalAssignments} assignments untuk ${mahasiswaList.length} mahasiswa`);
    console.log(`   Avg: ${(totalAssignments / mahasiswaList.length).toFixed(2)} assignments per mahasiswa`);

    return mahasiswaKelasList;
}

// ===== GENERATE BOOKING =====
async function generateBooking(ruangList, dosenList) {
    console.log('🔨 Generating booking ruang...');
    const bookingList = [];

    for (let i = 0; i < 200; i++) {
        const ruang = faker.helpers.arrayElement(ruangList);
        const dosen = faker.helpers.arrayElement(dosenList);
        const daysFromNow = faker.number.int({ min: 1, max: 90 });
        const tanggal = new Date();
        tanggal.setDate(tanggal.getDate() + daysFromNow);

        // Pastikan tanggal tidak weekend
        if (tanggal.getDay() === 0) tanggal.setDate(tanggal.getDate() + 1);
        if (tanggal.getDay() === 6) tanggal.setDate(tanggal.getDate() + 2);

        const jamIndex = faker.number.int({ min: 0, max: JAM_KULIAH.length - 1 });
        const jam = JAM_KULIAH[jamIndex];

        bookingList.push({
            ruang_id: ruang._id,
            tanggal: tanggal,
            jam_mulai: jam[0],
            jam_selesai: jam[1],
            pemohon: dosen.nama,
            keperluan: faker.helpers.arrayElement([
                'Rapat Jurusan', 'Seminar', 'Workshop', 'Ujian Tengah Semester',
                'Ujian Akhir Semester', 'Presentasi', 'Pelatihan', 'Focus Group Discussion'
            ]),
            status: faker.helpers.arrayElement(['pending', 'approved', 'rejected']),
            kontak: dosen.email,
            jumlah_peserta: faker.number.int({ min: 10, max: ruang.kapasitas })
        });
    }

    console.log(`✅ Generated ${bookingList.length} booking`);
    return bookingList;
}

// ===== MAIN SEED FUNCTION =====
async function seedDatabase() {
    try {
        console.log('========================================');
        console.log('🌱 STARTING DATABASE SEEDING...');
        console.log('========================================');

        // Connect to MongoDB
        await mongoose.connect(process.env.DATABASE_URL || 'mongodb://127.0.0.1:27017/university_db');
        console.log('✅ Connected to MongoDB');

        // Clear existing data
        console.log('🧹 Clearing existing data...');
        await MahasiswaKelas.deleteMany({});
        await Booking.deleteMany({});
        await Jadwal.deleteMany({});
        await MataKuliah.deleteMany({});
        await Mahasiswa.deleteMany({});
        await Dosen.deleteMany({});
        await Ruang.deleteMany({});
        console.log('✅ Cleared existing data');

        // ========== URUTAN SEEDING ==========

        // 1. GENERATE & INSERT DOSEN
        console.log('\n--- STEP 1: DOSEN ---');
        const dosenData = await generateDosen();
        console.log(`📥 Inserting ${dosenData.length} dosen...`);
        const dosen = await Dosen.insertMany(dosenData);
        console.log(`📥 Inserted ${dosen.length} dosen`);

        // Log distribusi dosen per jurusan
        console.log('📊 Distribusi dosen per jurusan:');
        const distribusiDosen = {};
        dosen.forEach(d => {
            distribusiDosen[d.jurusan] = (distribusiDosen[d.jurusan] || 0) + 1;
        });
        Object.entries(distribusiDosen).forEach(([jurusan, count]) => {
            console.log(`   ${jurusan}: ${count} dosen`);
        });

        // 2. GENERATE & INSERT RUANG
        console.log('\n--- STEP 2: RUANG ---');
        const ruangData = await generateRuang();
        console.log(`📥 Inserting ${ruangData.length} ruang...`);
        const ruang = await Ruang.insertMany(ruangData);
        console.log(`📥 Inserted ${ruang.length} ruang`);

        // 3. GENERATE & INSERT MATA KULIAH (dengan dosen_id yang SUDAH ADA)
        console.log('\n--- STEP 3: MATA KULIAH ---');
        console.log('   NOTE: Dosen sudah di-insert, memiliki _id valid');
        const mataKuliahData = await generateMataKuliah(dosen);
        console.log(`📥 Inserting ${mataKuliahData.length} mata kuliah...`);
        const mataKuliah = await MataKuliah.insertMany(mataKuliahData);
        console.log(`📥 Inserted ${mataKuliah.length} mata kuliah`);

        // Validasi: Cek beberapa mata kuliah punya dosen_id
        console.log('🔍 Validating mata kuliah assignments...');
        const sampleMatkul = await MataKuliah.find().limit(5).populate('dosen_id', 'nama kode_dosen jurusan');
        sampleMatkul.forEach((mk, idx) => {
            console.log(`   ${idx + 1}. ${mk.kode} - ${mk.nama}`);
            console.log(`      Dosen: ${mk.dosen_id ? mk.dosen_id.nama : 'NULL'} (${mk.dosen_id ? mk.dosen_id.jurusan : 'N/A'})`);
        });

        // 4. GENERATE & INSERT MAHASISWA
        console.log('\n--- STEP 4: MAHASISWA ---');
        const mahasiswaData = await generateMahasiswa();
        console.log(`⏳ Inserting ${mahasiswaData.length} mahasiswa...`);
        const batchSize = 500;
        for (let i = 0; i < mahasiswaData.length; i += batchSize) {
            const batch = mahasiswaData.slice(i, i + batchSize);
            await Mahasiswa.insertMany(batch);
            console.log(`   ✅ Inserted batch ${i / batchSize + 1}/${Math.ceil(mahasiswaData.length / batchSize)}`);
        }
        const mahasiswa = await Mahasiswa.find();
        console.log(`📥 Inserted total ${mahasiswa.length} mahasiswa`);

        // 5. GENERATE & INSERT JADWAL
        console.log('\n--- STEP 5: JADWAL ---');
        console.log('   Generating jadwal dengan referensi valid...');
        const jadwalData = await generateJadwal(mataKuliah, ruang, dosen);

        if (jadwalData.length === 0) {
            console.error('❌ ERROR: Tidak ada jadwal yang di-generate!');
            throw new Error('Jadwal generation failed');
        }

        console.log(`📥 Inserting ${jadwalData.length} jadwal...`);
        const jadwal = await Jadwal.insertMany(jadwalData);
        console.log(`📥 Inserted ${jadwal.length} jadwal`);

        // Validasi jadwal
        console.log('🔍 Validating jadwal assignments...');
        const sampleJadwal = await Jadwal.find()
            .limit(3)
            .populate({
                path: 'mata_kuliah_id',
                select: 'nama kode dosen_id',
                populate: {
                    path: 'dosen_id',
                    select: 'nama kode_dosen'
                }
            })
            .populate('ruang_id', 'nama kode');

        sampleJadwal.forEach((j, idx) => {
            console.log(`   ${idx + 1}. ${j.mata_kuliah_id?.nama || 'Unknown'} (${j.hari} ${j.jam_mulai}-${j.jam_selesai})`);
            console.log(`      Ruang: ${j.ruang_id?.nama || 'Unknown'}`);
            console.log(`      Dosen: ${j.mata_kuliah_id?.dosen_id?.nama || 'NULL'}`);
        });

        // 6. GENERATE & INSERT MAHASISWA KELAS
        console.log('\n--- STEP 6: MAHASISWA KELAS ---');
        const mahasiswaKelasData = await generateMahasiswaKelas(mahasiswa, jadwal, mataKuliah);

        if (mahasiswaKelasData.length > 0) {
            console.log(`📥 Inserting ${mahasiswaKelasData.length} mahasiswa-kelas assignments...`);
            const mahasiswaKelas = await MahasiswaKelas.insertMany(mahasiswaKelasData);
            console.log(`📥 Inserted ${mahasiswaKelas.length} mahasiswa-kelas assignments`);
        } else {
            console.warn('⚠️  Tidak ada MahasiswaKelas yang di-generate!');
        }

        // 7. GENERATE & INSERT BOOKING
        console.log('\n--- STEP 7: BOOKING ---');
        const bookingData = await generateBooking(ruang, dosen);
        console.log(`📥 Inserting ${bookingData.length} booking...`);
        const booking = await Booking.insertMany(bookingData);
        console.log(`📥 Inserted ${booking.length} booking`);

        // FINAL SUMMARY
        console.log('\n========================================');
        console.log('🎉 SEEDING COMPLETED SUCCESSFULLY!');
        console.log('========================================');
        console.log('📊 FINAL DATABASE STATUS:');

        const finalCounts = {
            dosen: await Dosen.countDocuments(),
            ruang: await Ruang.countDocuments(),
            mataKuliah: await MataKuliah.countDocuments(),
            mahasiswa: await Mahasiswa.countDocuments(),
            jadwal: await Jadwal.countDocuments(),
            mahasiswaKelas: await MahasiswaKelas.countDocuments(),
            booking: await Booking.countDocuments()
        };

        console.log(`  👨‍🏫 Dosen: ${finalCounts.dosen} records`);
        console.log(`  🏫 Ruang: ${finalCounts.ruang} records`);
        console.log(`  📚 Mata Kuliah: ${finalCounts.mataKuliah} records`);
        console.log(`  👨‍🎓 Mahasiswa: ${finalCounts.mahasiswa} records`);
        console.log(`  📅 Jadwal: ${finalCounts.jadwal} records`);
        console.log(`  👥 Mahasiswa Kelas: ${finalCounts.mahasiswaKelas} assignments`);
        console.log(`  📋 Booking: ${finalCounts.booking} records`);

        // Cek mata kuliah tanpa dosen
        const matkulNoDosen = await MataKuliah.countDocuments({ dosen_id: null });
        if (matkulNoDosen > 0) {
            console.warn(`⚠️  PERINGATAN: ${matkulNoDosen} mata kuliah tanpa dosen assignment!`);
        } else {
            console.log('✅ SEMUA mata kuliah memiliki dosen assignment!');
        }

        return finalCounts;

    } catch (error) {
        console.error('\n❌ ERROR during seeding:', error.message);
        console.error('Stack trace:', error.stack);
        throw error;
    } finally {
        await mongoose.disconnect();
        console.log('🔌 Disconnected from MongoDB');
    }
}