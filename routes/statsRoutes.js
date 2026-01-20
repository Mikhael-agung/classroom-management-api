const express = require('express');
const router = express.Router();
const statsController = require('../controllers/statsController');

// Get comprehensive statistics
router.get('/', statsController.getStats);

// Get real-time dashboard stats
router.get('/dashboard', statsController.getDashboardStats);

// Get faculty-specific statistics
router.get('/fakultas/:fakultas', statsController.getFacultyStats);

// Get detailed breakdowns
router.get('/breakdown/mahasiswa', (req, res) => {
    res.json({ 
        message: 'Mahasiswa breakdown endpoint',
        note: 'Returns detailed mahasiswa statistics by fakultas, jurusan, angkatan'
    });
});

router.get('/breakdown/dosen', (req, res) => {
    res.json({ 
        message: 'Dosen breakdown endpoint',
        note: 'Returns detailed dosen statistics by fakultas, jurusan'
    });
});

router.get('/breakdown/ruang', (req, res) => {
    res.json({ 
        message: 'Ruang breakdown endpoint',
        note: 'Returns detailed ruang utilization statistics'
    });
});

// Get utilization reports
router.get('/utilization/daily', (req, res) => {
    res.json({ 
        message: 'Daily utilization report endpoint',
        note: 'Returns room utilization by day'
    });
});

router.get('/utilization/monthly', (req, res) => {
    res.json({ 
        message: 'Monthly utilization report endpoint',
        note: 'Returns room utilization by month'
    });
});

module.exports = router;