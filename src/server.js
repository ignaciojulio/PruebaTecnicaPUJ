const app = require('./app');
const sequelize = require('./config/database');
const Book = require('./models/Book');

const PORT = process.env.PORT || 3000;

/**
 * Función para precargar datos de prueba en la tabla 'Book' si está vacía.
 * Ejecuta automáticamente después de la sincronización de la BD.
 */
async function seedDatabase() {
    try {
        const bookCount = await Book.count();

        if (bookCount === 0) {
            console.log('📚 Iniciando precarga de libros de prueba...');

            await Book.bulkCreate([
                {
                    isbn: '978-0-13-468599-1',
                    title: 'Clean Code: A Handbook of Agile Software Craftsmanship',
                    knowledge_area: 'Programación',
                    available_copies: 5
                },
                {
                    isbn: '978-0-201-63361-0',
                    title: 'Design Patterns: Elements of Reusable Object-Oriented Software',
                    knowledge_area: 'Arquitectura de Software',
                    available_copies: 3
                },
                {
                    isbn: '978-0-321-35668-0',
                    title: 'Refactoring: Improving the Design of Existing Code',
                    knowledge_area: 'Ingeniería de Software',
                    available_copies: 4
                }
            ]);

            console.log('✅ Precarga completada: 3 libros insertados en la base de datos.');
        } else {
            console.log(`ℹ️  Tabla 'books' contiene ${bookCount} registros. Precarga omitida.`);
        }
    } catch (error) {
        console.error('❌ Error al precargar datos:', error.message);
    }
}

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

        // Precargar datos de prueba si la BD está vacía
        await seedDatabase();

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