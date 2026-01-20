const express = require('express');
const router = express.Router();
const jadwalController = require('../controllers/jadwalController');

// 7 Operasi Utama
router.post('/', jadwalController.insertJadwal);           // 1
router.get('/npm/:npm', jadwalController.getJadwalByNPM); // 2
router.get('/dosen/:nama', jadwalController.getJadwalByDosen); // 3
router.post('/cek', jadwalController.cekKetersediaanRuang); // 4
router.get('/all', jadwalController.getAllJadwal);         
router.get('/jadwal/clean-duplicates', jadwalController.cleanDuplicates);

module.exports = router;