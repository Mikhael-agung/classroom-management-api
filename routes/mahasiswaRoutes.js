const express = require('express');
const router = express.Router();
const mahasiswaController = require('../controllers/mahasiswaController');

// Get all mahasiswa with pagination
router.get('/paginated', mahasiswaController.getMahasiswaPaginated);

// Search mahasiswa
router.get('/search', mahasiswaController.searchMahasiswa);

// Get mahasiswa by NPM (NIM)
router.get('/npm/:npm', mahasiswaController.getMahasiswaByNPM);

// Get jadwal mahasiswa by NPM
router.get('/:npm/jadwal', mahasiswaController.getJadwalMahasiswa);

// Get statistics
router.get('/stats', mahasiswaController.getStatsMahasiswa);

// Create new mahasiswa
router.post('/', mahasiswaController.createMahasiswa);

// Update mahasiswa
router.put('/:id', mahasiswaController.updateMahasiswa);

// Delete mahasiswa
router.delete('/:id', mahasiswaController.deleteMahasiswa);

// Batch operations
router.get('/export', (req, res) => {
    res.json({ message: 'Export endpoint - implement as needed' });
});

module.exports = router;