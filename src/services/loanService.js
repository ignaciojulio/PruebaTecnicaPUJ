const loanRepository = require('../repositories/loanRepository');
const bookRepository = require('../repositories/bookRepository');

class LoanService {
    /**
     * Procesa la creación de un nuevo préstamo.
     * @param {Object} loanData 
     */
    async createLoan(loanData) {
        const { book_isbn } = loanData;

        // 1. Verificar si el libro existe y tiene copias
        const book = await bookRepository.findByIsbn(book_isbn);
        if (!book) {
            const error = new Error('El libro especificado no existe');
            error.statusCode = 404;
            throw error;
        }

        if (book.available_copies <= 0) {
            const error = new Error('No hay ejemplares disponibles para préstamo');
            error.statusCode = 400;
            throw error;
        }

        // 2. Registrar el préstamo
        const newLoan = await loanRepository.create(loanData);

        // 3. Disminuir copias disponibles
        await bookRepository.updateCopies(book_isbn, book.available_copies - 1);

        return newLoan;
    }

    /**
     * Procesa la devolución de un libro.
     * @param {string} loanId 
     */
    async returnBook(loanId) {
        const loan = await loanRepository.findById(loanId);

        if (!loan) {
            const error = new Error('Préstamo no encontrado');
            error.statusCode = 404;
            throw error;
        }

        if (loan.status === 'DEVUELTO') {
            const error = new Error('Este préstamo ya fue devuelto anteriormente');
            error.statusCode = 400;
            throw error;
        }

        // 1. Cambiar estado del préstamo
        await loanRepository.updateStatus(loanId, 'DEVUELTO');

        // 2. Aumentar copias en el libro (usamos el include del repo para obtener el libro actual)
        const book = loan.book;
        await bookRepository.updateCopies(book.isbn, book.available_copies + 1);

        return { message: 'Devolución procesada exitosamente' };
    }

    /**
     * Obtiene préstamos vencidos delegando al repositorio.
     */
    async getOverdueLoans() {
        return await loanRepository.findOverdueLoans();
    }
}

module.exports = new LoanService();