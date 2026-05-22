const Book = require('../models/Book');

class BookRepository {
    /**
     * Busca un libro por su ISBN.
     * @param {string} isbn 
     */
    async findByIsbn(isbn) {
        return await Book.findByPk(isbn);
    }

    /**
     * Actualiza el contador de copias disponibles de un libro.
     * @param {string} isbn 
     * @param {number} newCopiesCount 
     */
    async updateCopies(isbn, newCopiesCount) {
        return await Book.update(
            { available_copies: newCopiesCount },
            {
                where: { isbn },
                returning: true
            }
        );
    }
}

module.exports = new BookRepository();