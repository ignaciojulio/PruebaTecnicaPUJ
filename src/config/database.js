const { Sequelize } = require('sequelize');
require('dotenv').config();

/**
 * Configuración de la instancia de Sequelize.
 * Prioridad:
 * 1. DATABASE_URL (Render, Railway, otras plataformas en la nube) → SSL habilitado
 * 2. Variables locales (DB_USER, DB_PASSWORD, etc.) → SSL deshabilitado en desarrollo
 */

const isProduction = process.env.NODE_ENV === 'production';
const usesCloudDatabase = !!process.env.DATABASE_URL;

const sequelize = usesCloudDatabase
    ? new Sequelize(process.env.DATABASE_URL, {
        dialect: 'postgres',
        protocol: 'postgres',
        dialectOptions: {
            ssl: {
                require: true,
                rejectUnauthorized: false, // Necesario para conexiones SSL en Render/Heroku
            },
        },
        logging: false,
    })
    : new Sequelize(
        process.env.DB_NAME,
        process.env.DB_USER,
        process.env.DB_PASSWORD,
        {
            host: process.env.DB_HOST,
            port: process.env.DB_PORT,
            dialect: 'postgres',
            dialectOptions: isProduction
                ? {
                    ssl: {
                        require: true,
                        rejectUnauthorized: false,
                    },
                }
                : {}, // Sin SSL en desarrollo local
            logging: process.env.NODE_ENV === 'development' ? (msg) => console.log(`[Sequelize]: ${msg}`) : false,
        }
    );

module.exports = sequelize;