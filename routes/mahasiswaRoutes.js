const express = require('express');
const router = express.Router();
const mahasiswaController = require('../controllers/mahasiswaController');

router.get('/paginated', mahasiswaController.getMahasiswaPaginated);
router.get('/search', mahasiswaController.searchMahasiswa);
router.get('/:npm', mahasiswaController.getMahasiswaByNPM);

module.exports = router;