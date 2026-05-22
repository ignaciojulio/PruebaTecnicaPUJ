const app = require('./app');
const sequelize = require('./config/database');

const PORT = process.env.PORT || 3000;

/**
 * Función para inicializar la base de datos y arrancar el servidor.
 */
async function bootstrap() {
    try {
        // Verificar conexión a la base de datos
        await sequelize.authenticate();
        console.log('✅ Conexión a PostgreSQL establecida exitosamente.');

        // Sincronizar modelos con la DB (alter: true es útil en desarrollo)
        await sequelize.sync({ force: false });
        console.log('✅ Modelos sincronizados con la base de datos.');

        // Iniciar escucha del servidor
        app.listen(PORT, () => {
            console.log(`🚀 Servidor activo en: http://localhost:${PORT}`);
        });
    } catch (error) {
        console.error('❌ No se pudo conectar a la base de datos:', error);
        process.exit(1); // Finaliza el proceso si hay un error crítico
    }
}

bootstrap();