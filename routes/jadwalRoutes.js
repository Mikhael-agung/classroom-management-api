const express = require('express');
const router = express.Router();
const jadwalController = require('../controllers/jadwalController');

// Insert jadwal (with conflict checking)
router.post('/insert', jadwalController.insertJadwal);

// Get jadwal by NPM (mahasiswa)
router.get('/mahasiswa/:npm', jadwalController.getJadwalByNPM);

// Get jadwal by dosen name
router.get('/dosen/:nama', jadwalController.getJadwalByDosen);

// Get all jadwal (admin/overview)
router.get('/all', jadwalController.getAllJadwal);

// Get jadwal by jurusan
router.get('/jurusan/:jurusan', jadwalController.getJadwalByJurusan);

// Check room availability
router.post('/check-availability', jadwalController.cekKetersediaanRuang);

// Clean duplicates
router.delete('/clean-duplicates', jadwalController.cleanDuplicates);

// Get jadwal by ID
router.get('/:id', jadwalController.getJadwalById);

// Assign mahasiswa to jadwal (for MahasiswaKelas)
router.post('/assign-mahasiswa', jadwalController.assignMahasiswaToJadwal);

// Batch assignments
router.post('/batch-assign', (req, res) => {
    res.json({ 
        message: 'Batch assignment endpoint - implement as needed',
        note: 'Use for bulk MahasiswaKelas assignments'
    });
});

module.exports = router;