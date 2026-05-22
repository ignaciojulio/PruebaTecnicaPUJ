const express = require('express');
const router = express.Router();
const bookController = require('../controllers/bookController');
const loanController = require('../controllers/loanController');

// Rutas de Libros
router.get('/books/:isbn/availability', bookController.checkAvailability);

// Rutas de Préstamos
router.post('/loans', loanController.createLoan);
router.put('/loans/:id/return', loanController.returnBook);
router.get('/loans/overdue', loanController.getOverdueLoans);

module.exports = router;