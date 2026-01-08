require('dotenv').config();
const mongoose = require('mongoose');
const Mahasiswa = require('../models/Mahasiswa');
const Dosen = require('../models/Dosen');
const MataKuliah = require('../models/MatKul');
const Ruang = require('../models/Ruang');
const Jadwal = require('../models/Jadwal');
const Booking = require('../models/Booking');

// ===== GENERATE 5000 MAHASISWA =====
const generate5000Mahasiswa = () => {
    const mahasiswa = [];
    const prodiOptions = ['Informatika', 'Sistem Informasi', 'Teknik Komputer'];
    const angkatanOptions = [2020, 2021, 2022, 2023];

    console.log('🔨 Generating 5000 mahasiswa...');

    for (let i = 1; i <= 5000; i++) {
        const prodiIndex = Math.floor(Math.random() * 3);
        const angkatanIndex = Math.floor(Math.random() * 4);
        const nim = `2023${String(i).padStart(4, "0")}`;

        mahasiswa.push({
            nim: nim,
            nama: `Mahasiswa ${i}`,
            nama_lengkap: `Mahasiswa ${prodiOptions[prodiIndex].substring(0, 3)}-${i}`,
            prodi: prodiOptions[prodiIndex],
            angkatan: angkatanOptions[angkatanIndex],
            email: `mhs${nim}@university.edu`,
            no_hp: `08${Math.floor(1000000000 + Math.random() * 9000000000)}`,
            status: 'active'
        });

        // Progress indicator
        if (i % 1000 === 0) {
            console.log(`   Generated ${i} mahasiswa...`);
        }
    }

    console.log(`✅ Generated total ${mahasiswa.length} mahasiswa`);
    return mahasiswa;
};

// ===== GENERATE DATA DOSEN =====
const dosenData = [
    { kode_dosen: "D001", nama: "Dr. Andi Wijaya", prodi: "Informatika", email: "andi@university.edu" },
    { kode_dosen: "D002", nama: "Prof. Budi Santoso", prodi: "Sistem Informasi", email: "budi@university.edu" },
    { kode_dosen: "D003", nama: "Ir. Citra Dewi", prodi: "Teknik Komputer", email: "citra@university.edu" },
    { kode_dosen: "D004", nama: "Dr. Eka Pratama", prodi: "Informatika", email: "eka@university.edu" },
    { kode_dosen: "D005", nama: "M.Sc. Fajar Ramadhan", prodi: "Sistem Informasi", email: "fajar@university.edu" },
    { kode_dosen: "D006", nama: "Dr. Gita Ayu", prodi: "Teknik Komputer", email: "gita@university.edu" },
    { kode_dosen: "D007", nama: "Prof. Hadi Susanto", prodi: "Informatika", email: "hadi@university.edu" },
    { kode_dosen: "D008", nama: "Ir. Indra Kurniawan", prodi: "Sistem Informasi", email: "indra@university.edu" },
    { kode_dosen: "D009", nama: "Dr. Joko Prabowo", prodi: "Teknik Komputer", email: "joko@university.edu" },
    { kode_dosen: "D010", nama: "M.Sc. Kartika Sari", prodi: "Informatika", email: "kartika@university.edu" }
];

// ===== GENERATE 100 RUANG =====
const generate100Ruang = () => {
    const ruangData = [];
    const gedungOptions = ['A', 'B', 'C', 'D', 'E'];
    const fasilitasOptions = ['proyektor', 'AC', 'whiteboard', 'komputer', 'sound system', 'internet'];

    console.log('🔨 Generating 100 ruang...');

    for (let i = 1; i <= 100; i++) {
        const gedung = gedungOptions[Math.floor(Math.random() * gedungOptions.length)];
        const lantai = Math.floor(Math.random() * 5) + 1;
        const kapasitas = [30, 40, 50, 60, 80, 100, 150, 200][Math.floor(Math.random() * 8)];

        // Random fasilitas (1-4 item)
        const numFasilitas = Math.floor(Math.random() * 4) + 1;
        const fasilitas = [];
        for (let j = 0; j < numFasilitas; j++) {
            const fasil = fasilitasOptions[Math.floor(Math.random() * fasilitasOptions.length)];
            if (!fasilitas.includes(fasil)) fasilitas.push(fasil);
        }

        ruangData.push({
            kode: `${gedung}${lantai}${String(i).padStart(2, "0")}`,
            nama: `Ruang ${gedung}-${lantai}-${String(i).padStart(2, "0")}`,
            kapasitas,
            fasilitas,
            gedung,
            lantai,
            status: 'active'
        });
    }

    console.log(`✅ Generated total ${ruangData.length} ruang`);
    return ruangData;
};

// ===== GENERATE 200 MATA KULIAH =====
const generate200MataKuliah = () => {
    const mataKuliahData = [];
    const prodiOptions = ['Informatika', 'Sistem Informasi', 'Teknik Komputer'];
    const sksOptions = [2, 3, 4];

    const matkulInformatika = [
        'Algoritma dan Pemrograman', 'Struktur Data', 'Basis Data', 'Pemrograman Web',
        'Jaringan Komputer', 'Sistem Operasi', 'Kecerdasan Buatan', 'Machine Learning',
        'Data Mining', 'Cloud Computing', 'Mobile Programming', 'UI/UX Design',
        'Software Engineering', 'Testing dan QA', 'Big Data', 'Computer Vision'
    ];

    const matkulSistemInformasi = [
        'Analisis Sistem', 'Manajemen Proyek TI', 'Sistem Informasi Manajemen',
        'E-Commerce', 'ERP', 'Business Intelligence', 'IT Governance',
        'Enterprise Architecture', 'Database Management', 'System Analysis',
        'IT Project Management', 'Digital Business', 'Information Security'
    ];

    const matkulTeknikKomputer = [
        'Arsitektur Komputer', 'Embedded System', 'Internet of Things',
        'Robotika', 'Digital Signal Processing', 'Microcontroller',
        'Hardware Design', 'Computer Network Security', 'Digital System',
        'Computer Organization', 'VLSI Design', 'Real-time Systems'
    ];

    let counter = 1;

    console.log('🔨 Generating 200 mata kuliah...');

    // Generate for each prodi
    prodiOptions.forEach(prodi => {
        let matkulList = [];

        switch (prodi) {
            case 'Informatika': matkulList = matkulInformatika; break;
            case 'Sistem Informasi': matkulList = matkulSistemInformasi; break;
            case 'Teknik Komputer': matkulList = matkulTeknikKomputer; break;
        }

        // Create multiple variations of each mata kuliah
        matkulList.forEach(matkul => {
            for (let level = 1; level <= 4; level++) {
                mataKuliahData.push({
                    kode: `${prodi.substring(0, 3).toUpperCase()}${String(counter).padStart(3, "0")}`,
                    nama: `${matkul} ${level}`,
                    sks: sksOptions[Math.floor(Math.random() * sksOptions.length)],
                    prodi,
                    semester: level * 2,
                    deskripsi: `Mata kuliah ${matkul} untuk semester ${level * 2}`
                });
                counter++;
            }
        });
    });

    // Trim to 200 if more
    const result = mataKuliahData.slice(0, 200);
    console.log(`✅ Generated total ${result.length} mata kuliah`);
    return result;
};

// ===== MAIN SEED FUNCTION =====
const seedDatabase = async () => {
    try {
        console.log('========================================');
        console.log('🌱 STARTING DATABASE SEEDING...');
        console.log('========================================');

        // Connect to MongoDB
        await mongoose.connect(process.env.DATABASE_URL);
        console.log('✅ Connected to MongoDB');

        // Clear existing data
        console.log('🧹 Clearing existing data...');
        await Mahasiswa.deleteMany({});
        await Dosen.deleteMany({});
        await MataKuliah.deleteMany({});
        await Ruang.deleteMany({});
        await Jadwal.deleteMany({});
        await Booking.deleteMany({});
        console.log('✅ Cleared existing data');

        // Generate data
        const mahasiswaData = generate5000Mahasiswa();
        const dosenDataGenerated = dosenData;
        const ruangData = generate100Ruang();
        const mataKuliahData = generate200MataKuliah();

        // Insert data
        console.log('📥 Inserting data...');

        // Insert dosen
        const dosen = await Dosen.insertMany(dosenDataGenerated);
        console.log(`✅ Inserted ${dosen.length} dosen`);

        // Insert ruang
        const ruang = await Ruang.insertMany(ruangData);
        console.log(`✅ Inserted ${ruang.length} ruang`);

        // Insert mata kuliah with dosen assignment
        const mataKuliahWithDosen = mataKuliahData.map((mk, index) => ({
            ...mk,
            dosen_id: dosen[index % dosen.length]._id
        }));
        const mataKuliah = await MataKuliah.insertMany(mataKuliahWithDosen);
        console.log(`✅ Inserted ${mataKuliah.length} mata kuliah`);

        // Insert 5000 mahasiswa in batches
        console.log('⏳ Inserting 5000 mahasiswa...');
        const batchSize = 500;
        for (let i = 0; i < mahasiswaData.length; i += batchSize) {
            const batch = mahasiswaData.slice(i, i + batchSize);
            await Mahasiswa.insertMany(batch);
            console.log(`   ✅ Inserted batch ${i / batchSize + 1}/${Math.ceil(mahasiswaData.length / batchSize)}`);
        }
        console.log(`✅ Inserted total ${mahasiswaData.length} mahasiswa`);

        // Generate jadwal (500 entries)
        console.log('📅 Generating jadwal...');
        const jadwalData = [];
        const hariOptions = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
        const jamOptions = [
            ['08:00', '10:00'], ['10:00', '12:00'], ['13:00', '15:00'],
            ['15:00', '17:00'], ['18:00', '20:00']
        ];

        for (let i = 0; i < 500; i++) {
            const mkIndex = Math.floor(Math.random() * mataKuliah.length);
            const ruangIndex = Math.floor(Math.random() * ruang.length);
            const hariIndex = Math.floor(Math.random() * hariOptions.length);
            const jamIndex = Math.floor(Math.random() * jamOptions.length);

            jadwalData.push({
                mata_kuliah_id: mataKuliah[mkIndex]._id,
                ruang_id: ruang[ruangIndex]._id,
                hari: hariOptions[hariIndex],
                jam_mulai: jamOptions[jamIndex][0],
                jam_selesai: jamOptions[jamIndex][1],
                semester: 'Ganjil 2024',
                kelas: ['A', 'B', 'C', 'D'][Math.floor(Math.random() * 4)]
            });
        }

        const jadwal = await Jadwal.insertMany(jadwalData);
        console.log(`✅ Inserted ${jadwal.length} jadwal`);

        // Generate bookings (100 entries)
        console.log('📋 Generating bookings...');
        const bookingData = [];

        for (let i = 0; i < 100; i++) {
            const ruangIndex = Math.floor(Math.random() * ruang.length);
            const daysFromNow = Math.floor(Math.random() * 60);
            const tanggal = new Date();
            tanggal.setDate(tanggal.getDate() + daysFromNow);

            const jamIndex = Math.floor(Math.random() * jamOptions.length);
            const dosenIndex = Math.floor(Math.random() * dosen.length);

            bookingData.push({
                ruang_id: ruang[ruangIndex]._id,
                tanggal: tanggal,
                jam_mulai: jamOptions[jamIndex][0],
                jam_selesai: jamOptions[jamIndex][1],
                pemohon: dosen[dosenIndex].nama,
                keperluan: ['Rapat', 'Seminar', 'Workshop', 'Ujian', 'Presentasi'][Math.floor(Math.random() * 5)],
                status: ['pending', 'approved'][Math.floor(Math.random() * 2)],
                jumlah_peserta: Math.floor(Math.random() * 100) + 10,
                kontak: dosen[dosenIndex].email
            });
        }

        const bookings = await Booking.insertMany(bookingData);
        console.log(`✅ Inserted ${bookings.length} bookings`);

        console.log('\n========================================');
        console.log('🎉 SEEDING COMPLETED SUCCESSFULLY!');
        console.log('========================================');
        console.log('📊 SUMMARY:');
        console.log(`- Mahasiswa: ${mahasiswaData.length} records`);
        console.log(`- Dosen: ${dosen.length} records`);
        console.log(`- Mata Kuliah: ${mataKuliah.length} records`);
        console.log(`- Ruang: ${ruang.length} records`);
        console.log(`- Jadwal: ${jadwal.length} records`);
        console.log(`- Booking: ${bookings.length} records`);
        console.log('========================================');
        console.log('🚀 To start server: npm run dev');
        console.log('📚 API Documentation: http://localhost:5000');
        console.log('========================================');

        process.exit(0);

    } catch (error) {
        console.error('❌ Error during seeding:', error);
        process.exit(1);
    }
};

// Run seeding
seedDatabase();