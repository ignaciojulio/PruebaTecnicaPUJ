const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

/**
 * Modelo de Libro
 * Representa la entidad 'books' en la base de datos.
 */
const Book = sequelize.define('Book', {
    isbn: {
        type: DataTypes.STRING,
        primaryKey: true,
        allowNull: false,
        comment: 'Identificador único internacional del libro'
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false
    },
    knowledge_area: {
        type: DataTypes.STRING,
        allowNull: false
    },
    available_copies: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
    }
}, {
    tableName: 'books',
    timestamps: true // Crea campos createdAt y updatedAt automáticamente
});

module.exports = Book;