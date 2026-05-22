#!/usr/bin/env node

/\*\*

- GUÍA RÁPIDA DE EJECUCIÓN DE TESTS Y AUDITORÍA QA
- ════════════════════════════════════════════════════════════
-
- Esta guía proporciona instrucciones paso a paso para ejecutar
- la suite completa de auditoría QA del proyecto.
  \*/

console.log(`
╔════════════════════════════════════════════════════════════════╗
║ ║
║ 🔍 AUDITORÍA QA - API REST BIBLIOTECA PUJ ║
║ ║
║ Guía de Ejecución de Tests ║
║ ║
╚════════════════════════════════════════════════════════════════╝

REQUISITOS PREVIOS
═════════════════════════════════════════════════════════════════

✓ Node.js 18+ instalado
✓ PostgreSQL ejecutándose (o usar .env con DATABASE_URL)
✓ Archivo .env configurado correctamente
✓ Dependencias instaladas: npm install

PASO 1: VERIFICAR AMBIENTE
═════════════════════════════════════════════════════════════════

→ Verifica que Node está disponible:
$ node --version
Resultado esperado: v18.x.x o mayor

→ Verifica que Jest está instalado:
$ npx jest --version
Resultado esperado: 29.x.x o mayor

PASO 2: EJECUTAR TESTS INDIVIDUALES
═════════════════════════════════════════════════════════════════

Opción A: Todos los tests
$ npm test

Resultado esperado:
✅ PASS src/tests/system.test.js
✅ PASS src/tests/loan.test.js
✅ Tests: XX passed, XX total

─────────────────────────────────────────────────────────────────

Opción B: Solo auditoría QA (system.test.js)
$ npx jest src/tests/system.test.js

Cubre:
✓ ESCENARIO 1: Consulta de Disponibilidad (3 tests)
✓ ESCENARIO 2: Creación de Préstamo (3 tests)
✓ ESCENARIO 3: Devolución de Préstamo (3 tests)
✓ ESCENARIO 4: Consulta de Vencimientos (3 tests)
✓ ESCENARIO 5: Integridad de Datos (5 tests)

─────────────────────────────────────────────────────────────────

Opción C: Ejecutar escenario específico
$ npx jest -t "ESCENARIO 1"
$ npx jest -t "ESCENARIO 2"
$ npx jest -t "ESCENARIO 3"
$ npx jest -t "ESCENARIO 4"
$ npx jest -t "ESCENARIO 5"

─────────────────────────────────────────────────────────────────

Opción D: Con reporte de cobertura
$ npx jest src/tests/system.test.js --coverage

Genera reporte en:
→ coverage/

Abre coverage/lcov-report/index.html en el navegador

PASO 3: VALIDAR MANUALMENTE CON POSTMAN
═════════════════════════════════════════════════════════════════

Importar colección:

1. Abre Postman
2. File → Import
3. Selecciona: Biblioteca_PUJ.postman_collection.json
4. Se importarán 4 requests listos para usar

Disponibles en Postman:
✓ Consultar Disponibilidad
✓ Registrar Préstamo
✓ Registrar Devolución
✓ Listar Préstamos Vencidos

PASO 4: VERIFICAR LOGS DE EJECUCIÓN
═════════════════════════════════════════════════════════════════

Cuando ejecutes npm test, verás output como:

PASS src/tests/system.test.js (23.456 s)
ESCENARIO 1: Consulta de Disponibilidad (GET /api/books/:isbn/availability)
Happy Path: Libro existe y tiene copias disponibles
✓ Debe retornar 200 con el stock disponible del libro (15 ms)
Edge Case: Libro sin copias disponibles
✓ Debe retornar 200 pero con available: false cuando el stock es 0 (12 ms)
Error Case: ISBN no existe
✓ Debe retornar 404 cuando el ISBN no existe en la BD (10 ms)

    ESCENARIO 2: Creación de Préstamo (POST /api/loans)
      Happy Path: Registro exitoso de préstamo
        ✓ Debe crear un préstamo exitosamente... (18 ms)

      [... más tests ...]

Tests: 30 passed, 30 total
Snapshots: 0 total
Time: 23.456 s

PASO 5: INTERPRETAR RESULTADOS
═════════════════════════════════════════════════════════════════

✅ TODO PASADO
→ La API cumple al 100% con todos los requerimientos
→ Listo para producción

⚠️ ALGUNOS FALLOS
→ Revisa el mensaje de error en la consola
→ Abre system.test.js y busca el test específico
→ Consulta QA_AUDIT_REPORT.md para más detalles

❌ MUCHOS FALLOS
→ Verifica que el .env está configurado correctamente
→ Verifica que la BD está corriendo
→ Ejecuta npm install nuevamente

PASO 6: EJECUTAR API Y PROBAR ENDPOINTS
═════════════════════════════════════════════════════════════════

En una terminal diferente:

$ npm run dev

Verás:
✅ Conexión a PostgreSQL establecida exitosamente.
✅ Modelos sincronizados con la base de datos.
📚 Iniciando precarga de libros de prueba...
--- Base de datos precargada con datos de prueba ---
🚀 Servidor activo en: http://localhost:3000

Luego en Postman o curl:

→ Probar GET /api/books/:isbn/availability
→ Probar POST /api/loans con payload
→ Probar PUT /api/loans/:id/return
→ Probar GET /api/loans/overdue

DOCUMENTACIÓN ADICIONAL
═════════════════════════════════════════════════════════════════

📄 QA_AUDIT_REPORT.md
└─ Informe completo de auditoría
· 5 escenarios cubiertos
· 30+ casos de prueba
· Matriz de cobertura
· Hallazgos y recomendaciones

📄 README.md
└─ Documentación general del proyecto
· Stack tecnológico
· Arquitectura
· Endpoints
· Instrucciones de instalación

📄 src/tests/system.test.js
└─ Suite completa de tests automatizados
· Código fuente de todas las pruebas
· Mocks de repositorios
· Validaciones detalladas

📄 Biblioteca_PUJ.postman_collection.json
└─ Colección de Postman
· 4 endpoints pre-configurados
· Importable en Postman Desktop

CASOS DE ÉXITO ESPERADOS
═════════════════════════════════════════════════════════════════

Caso 1: Consulta de Disponibilidad
GET /api/books/978-0-13-468599-1/availability
↓
200 OK | { "available": true, "copies": 5 }

Caso 2: Crear Préstamo
POST /api/loans | body: { book_isbn, user_id, ... }
↓
201 Created | { "id": "uuid", "status": "ACTIVO" }
EFECTO: Stock reducido 5 → 4

Caso 3: Devolver Préstamo
PUT /api/loans/uuid/return
↓
200 OK | { "message": "Devolución procesada..." }
EFECTO: Status ACTIVO → DEVUELTO, Stock aumentado 4 → 5

Caso 4: Listar Vencidos
GET /api/loans/overdue
↓
200 OK | { "results": 2, "data": [...] }

TROUBLESHOOTING
═════════════════════════════════════════════════════════════════

❌ Error: "Cannot find module 'sequelize'"
→ Ejecuta: npm install

❌ Error: "connect ECONNREFUSED 127.0.0.1:5432"
→ PostgreSQL no está corriendo
→ Inicia PostgreSQL o configura DATABASE_URL en .env

❌ Error: "JEST command not found"
→ Ejecuta: npm install (o npx jest sin instalar global)

❌ Tests fallan con "Mock not working"
→ Verifica que jest.clearAllMocks() está en afterEach()
→ Revisa que los mocks están bien configurados

CONTACTO
═════════════════════════════════════════════════════════════════

Para más información sobre esta auditoría:
→ Consulta QA_AUDIT_REPORT.md
→ Revisa src/tests/system.test.js
→ Abre issues en el repositorio

Auditor: QA Automation Engineer Senior
Fecha: 22 de mayo de 2026

════════════════════════════════════════════════════════════════
✅ LISTO PARA AUDITAR
════════════════════════════════════════════════════════════════
`);
