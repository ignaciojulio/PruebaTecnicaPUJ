const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Book = require('./Book');

/**
 * Modelo de Préstamo
 * Representa la entidad 'loans' y maneja la relación con los libros.
 */
const Loan = sequelize.define('Loan', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    book_isbn: {
        type: DataTypes.STRING,
        allowNull: false,
        references: {
            model: 'books',
            key: 'isbn'
        }
    },
    user_id: {
        type: DataTypes.STRING,
        allowNull: false
    },
    loan_date: {
        type: DataTypes.DATE,
        allowNull: false
    },
    due_date: {
        type: DataTypes.DATE,
        allowNull: false
    },
    status: {
        type: DataTypes.ENUM('ACTIVO', 'DEVUELTO'),
        defaultValue: 'ACTIVO',
        validate: {
            isIn: [['ACTIVO', 'DEVUELTO']]
        }
    }
}, {
    tableName: 'loans',
    timestamps: true
});

// Definición de relaciones
Book.hasMany(Loan, { foreignKey: 'book_isbn', as: 'loans' });
Loan.belongsTo(Book, { foreignKey: 'book_isbn', as: 'book' });

module.exports = Loan;