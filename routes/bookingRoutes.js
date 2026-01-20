const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');

// Insert booking
router.post('/', bookingController.insertBooking);

// Get booking by ruang
router.get('/ruang/:ruangId', bookingController.getBookingByRuang);

// Update booking status
router.put('/:id/status', bookingController.updateBookingStatus);

// Get booking by date range
router.get('/range', bookingController.getBookingByDateRange);

// Calculate occupancy rate
router.get('/ruang/:ruangId/occupancy', bookingController.hitungOccupancyRate);

// Get booking calendar view
router.get('/calendar', bookingController.getBookingCalendar);

// Get available rooms for booking
router.get('/available-rooms', bookingController.getAvailableRooms);

// Get booking by ID
router.get('/:id', (req, res) => {
    res.json({ 
        message: 'Get booking by ID endpoint',
        note: 'Implement using Booking.findById()'
    });
});

// Update booking
router.put('/:id', (req, res) => {
    res.json({ 
        message: 'Update booking endpoint',
        note: 'Implement full booking update'
    });
});

// Delete booking
router.delete('/:id', (req, res) => {
    res.json({ 
        message: 'Delete booking endpoint',
        note: 'Implement booking deletion'
    });
});

module.exports = router;