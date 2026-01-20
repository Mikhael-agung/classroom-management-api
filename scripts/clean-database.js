#!/usr/bin/env node

require('dotenv').config();
const mongoose = require('mongoose');
const readline = require('readline');

const models = {
  Mahasiswa: require('../models/Mahasiswa'),
  Dosen: require('../models/Dosen'),
  MataKuliah: require('../models/MatKul'),
  Ruang: require('../models/Ruang'),
  Jadwal: require('../models/Jadwal'),
  Booking: require('../models/Booking'),
  MahasiswaKelas: require('../models/MahasiswaKelas')
};

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

async function clearDatabase() {
  try {
    await mongoose.connect(process.env.DATABASE_URL || 'mongodb://localhost:27017/university_db');
    console.log('✅ Connected to MongoDB');

    // Tanya konfirmasi
    rl.question('⚠️  Apakah Anda yakin ingin menghapus SEMUA data? (yes/no): ', async (answer) => {
      if (answer.toLowerCase() !== 'yes') {
        console.log('❌ Dibatalkan.');
        rl.close();
        process.exit(0);
      }

      console.log('🧹 Menghapus semua data...');
      
      // Hapus dalam urutan yang benar
      const deletions = [
        { name: 'MahasiswaKelas', model: models.MahasiswaKelas },
        { name: 'Booking', model: models.Booking },
        { name: 'Jadwal', model: models.Jadwal },
        { name: 'MataKuliah', model: models.MataKuliah },
        { name: 'Mahasiswa', model: models.Mahasiswa },
        { name: 'Dosen', model: models.Dosen },
        { name: 'Ruang', model: models.Ruang }
      ];

      for (const { name, model } of deletions) {
        const result = await model.deleteMany({});
        console.log(`   ✅ Deleted ${result.deletedCount} ${name} records`);
      }

      console.log('\n🎉 Semua data berhasil dihapus!');
      rl.close();
      await mongoose.disconnect();
      process.exit(0);
    });

  } catch (error) {
    console.error('❌ Error:', error);
    rl.close();
    process.exit(1);
  }
}

clearDatabase();