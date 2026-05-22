const { Op } = require('sequelize');
const Loan = require('../models/Loan');
const Book = require('../models/Book');

class LoanRepository {
    /**
     * Registra un nuevo préstamo en la base de datos.
     * @param {Object} loanData 
     */
    async create(loanData) {
        return await Loan.create(loanData);
    }

    /**
     * Obtiene un préstamo por su ID, incluyendo la información del libro.
     * @param {string} id 
     */
    async findById(id) {
        return await Loan.findByPk(id, {
            include: [{ model: Book, as: 'book' }]
        });
    }

    /**
     * Actualiza el estado de un préstamo (ej: de ACTIVO a DEVUELTO).
     * @param {string} id 
     * @param {string} status 
     */
    async updateStatus(id, status) {
        return await Loan.update(
            { status },
            { where: { id } }
        );
    }

    /**
     * Recupera todos los préstamos activos cuya fecha de entrega ha vencido.
     */
    async findOverdueLoans() {
        const now = new Date();
        return await Loan.findAll({
            where: {
                status: 'ACTIVO',
                due_date: {
                    [Op.lt]: now // Operador 'Less Than' (menor que)
                }
            },
            include: [{
                model: Book,
                as: 'book',
                attributes: ['title', 'isbn']
            }]
        });
    }
}

module.exports = new LoanRepository();