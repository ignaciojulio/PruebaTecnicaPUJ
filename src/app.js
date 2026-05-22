const express = require('express');
const app = express();

// Middlewares globales
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Importación de rutas (Se asume un index.js en la carpeta routes que se creará luego)
const mainRouter = require('./routes');
app.use('/api', mainRouter);

// Ruta de salud (Health Check)
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'OK', message: 'API de Biblioteca funcionando' });
});

// Middleware de manejo de errores centralizado
app.use((err, req, res, next) => {
    console.error(`[Error]: ${err.message}`);

    const statusCode = err.statusCode || 500;
    res.status(statusCode).json({
        status: 'error',
        statusCode,
        message: err.message || 'Error interno del servidor',
        stack: process.env.NODE_ENV === 'development' ? err.stack : {}
    });
});

module.exports = app;