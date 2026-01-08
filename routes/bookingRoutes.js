const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');

router.post('/', bookingController.insertBooking);                    // 5
router.get('/ruang/:ruangId', bookingController.getBookingByRuang);   // 6
router.get('/occupancy/:ruangId', bookingController.hitungOccupancyRate); // 7

module.exports = router;