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
async function generateMataKuliah(dosenList) {
  console.log('🔨 Generating 200 mata kuliah (25 per jurusan)...');
  const matkulList = [];
  let matkulCounter = 1;
  
  // 8 jurusan × 25 matkul = 200 matkul
  for (const [jurusan, matkulNames] of Object.entries(MATA_KULIAH_PER_JURUSAN)) {
    const fakultas = getFakultasByJurusan(jurusan);
    const dosenJurusan = dosenList.filter(d => d.jurusan === jurusan);
    
    if (dosenJurusan.length === 0) {
      console.warn(`⚠️  Tidak ada dosen untuk jurusan ${jurusan}, menggunakan dosen dari jurusan lain`);
    }
    
    // Ambil 25 nama matkul untuk jurusan ini
    const selectedMatkulNames = matkulNames.slice(0, 25);
    
    for (let i = 0; i < 25; i++) {
      const nama = selectedMatkulNames[i];
      
      // Semester 1-8 secara merata (25/8 = ~3 matkul per semester)
      const semester = Math.floor(i / 3) + 1; // 1-8
      
      // Pastikan semester tidak melebihi 8
      const safeSemester = Math.min(semester, 8);
      
      const semesterTipe = safeSemester % 2 === 1 ? 'Ganjil' : 'Genap';
      
      // Pilih dosen (jika ada dosen di jurusan ini, jika tidak pilih random)
      let dosen;
      if (dosenJurusan.length > 0) {
        dosen = dosenJurusan[i % dosenJurusan.length];
      } else {
        dosen = dosenList[Math.floor(Math.random() * dosenList.length)];
      }
      
      matkulList.push({
        kode: generateKodeMatkul(jurusan, matkulCounter),
        nama: nama,
        sks: faker.helpers.arrayElement([2, 3, 4]),
        dosen_id: null, // Akan diisi setelah dosen dibuat
        jurusan: jurusan,
        fakultas: fakultas,
        semester_tipe: semesterTipe,
        semester: safeSemester, // PASTIKAN TIDAK LEBIH DARI 8
        deskripsi: `Mata kuliah ${nama} untuk jurusan ${jurusan}, semester ${safeSemester} (${semesterTipe})`
      });
      
      matkulCounter++;
    }
  }
  
  console.log(`✅ Generated ${matkulList.length} mata kuliah`);
  
  // Validasi: Pastikan tidak ada semester > 8
  const invalidMatkul = matkulList.filter(mk => mk.semester > 8);
  if (invalidMatkul.length > 0) {
    console.error(`❌ Ditemukan ${invalidMatkul.length} mata kuliah dengan semester > 8`);
    invalidMatkul.forEach(mk => {
      console.error(`   - ${mk.nama}: semester ${mk.semester}`);
    });
    // Fix: set ke 8
    invalidMatkul.forEach(mk => mk.semester = 8);
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
  console.log('🔨 Generating jadwal dengan conflict checking...');
  const jadwalList = [];
  const semesterAktif = ['Ganjil 2023/2024', 'Genap 2023/2024'];
  
  // Mapping dosen_id ke mata kuliah
  const mataKuliahWithDosen = mataKuliahList.map((mk, index) => ({
    ...mk,
    dosen_id: dosenList.find(d => 
      d.jurusan === mk.jurusan && d.fakultas === mk.fakultas
    )?._id || dosenList[index % dosenList.length]._id
  }));
  
  // Generate jadwal untuk setiap semester aktif
  for (const semester of semesterAktif) {
    console.log(`   Generating jadwal untuk semester ${semester}...`);
    
    // Filter mata kuliah sesuai semester tipe
    const tipeSemester = semester.includes('Ganjil') ? 'Ganjil' : 'Genap';
    const matkulFiltered = mataKuliahWithDosen.filter(mk => mk.semester_tipe === tipeSemester);
    
    // Batasi jumlah jadwal per semester
    const maxJadwalPerSemester = 300;
    const selectedMatkul = faker.helpers.arrayElements(matkulFiltered, 
      Math.min(maxJadwalPerSemester, matkulFiltered.length));
    
    for (const matkul of selectedMatkul) {
      let attempts = 0;
      let jadwalValid = false;
      
      while (!jadwalValid && attempts < 50) {
        const hari = faker.helpers.arrayElement(HARI);
        const jam = faker.helpers.arrayElement(JAM_KULIAH);
        const ruang = faker.helpers.arrayElement(ruangList);
        const kelas = faker.helpers.arrayElement(['A', 'B', 'C', 'D']);
        
        // Cek konflik
        const konflik = await cekKonflikJadwal(
          ruang._id, 
          hari, 
          jam[0], 
          jam[1], 
          matkul.dosen_id
        );
        
        if (!konflik) {
          // Kapasitas ruang harus cukup (asumsi 30-50 mahasiswa per kelas)
          const jmlMahasiswa = faker.number.int({ min: 25, max: 45 });
          if (jmlMahasiswa <= ruang.kapasitas) {
            jadwalList.push({
              mata_kuliah_id: matkul._id,
              ruang_id: ruang._id,
              hari: hari,
              jam_mulai: jam[0],
              jam_selesai: jam[1],
              semester_aktif: semester,
              kelas: kelas
            });
            jadwalValid = true;
          }
        }
        
        attempts++;
      }
      
      if (!jadwalValid) {
        console.warn(`   ⚠️ Gagal membuat jadwal untuk ${matkul.nama} setelah 50 attempts`);
      }
    }
  }
  
  console.log(`✅ Generated ${jadwalList.length} jadwal`);
  return jadwalList;
}

// ===== GENERATE MAHASISWA KELAS =====
async function generateMahasiswaKelas(mahasiswaList, jadwalList, mataKuliahList) {
  console.log('🔨 Generating mahasiswa kelas (5-7 jadwal per mahasiswa)...');
  const mahasiswaKelasList = [];
  let totalAssignments = 0;
  
  for (const mahasiswa of mahasiswaList) {
    // Tentukan berapa banyak jadwal untuk mahasiswa ini (5-7)
    const jumlahJadwal = faker.number.int({ min: 5, max: 7 });
    
    // Filter jadwal yang sesuai dengan jurusan mahasiswa
    const jadwalJurusan = jadwalList.filter(jadwal => {
      const matkul = mataKuliahList.find(m => m._id.equals(jadwal.mata_kuliah_id));
      return matkul && matkul.jurusan === mahasiswa.jurusan;
    });
    
    // Jika tidak ada jadwal untuk jurusan ini, skip
    if (jadwalJurusan.length === 0) {
      console.warn(`⚠️  Tidak ada jadwal untuk jurusan ${mahasiswa.jurusan}, mahasiswa ${mahasiswa.nim} tidak dapat diassign`);
      continue;
    }
    
    // Pilih jadwal secara random (max jumlah jadwal yang tersedia)
    const maxAssignments = Math.min(jumlahJadwal, jadwalJurusan.length);
    const selectedJadwal = faker.helpers.arrayElements(jadwalJurusan, maxAssignments);
    
    // Buat entri MahasiswaKelas
    for (const jadwal of selectedJadwal) {
      mahasiswaKelasList.push({
        mahasiswa_id: mahasiswa._id,
        jadwal_id: jadwal._id
      });
      totalAssignments++;
    }
    
    // Progress indicator
    if (mahasiswaKelasList.length % 10000 === 0) {
      console.log(`   Generated ${mahasiswaKelasList.length} assignments...`);
    }
  }
  
  console.log(`✅ Generated ${totalAssignments} assignments untuk ${mahasiswaList.length} mahasiswa`);
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
    await mongoose.connect(process.env.DATABASE_URL || 'mongodb://localhost:27017/university_db');
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
    
    // Generate and insert data
    // 1. Dosen
    const dosenData = await generateDosen();
    const dosen = await Dosen.insertMany(dosenData);
    console.log(`📥 Inserted ${dosen.length} dosen`);
    
    // 2. Ruang
    const ruangData = await generateRuang();
    const ruang = await Ruang.insertMany(ruangData);
    console.log(`📥 Inserted ${ruang.length} ruang`);
    
    // 3. Mata Kuliah
    const mataKuliahData = await generateMataKuliah(dosen);
    const mataKuliah = await MataKuliah.insertMany(mataKuliahData);
    console.log(`📥 Inserted ${mataKuliah.length} mata kuliah`);
    
    // 4. Mahasiswa (in batches)
    const mahasiswaData = await generateMahasiswa();
    console.log('⏳ Inserting 5000 mahasiswa...');
    const batchSize = 500;
    for (let i = 0; i < mahasiswaData.length; i += batchSize) {
      const batch = mahasiswaData.slice(i, i + batchSize);
      await Mahasiswa.insertMany(batch);
      console.log(`   ✅ Inserted batch ${i / batchSize + 1}/${Math.ceil(mahasiswaData.length / batchSize)}`);
    }
    const mahasiswa = await Mahasiswa.find();
    console.log(`📥 Inserted total ${mahasiswa.length} mahasiswa`);
    
    // 5. Jadwal
    const jadwalData = await generateJadwal(mataKuliah, ruang, dosen);
    const jadwal = await Jadwal.insertMany(jadwalData);
    console.log(`📥 Inserted ${jadwal.length} jadwal`);
    
    // 6. Mahasiswa Kelas
    const mahasiswaKelasData = await generateMahasiswaKelas(mahasiswa, jadwal, mataKuliah);
    const mahasiswaKelas = await MahasiswaKelas.insertMany(mahasiswaKelasData);
    console.log(`📥 Inserted ${mahasiswaKelas.length} mahasiswa-kelas assignments`);
    
    // 7. Booking
    const bookingData = await generateBooking(ruang, dosen);
    const booking = await Booking.insertMany(bookingData);
    console.log(`📥 Inserted ${booking.length} booking`);
    
    // Summary
    console.log('\n========================================');
    console.log('🎉 SEEDING COMPLETED SUCCESSFULLY!');
    console.log('========================================');
    console.log('📊 SUMMARY:');
    console.log(`  👨‍🏫 Dosen: ${dosen.length} records`);
    console.log(`  🏫 Ruang: ${ruang.length} records (${GEDUNG.join(', ')})`);
    console.log(`  📚 Mata Kuliah: ${mataKuliah.length} records (25 per jurusan)`);
    console.log(`  👨‍🎓 Mahasiswa: ${mahasiswa.length} records (625 per jurusan)`);
    console.log(`  📅 Jadwal: ${jadwal.length} records (dengan conflict checking)`);
    console.log(`  👥 Mahasiswa Kelas: ${mahasiswaKelas.length} assignments (5-7 per mahasiswa)`);
    console.log(`  📋 Booking: ${booking.length} records`);
    console.log('\n  🏛️  Fakultas:', FAKULTAS.join(', '));
    console.log('  🎓 Jurusan:', Object.keys(MATA_KULIAH_PER_JURUSAN).join(', '));
    console.log('  📅 Semester:', SEMESTER_GANJIL.join(', '), '(Ganjil) |', SEMESTER_GENAP.join(', '), '(Genap)');
    console.log('========================================');
    
    return {
      dosen: dosen.length,
      ruang: ruang.length,
      mataKuliah: mataKuliah.length,
      mahasiswa: mahasiswa.length,
      jadwal: jadwal.length,
      mahasiswaKelas: mahasiswaKelas.length,
      booking: booking.length
    };
    
  } catch (error) {
    console.error('❌ Error during seeding:', error);
    console.error('Stack trace:', error.stack);
    throw error;
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

// Export for use in controller
module.exports = { seedDatabase };

// Run if called directly
if (require.main === module) {
  seedDatabase().then(() => {
    console.log('🚀 Seeding completed!');
    process.exit(0);
  }).catch(error => {
    console.error('💥 Seeding failed:', error);
    process.exit(1);
  });
}