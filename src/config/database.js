const { Sequelize } = require('sequelize');
require('dotenv').config();

/**
 * Configuración de la instancia de Sequelize.
 * Si existe DATABASE_URL (entorno de producción como Render), se prioriza.
 * De lo contrario, utiliza las variables locales.
 */
const sequelize = process.env.DATABASE_URL
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
            logging: (msg) => console.log(`[Sequelize]: ${msg}`),
        }
    );

module.exports = sequelize;