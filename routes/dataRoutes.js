const express = require('express');
const router = express.Router();
const dataController = require('../controllers/dataController');

// Get all dosen
router.get('/dosen', dataController.getDosen);

// Get all ruang
router.get('/ruang', dataController.getRuang);

// Get all mata kuliah
router.get('/mata-kuliah', dataController.getMataKuliah);

// Get sample IDs for testing
router.get('/samples/ids', dataController.getSampleIds);

// Get multiple samples
router.get('/samples/all', dataController.getSamples);

// Database seeding
router.post('/seed', dataController.seedDatabase);

// Get seeding status
router.get('/seed/status', dataController.getSeedingStatus);

// Get data statistics
router.get('/stats', dataController.getDataStats);

// Clear all data (dangerous!)
router.delete('/clear', dataController.clearAllData);

// Export data endpoints
router.get('/export/dosen', (req, res) => {
    res.json({ message: 'Export dosen endpoint' });
});

router.get('/export/mahasiswa', (req, res) => {
    res.json({ message: 'Export mahasiswa endpoint' });
});

router.get('/export/jadwal', (req, res) => {
    res.json({ message: 'Export jadwal endpoint' });
});

module.exports = router;