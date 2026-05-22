const bookRepository = require('../repositories/bookRepository');

class BookService {
    /**
     * Verifica la disponibilidad de un libro por su ISBN.
     * @param {string} isbn 
     * @returns {Object} { available: boolean, copies: number }
     */
    async checkAvailability(isbn) {
        const book = await bookRepository.findByIsbn(isbn);

        if (!book) {
            const error = new Error('Libro no encontrado');
            error.statusCode = 404;
            throw error;
        }

        return {
            available: book.available_copies > 0,
            copies: book.available_copies
        };
    }
}

module.exports = new BookService();