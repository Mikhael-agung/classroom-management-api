const express = require('express');
const router = express.Router();
const jadwalController = require('../controllers/jadwalController');

// 1. INSERT JADWAL (with conflict checking)
router.post('/insert', jadwalController.insertJadwal);

// 2. GET JADWAL MAHASISWA BY NPM
router.get('/mahasiswa/:npm', jadwalController.getJadwalByNPM);

// 3. GET JADWAL DOSEN BY NAMA
router.get('/dosen/:nama', jadwalController.getJadwalByDosen);

// 4. GET ALL JADWAL (admin/overview)
router.get('/all', jadwalController.getAllJadwal);

// 5. GET JADWAL BY JURUSAN
router.get('/jurusan/:jurusan', jadwalController.getJadwalByJurusan);

// 6. CHECK ROOM AVAILABILITY
router.post('/check-availability', jadwalController.cekKetersediaanRuang);

// 7. CLEAN DUPLICATES
router.delete('/clean-duplicates', jadwalController.cleanDuplicates);

// 8. GET JADWAL BY ID
router.get('/:id', jadwalController.getJadwalById);

// 9. ASSIGN MAHASISWA TO JADWAL (MahasiswaKelas)
router.post('/assign-mahasiswa', jadwalController.assignMahasiswaToJadwal);

module.exports = router;