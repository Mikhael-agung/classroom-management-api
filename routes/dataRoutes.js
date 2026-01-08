const express = require('express');
const router = express.Router();
const dataController = require('../controllers/dataController');

router.get('/dosen', dataController.getDosen);
router.get('/ruang', dataController.getRuang);
router.get('/mata-kuliah', dataController.getMataKuliah);

module.exports = router;