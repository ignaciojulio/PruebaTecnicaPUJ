const request = require('supertest');
const app = require('../app');
const bookRepository = require('../repositories/bookRepository');
const loanRepository = require('../repositories/loanRepository');

describe('Pruebas de Integración: Endpoint de Préstamos (POST /api/loans)', () => {

    // Limpiar los mocks después de cada prueba para evitar efectos secundarios
    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('Escenario: Creación de Préstamo', () => {

        test('Debe retornar 201 y crear el préstamo cuando el libro tiene copias disponibles', async () => {
            // 1. Datos de entrada (Payload)
            const loanPayload = {
                book_isbn: '978-3-16-148410-0',
                user_id: 'EST-123',
                loan_date: new Date(),
                due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // +7 días
            };

            // 2. Mocking de Repositorios
            // Simulamos que el libro existe y tiene 5 copias
            const mockBook = { isbn: '978-3-16-148410-0', available_copies: 5 };
            jest.spyOn(bookRepository, 'findByIsbn').mockResolvedValue(mockBook);

            // Simulamos la creación exitosa del préstamo
            const mockCreatedLoan = { id: 'uuid-generado-por-db', ...loanPayload, status: 'ACTIVO' };
            jest.spyOn(loanRepository, 'create').mockResolvedValue(mockCreatedLoan);

            // Simulamos la actualización de copias exitosa
            jest.spyOn(bookRepository, 'updateCopies').mockResolvedValue([1]);

            // 3. Ejecución de la petición
            const response = await request(app)
                .post('/api/loans')
                .send(loanPayload);

            // 4. Aserciones
            expect(response.status).toBe(201); // Validamos el código 201 (Created)
            expect(response.body.status).toBe('success');
            expect(response.body.data).toHaveProperty('id');
            expect(response.body.data.book_isbn).toBe(loanPayload.book_isbn);

            // Verificamos que se llamó al repositorio para actualizar copias a 4 (5 - 1)
            expect(bookRepository.updateCopies).toHaveBeenCalledWith(loanPayload.book_isbn, 4);
        });

        test('Debe retornar 400 y mensaje de error cuando el libro NO tiene copias disponibles', async () => {
            // 1. Datos de entrada
            const loanPayload = {
                book_isbn: '978-0-00-000000-0',
                user_id: 'EST-999',
                loan_date: new Date(),
                due_date: new Date()
            };

            // 2. Mocking de Repositorios
            // Simulamos que el libro existe pero tiene 0 copias
            const mockBookNoStock = { isbn: '978-0-00-000000-0', available_copies: 0 };
            jest.spyOn(bookRepository, 'findByIsbn').mockResolvedValue(mockBookNoStock);

            // 3. Ejecución de la petición
            const response = await request(app)
                .post('/api/loans')
                .send(loanPayload);

            // 4. Aserciones
            expect(response.status).toBe(400); // Bad Request
            expect(response.body.status).toBe('error');
            expect(response.body.message).toContain('No hay ejemplares disponibles');

            // Verificamos que NUNCA se intentó crear el préstamo ni actualizar copias
            expect(loanRepository.create).not.toHaveBeenCalled();
            expect(bookRepository.updateCopies).not.toHaveBeenCalled();
        });

    });
});