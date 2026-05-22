# 🚀 API REST - Sistema de Gestión de Préstamos (Biblioteca)

![Node.js](https://img.shields.io/badge/Node.js-18+-green)
![Express.js](https://img.shields.io/badge/Express.js-Minimalist-blue)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Relational-blue)
![Sequelize](https://img.shields.io/badge/Sequelize-ORM-purple)
![Jest](https://img.shields.io/badge/Jest-Testing-red)

Este proyecto constituye una solución robusta y escalable para la gestión de préstamos en una biblioteca, desarrollada bajo estándares de alta disponibilidad, separación de responsabilidades y testing automatizado.

---

## 🛠️ Stack Tecnológico Utilizado

La selección de tecnologías responde a la necesidad de escalabilidad, mantenibilidad y rendimiento óptimo en entornos transaccionales.

| Tecnología            | Justificación Técnica                             |
| --------------------- | ------------------------------------------------- |
| **Node.js + Express** | Entorno asíncrono ideal para APIs REST eficientes |
| **PostgreSQL**        | Motor relacional robusto que garantiza integridad |
| **Sequelize**         | ORM que abstrae consultas complejas               |
| **Jest + Supertest**  | Frameworks líderes para testing de integración    |

---

## 📐 Arquitectura: Patrón Controller - Service - Repository

Se implementa una **arquitectura en capas** para asegurar el desacoplamiento y facilitar el mantenimiento a largo plazo:

1. **Rutas (`/routes`)**: Definen los endpoints y delegan la ejecución a los controladores.
2. **Controladores (`/controllers`)**: Manejan la entrada/salida HTTP y la comunicación con el cliente.
3. **Servicios (`/services`)**: Contienen la lógica de negocio pura y las reglas del sistema.
4. **Repositorios (`/repositories`)**: Abstraen el acceso y manipulación de datos en PostgreSQL.

---

## 🔌 Documentación de la API (Endpoints)

| Método | Endpoint                        | Descripción                                       |
| ------ | ------------------------------- | ------------------------------------------------- |
| `GET`  | `/api/books/:isbn/availability` | Devuelve la disponibilidad actual de un libro     |
| `POST` | `/api/loans`                    | Crea un préstamo (valida disponibilidad de stock) |
| `PUT`  | `/api/loans/:id/return`         | Procesa la devolución y libera el ejemplar        |
| `GET`  | `/api/loans/overdue`            | Lista los préstamos activos con fecha vencida     |

---

## ⚙️ Instrucciones de Instalación y Ejecución

### 1. Clonar y Preparar el Entorno

```bash
git clone <URL_DEL_REPOSITORIO>
cd prueba-tecnica-puj
npm install
```

### 2. Configuración de Variables de Entorno

Cree un archivo `.env` en la raíz del proyecto. Use `.env.example` como referencia:

```bash
cp .env.example .env
```

Luego, edite el archivo `.env` con tus credenciales locales:

**Para Desarrollo Local (PostgreSQL en tu máquina):**

```env
PORT=3000
NODE_ENV=development
DB_NAME=biblioteca_db
DB_USER=postgres
DB_PASSWORD=admin
DB_HOST=127.0.0.1
DB_PORT=5432
```

**Para Producción (Render o similar):**

```env
PORT=3000
NODE_ENV=production
DATABASE_URL=postgresql://usuario:password@host:puerto/nombre_bd
```

⚠️ **NOTA DE SEGURIDAD**: Nunca subas tus archivos `.env` reales a repositorios públicos. El archivo `.env` está incluido en `.gitignore` para tu protección.

### 3. Ejecución del Sistema

```bash
# Modo Desarrollo (con recarga automática)
npm run dev

# Modo Producción
npm start
```

---

## 🚀 Opciones de Ejecución

Se ofrecen dos vías de acceso al sistema según el contexto de evaluación:

### Opción A: Prueba Rápida (Producción en Render)

La API está desplegada en un entorno de producción con datos ya precargados. Simplemente consulta los endpoints disponibles sin necesidad de configuración local:

```
URL Base: https://api-biblioteca.render.com
```

**Ventajas:**

- ✅ Sin instalación local ni configuración de BD
- ✅ Evaluación inmediata de funcionalidades
- ✅ Datos persistentes y estables

### Opción B: Auditoría Local

Al clonar el repositorio, instalar dependencias y ejecutar `npm run dev`, el sistema se precarga automáticamente con datos de prueba. Esta opción es ideal para auditorías de código, inspección de arquitectura y debugging:

```bash
# 1. Clonar el repositorio
git clone <URL_DEL_REPOSITORIO>
cd prueba-tecnica-puj

# 2. Instalar dependencias
npm install

# 3. Configurar variables de entorno
cp .env.example .env
# Edita .env con tus credenciales de BD local

# 4. Ejecutar en desarrollo
npm run dev
```

**Ventajas:**

- ✅ Auditoría completa del código fuente
- ✅ Inspección de la arquitectura Controller-Service-Repository
- ✅ Precarga automática de datos de prueba (sin intervención manual)
- ✅ Debugging local con herramientas nativas
- ✅ Control total del ciclo de desarrollo

**Flujo automático:**

1. `npm run dev` ejecuta la sincronización de BD
2. Script de seeding valida si la tabla `books` está vacía
3. Si está vacía, carga 3 libros de prueba automáticamente
4. API lista para recibir solicitudes sin pasos adicionales

**Nota: Nunca subas tus archivos .env reales a repositorios públicos.**

---

### 4. Pruebas Automatizadas

```bash
# Ejecutar la suite completa de tests
npm test

# Ejecutar solo los tests de system (auditoría QA completa)
npx jest src/tests/system.test.js

# Ejecutar con cobertura detallada
npx jest --coverage src/tests/system.test.js

# Ejecutar un escenario específico
npx jest -t "ESCENARIO 1"
```

**📋 Auditoría QA Disponible:** Consulta [QA_AUDIT_REPORT.md](./QA_AUDIT_REPORT.md) para ver la auditoría completa que cubre:

- ✅ 5 escenarios principales
- ✅ 30+ casos de prueba automatizados
- ✅ Validación de integridad transaccional
- ✅ Checklist de conformidad 100%

---

## 🤖 Uso Responsable de Inteligencia Artificial

Para el desarrollo de este sistema se integró **Gemini Code Assist** dentro del entorno **VS Code**. Este enfoque de "AI-Augmented Development" permitió:

- **Aceleración Estructural:** Generación rápida de plantillas de modelos y controladores siguiendo el estándar CommonJS.
- **Diseño de Pruebas:** Scaffolding de casos de prueba para Supertest, cubriendo escenarios de éxito y borde (edge cases).
- **Auditoría de Calidad:** Cada respuesta generada por la IA fue rigurosamente auditada y validada por un desarrollador **Semi-Senior**, asegurando que el código no solo fuera funcional, sino que respetara los principios de seguridad (SSL en DB) y manejo de excepciones centralizado.

---

## ⚖️ Consideraciones de Diseño y Escalabilidad

El desarrollo de este sistema se realizó bajo un esquema de entrega acelerada (Time-Boxed de 2 horas), lo que implicó priorizar la robustez de la lógica de negocio y la integridad de los datos sobre funcionalidades accesorias.

- **Priorización de Funcionalidad:** Se enfocó el esfuerzo en garantizar el ciclo completo de préstamo y devolución con validaciones de stock transaccionales, cumpliendo con los requerimientos funcionales críticos.
- **Arquitectura Orientada a Mantenibilidad:** La estructura en capas (Controller-Service-Repository) permite que el sistema sea fácilmente escalable. La adición de futuras funcionalidades como Autenticación (JWT), Migraciones de Base de Datos o Documentación (Swagger) puede realizarse de forma modular sin necesidad de refactorizar la lógica central.
- **Despliegue y Portabilidad:** Se ha priorizado una configuración de entorno sencilla para permitir tanto la evaluación inmediata en producción como la auditoría local del código fuente.
