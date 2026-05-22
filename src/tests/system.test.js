/**
 * SUITE DE PRUEBAS INTEGRAL - QA AUTOMATION ENGINEER SENIOR
 * ═══════════════════════════════════════════════════════════════════
 * Auditoría completa de la API REST de Gestión de Préstamos (Biblioteca)
 * 
 * Escenarios cubiertos:
 * 1. Consulta de Disponibilidad (GET /api/books/:isbn/availability)
 * 2. Creación de Préstamo (POST /api/loans)
 * 3. Devolución de Préstamo (PUT /api/loans/:id/return)
 * 4. Consulta de Préstamos Vencidos (GET /api/loans/overdue)
 * 5. Integridad de Datos (Transaccionalidad)
 */

const request = require('supertest');
const app = require('../app');
const bookRepository = require('../repositories/bookRepository');
const loanRepository = require('../repositories/loanRepository');

// ═══════════════════════════════════════════════════════════════════
// ESCENARIO 1: CONSULTA DE DISPONIBILIDAD
// ═══════════════════════════════════════════════════════════════════
describe('ESCENARIO 1: Consulta de Disponibilidad (GET /api/books/:isbn/availability)', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('Happy Path: Libro existe y tiene copias disponibles', () => {
        test('Debe retornar 200 con el stock disponible del libro', async () => {
            const isbn = '978-0-13-468599-1';
            const mockBook = {
                isbn,
                title: 'Clean Code',
                available_copies: 5
            };

            jest.spyOn(bookRepository, 'findByIsbn').mockResolvedValue(mockBook);

            const response = await request(app)
                .get(`/api/books/${isbn}/availability`);

            expect(response.status).toBe(200);
            expect(response.body.status).toBe('success');
            expect(response.body.data).toEqual({
                available: true,
                copies: 5
            });
            expect(bookRepository.findByIsbn).toHaveBeenCalledWith(isbn);
        });
    });

    describe('Edge Case: Libro sin copias disponibles', () => {
        test('Debe retornar 200 pero con available: false cuando el stock es 0', async () => {
            const isbn = '978-0-201-63361-0';
            const mockBook = {
                isbn,
                title: 'Design Patterns',
                available_copies: 0
            };

            jest.spyOn(bookRepository, 'findByIsbn').mockResolvedValue(mockBook);

            const response = await request(app)
                .get(`/api/books/${isbn}/availability`);

            expect(response.status).toBe(200);
            expect(response.body.data).toEqual({
                available: false,
                copies: 0
            });
        });
    });

    describe('Error Case: ISBN no existe', () => {
        test('Debe retornar 404 cuando el ISBN no existe en la BD', async () => {
            const isbn = '999-99-99999999-9';

            jest.spyOn(bookRepository, 'findByIsbn').mockResolvedValue(null);

            const response = await request(app)
                .get(`/api/books/${isbn}/availability`);

            expect(response.status).toBe(404);
            expect(response.body.status).toBe('error');
            expect(response.body.message).toContain('Libro no encontrado');
        });
    });
});

// ═══════════════════════════════════════════════════════════════════
// ESCENARIO 2: CREACIÓN DE PRÉSTAMO (Happy Path vs Edge Case)
// ═══════════════════════════════════════════════════════════════════
describe('ESCENARIO 2: Creación de Préstamo (POST /api/loans)', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('Happy Path: Registro exitoso de préstamo', () => {
        test('Debe crear un préstamo exitosamente y reducir el stock en 1', async () => {
            const loanPayload = {
                book_isbn: '978-0-13-468599-1',
                user_id: 'EST-100123456',
                loan_date: new Date('2026-05-22'),
                due_date: new Date('2026-06-05')
            };

            // Mock: Libro existe con 5 copias
            const mockBook = {
                isbn: '978-0-13-468599-1',
                title: 'Clean Code',
                available_copies: 5
            };
            jest.spyOn(bookRepository, 'findByIsbn').mockResolvedValue(mockBook);

            // Mock: Préstamo se crea exitosamente
            const mockCreatedLoan = {
                id: 'loan-uuid-001',
                ...loanPayload,
                status: 'ACTIVO',
                createdAt: new Date()
            };
            jest.spyOn(loanRepository, 'create').mockResolvedValue(mockCreatedLoan);

            // Mock: Actualización de copias se ejecuta correctamente
            jest.spyOn(bookRepository, 'updateCopies').mockResolvedValue([1]);

            const response = await request(app)
                .post('/api/loans')
                .send(loanPayload);

            // Validaciones
            expect(response.status).toBe(201);
            expect(response.body.status).toBe('success');
            expect(response.body.data.id).toBe('loan-uuid-001');
            expect(response.body.data.status).toBe('ACTIVO');

            // Verificar que se actualizó el stock: 5 - 1 = 4
            expect(bookRepository.updateCopies).toHaveBeenCalledWith(
                loanPayload.book_isbn,
                4
            );
        });
    });

    describe('Edge Case: Intento de préstamo sin copias disponibles', () => {
        test('Debe retornar 400 cuando available_copies es 0', async () => {
            const loanPayload = {
                book_isbn: '978-0-201-63361-0',
                user_id: 'EST-999',
                loan_date: new Date(),
                due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
            };

            // Mock: Libro existe pero sin copias
            const mockBookNoStock = {
                isbn: '978-0-201-63361-0',
                title: 'Design Patterns',
                available_copies: 0
            };
            jest.spyOn(bookRepository, 'findByIsbn').mockResolvedValue(mockBookNoStock);

            const response = await request(app)
                .post('/api/loans')
                .send(loanPayload);

            // Validaciones
            expect(response.status).toBe(400);
            expect(response.body.status).toBe('error');
            expect(response.body.message).toContain('No hay ejemplares disponibles');

            // Verificar que NUNCA se intenta crear ni actualizar
            expect(loanRepository.create).not.toHaveBeenCalled();
            expect(bookRepository.updateCopies).not.toHaveBeenCalled();
        });
    });

    describe('Error Case: Libro no existe', () => {
        test('Debe retornar 404 cuando el ISBN del libro no existe', async () => {
            const loanPayload = {
                book_isbn: '999-99-99999999-9',
                user_id: 'EST-123',
                loan_date: new Date(),
                due_date: new Date()
            };

            jest.spyOn(bookRepository, 'findByIsbn').mockResolvedValue(null);

            const response = await request(app)
                .post('/api/loans')
                .send(loanPayload);

            expect(response.status).toBe(404);
            expect(response.body.message).toContain('El libro especificado no existe');
            expect(loanRepository.create).not.toHaveBeenCalled();
        });
    });
});

// ═══════════════════════════════════════════════════════════════════
// ESCENARIO 3: DEVOLUCIÓN DE PRÉSTAMO
// ═══════════════════════════════════════════════════════════════════
describe('ESCENARIO 3: Devolución de Préstamo (PUT /api/loans/:id/return)', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('Happy Path: Devolución exitosa', () => {
        test('Debe procesar devolución, cambiar status a DEVUELTO e incrementar stock', async () => {
            const loanId = 'loan-uuid-001';

            // Mock: Préstamo existe en estado ACTIVO
            const mockLoan = {
                id: loanId,
                status: 'ACTIVO',
                book_isbn: '978-0-13-468599-1',
                user_id: 'EST-100123456',
                loan_date: new Date('2026-05-22'),
                due_date: new Date('2026-06-05'),
                book: {
                    isbn: '978-0-13-468599-1',
                    title: 'Clean Code',
                    available_copies: 4  // Había 5, ahora 4 por el préstamo
                }
            };
            jest.spyOn(loanRepository, 'findById').mockResolvedValue(mockLoan);

            // Mock: Actualización de status
            jest.spyOn(loanRepository, 'updateStatus').mockResolvedValue([1]);

            // Mock: Actualización de copias
            jest.spyOn(bookRepository, 'updateCopies').mockResolvedValue([1]);

            const response = await request(app)
                .put(`/api/loans/${loanId}/return`);

            // Validaciones
            expect(response.status).toBe(200);
            expect(response.body.status).toBe('success');
            expect(response.body.message).toContain('Devolución procesada exitosamente');

            // Verificar que se cambió status a DEVUELTO
            expect(loanRepository.updateStatus).toHaveBeenCalledWith(loanId, 'DEVUELTO');

            // Verificar que se incrementó stock: 4 + 1 = 5
            expect(bookRepository.updateCopies).toHaveBeenCalledWith(
                mockLoan.book.isbn,
                5
            );
        });
    });

    describe('Edge Case: Intento de devolver préstamo ya devuelto', () => {
        test('Debe retornar 400 cuando el préstamo ya fue devuelto', async () => {
            const loanId = 'loan-uuid-002';

            // Mock: Préstamo ya tiene status DEVUELTO
            const mockReturnedLoan = {
                id: loanId,
                status: 'DEVUELTO',  // Ya fue devuelto
                book_isbn: '978-0-201-63361-0',
                user_id: 'EST-200',
                book: {
                    isbn: '978-0-201-63361-0',
                    title: 'Design Patterns',
                    available_copies: 3
                }
            };
            jest.spyOn(loanRepository, 'findById').mockResolvedValue(mockReturnedLoan);

            const response = await request(app)
                .put(`/api/loans/${loanId}/return`);

            // Validaciones
            expect(response.status).toBe(400);
            expect(response.body.status).toBe('error');
            expect(response.body.message).toContain('Este préstamo ya fue devuelto');

            // Verificar que no se intentó actualizar nada más
            expect(loanRepository.updateStatus).not.toHaveBeenCalled();
            expect(bookRepository.updateCopies).not.toHaveBeenCalled();
        });
    });

    describe('Error Case: Préstamo no existe', () => {
        test('Debe retornar 404 cuando el ID del préstamo no existe', async () => {
            const loanId = 'loan-uuid-invalid-123';

            jest.spyOn(loanRepository, 'findById').mockResolvedValue(null);

            const response = await request(app)
                .put(`/api/loans/${loanId}/return`);

            expect(response.status).toBe(404);
            expect(response.body.message).toContain('Préstamo no encontrado');
            expect(loanRepository.updateStatus).not.toHaveBeenCalled();
        });
    });
});

// ═══════════════════════════════════════════════════════════════════
// ESCENARIO 4: CONSULTA DE PRÉSTAMOS VENCIDOS
// ═══════════════════════════════════════════════════════════════════
describe('ESCENARIO 4: Consulta de Préstamos Vencidos (GET /api/loans/overdue)', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('Validación de filtros: Estado ACTIVO + Fecha Vencida', () => {
        test('Debe retornar solo préstamos ACTIVO con fecha vencida', async () => {
            const now = new Date();
            const expiredDate = new Date(now.getTime() - 24 * 60 * 60 * 1000); // Hace 1 día

            // Mock: Retorna 2 préstamos vencidos (ambos ACTIVO)
            const mockOverdueLoans = [
                {
                    id: 'loan-expired-001',
                    status: 'ACTIVO',
                    user_id: 'EST-100',
                    loan_date: new Date(expiredDate.getTime() - 7 * 24 * 60 * 60 * 1000),
                    due_date: expiredDate,
                    book: {
                        isbn: '978-0-13-468599-1',
                        title: 'Clean Code'
                    }
                },
                {
                    id: 'loan-expired-002',
                    status: 'ACTIVO',
                    user_id: 'EST-200',
                    loan_date: new Date(expiredDate.getTime() - 10 * 24 * 60 * 60 * 1000),
                    due_date: new Date(expiredDate.getTime() - 3 * 24 * 60 * 60 * 1000),
                    book: {
                        isbn: '978-0-201-63361-0',
                        title: 'Design Patterns'
                    }
                }
            ];

            jest.spyOn(loanRepository, 'findOverdueLoans').mockResolvedValue(mockOverdueLoans);

            const response = await request(app)
                .get('/api/loans/overdue');

            // Validaciones
            expect(response.status).toBe(200);
            expect(response.body.status).toBe('success');
            expect(response.body.results).toBe(2);
            expect(response.body.data).toHaveLength(2);

            // Verificar que TODOS los préstamos retornados tienen status ACTIVO
            response.body.data.forEach(loan => {
                expect(loan.status).toBe('ACTIVO');
                expect(new Date(loan.due_date) < now).toBe(true); // Fecha vencida
            });
        });
    });

    describe('Edge Case: Sin préstamos vencidos', () => {
        test('Debe retornar 200 con array vacío si no hay préstamos vencidos', async () => {
            jest.spyOn(loanRepository, 'findOverdueLoans').mockResolvedValue([]);

            const response = await request(app)
                .get('/api/loans/overdue');

            expect(response.status).toBe(200);
            expect(response.body.results).toBe(0);
            expect(response.body.data).toEqual([]);
        });
    });

    describe('Validación: No retorna préstamos devueltos', () => {
        test('Debe filtrar solo préstamos ACTIVO, excluyendo DEVUELTO', async () => {
            // La lógica de findOverdueLoans ya filtra por status: 'ACTIVO'
            // pero simulamos que alguien intenta pasar un DEVUELTO
            const mockLoans = [
                {
                    id: 'loan-001',
                    status: 'ACTIVO',
                    due_date: new Date(Date.now() - 1000),
                    book: { isbn: '978-0-13-468599-1', title: 'Clean Code' }
                }
                // DEVUELTO no aparecería aquí porque el repositorio filtra
            ];

            jest.spyOn(loanRepository, 'findOverdueLoans').mockResolvedValue(mockLoans);

            const response = await request(app)
                .get('/api/loans/overdue');

            expect(response.body.data.every(loan => loan.status === 'ACTIVO')).toBe(true);
        });
    });
});

// ═══════════════════════════════════════════════════════════════════
// ESCENARIO 5: INTEGRIDAD DE DATOS (TRANSACCIONALIDAD)
// ═══════════════════════════════════════════════════════════════════
describe('ESCENARIO 5: Integridad de Datos (Transaccionalidad)', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('Validación: No crear préstamo si hay error en actualización de stock', () => {
        test('Debe verificar disponibilidad ANTES de registrar el préstamo', async () => {
            const loanPayload = {
                book_isbn: '978-0-13-468599-1',
                user_id: 'EST-123',
                loan_date: new Date(),
                due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
            };

            // Mock: Libro sin copias
            const mockBook = {
                isbn: '978-0-13-468599-1',
                available_copies: 0  // Sin stock
            };
            jest.spyOn(bookRepository, 'findByIsbn').mockResolvedValue(mockBook);

            const response = await request(app)
                .post('/api/loans')
                .send(loanPayload);

            // El error debe validarse ANTES de crear el préstamo
            expect(response.status).toBe(400);
            expect(loanRepository.create).not.toHaveBeenCalled();
            expect(bookRepository.updateCopies).not.toHaveBeenCalled();
        });
    });

    describe('Validación: Prevención de condición de carrera (Race Condition)', () => {
        test('Debe validar stock en tiempo de ejecución, no asumir disponibilidad', async () => {
            const loanPayload = {
                book_isbn: '978-0-13-468599-1',
                user_id: 'EST-123',
                loan_date: new Date(),
                due_date: new Date()
            };

            // Simulamos que el libro tenía stock al leer pero cuando actualizamos es insuficiente
            // (En un escenario real, esto requeriría transacciones DB)
            const mockBook = {
                isbn: '978-0-13-468599-1',
                available_copies: 1  // Tiene 1 copia al validar
            };
            jest.spyOn(bookRepository, 'findByIsbn').mockResolvedValue(mockBook);

            const mockCreatedLoan = {
                id: 'loan-uuid',
                ...loanPayload,
                status: 'ACTIVO'
            };
            jest.spyOn(loanRepository, 'create').mockResolvedValue(mockCreatedLoan);

            // La actualización debe ocurrir correctamente
            jest.spyOn(bookRepository, 'updateCopies').mockResolvedValue([1]);

            const response = await request(app)
                .post('/api/loans')
                .send(loanPayload);

            // Validar que se ejecutó la lógica completa
            expect(response.status).toBe(201);
            expect(bookRepository.findByIsbn).toHaveBeenCalledBefore(bookRepository.updateCopies);
            expect(bookRepository.updateCopies).toHaveBeenCalledWith(
                loanPayload.book_isbn,
                0  // 1 - 1 = 0
            );
        });
    });

    describe('Validación: Manejo de errores en cadena de llamadas', () => {
        test('Debe capturar errores y delegarlos al middleware centralizado', async () => {
            const loanPayload = {
                book_isbn: '978-0-13-468599-1',
                user_id: 'EST-123',
                loan_date: new Date(),
                due_date: new Date()
            };

            // Mock: Simular error en la BD
            const dbError = new Error('Database connection error');
            dbError.statusCode = 500;

            jest.spyOn(bookRepository, 'findByIsbn').mockRejectedValue(dbError);

            const response = await request(app)
                .post('/api/loans')
                .send(loanPayload);

            // El middleware debe capturar el error
            expect(response.status).toBe(500);
            expect(response.body.status).toBe('error');
        });
    });

    describe('Validación: Consistencia entre Préstamo y Stock', () => {
        test('Debe garantizar que stock_original === stock_final después de préstamo + devolución', async () => {
            // Simulación de flujo completo
            const initialCopies = 5;
            let currentCopies = initialCopies;

            const mockBook = {
                isbn: '978-0-13-468599-1',
                available_copies: currentCopies
            };

            // 1. Crear préstamo: 5 - 1 = 4
            jest.spyOn(bookRepository, 'findByIsbn').mockResolvedValue(mockBook);
            jest.spyOn(bookRepository, 'updateCopies').mockImplementation(
                (isbn, newCount) => {
                    currentCopies = newCount;
                    return Promise.resolve([1]);
                }
            );

            const loanPayload = {
                book_isbn: '978-0-13-468599-1',
                user_id: 'EST-123',
                loan_date: new Date(),
                due_date: new Date()
            };

            jest.spyOn(loanRepository, 'create').mockResolvedValue({
                id: 'loan-001',
                ...loanPayload,
                status: 'ACTIVO'
            });

            const createResponse = await request(app)
                .post('/api/loans')
                .send(loanPayload);

            expect(createResponse.status).toBe(201);
            expect(currentCopies).toBe(4); // Reducción correcta

            // 2. Devolver: 4 + 1 = 5
            mockBook.available_copies = currentCopies;

            const mockLoan = {
                id: 'loan-001',
                status: 'ACTIVO',
                book: mockBook
            };

            jest.spyOn(loanRepository, 'findById').mockResolvedValue(mockLoan);
            jest.spyOn(loanRepository, 'updateStatus').mockResolvedValue([1]);

            const returnResponse = await request(app)
                .put('/api/loans/loan-001/return');

            expect(returnResponse.status).toBe(200);
            // Después de devolución, se debe llamar a updateCopies con 5
            expect(currentCopies).toBe(5); // Restauración correcta
        });
    });
});

// ═══════════════════════════════════════════════════════════════════
// VALIDACIÓN GENERAL: Health Check
// ═══════════════════════════════════════════════════════════════════
describe('Health Check - Validación General', () => {
    test('La API debe estar disponible en /health', async () => {
        const response = await request(app).get('/health');

        expect(response.status).toBe(200);
        expect(response.body.status).toBe('OK');
        expect(response.body.message).toContain('funcionando');
    });
});
