# Plataforma Judicial Administrativa

Suite full‑stack para el control de asistencia del Poder Judicial del Estado de Colima. Combina un backend en Node.js/Express + Sequelize, un frontend React/Mantine y una infraestructura lista para producción con Docker, MySQL, Redis y BullMQ para trabajos en segundo plano.

## Stack principal

| Capa      | Tecnologías clave |
|-----------|-------------------|
| Backend   | Node 20 · TypeScript · Express 4 · Sequelize 6 · BullMQ · Puppeteer · Pino |
| Frontend  | React 19 · Vite · TypeScript · Mantine UI · Zustand · Axios |
| Infra     | Docker Compose · MySQL 8 · Redis 7 · Nodemon/ts-node para desarrollo |

## Funcionalidades destacadas

- Gestión completa de empleados, horarios, periodos y asistencias computadas.
- Importación asíncrona de marcajes (CSV/DAT) mediante colas BullMQ y workers dedicados.
- Motor de incidencias con reglas configurables y seguimiento de estados.
- Generación de reportes PDF/Excel con Puppeteer (Chromium preinstalado en la imagen).
- Auditoría y RBAC con roles `admin`, `rh`, `ti`, `jefaturas-adscripciones` y usuarios sembrados.
- API segura con JWT (access + refresh) y protección CSRF vía cookies HttpOnly para el refresh.

## Estructura del repositorio

```
.
├── backend/   # API, jobs, migraciones, seeders y tests
├── PJA/       # Frontend Vite + React + Mantine
├── docker-compose.yml
└── .gitignore
```

## Requisitos previos

- **Docker Desktop 4.30+** (incluye Docker Compose v2) → recomendado para levantar todo con un solo comando.
- **Node.js 20+ y npm 10+** (solo si deseas correr backend/frontend sin contenedores).

## Puesta en marcha rápida (Docker Compose)

1. **Clonar y entrar al proyecto**
   ```powershell
   git clone <tu-repo>.git
   cd Plataforma_Judicial_Administrativa
   ```
2. **Variables de entorno**
   - Backend: duplica `backend/.env.example` → `backend/.env` (puedes dejar los valores locales por defecto).
   - Frontend: duplica `PJA/.env.example` → `PJA/.env` y ajusta `VITE_API_URL` si tu backend no corre en `http://localhost:4000/api`.
3. **Levantar servicios**
   ```powershell
   docker compose up -d --build
   ```
   Esto compila las imágenes, ejecuta migraciones (`npm run migrate:dist`) y seeders (`npm run seed:dist`) antes de iniciar el API.
4. **Accesos**
   - Backend: `http://localhost:4000/api/health`
   - Frontend: `http://localhost:5173`

### Credenciales de prueba (seeders)

| Rol | Usuario | Contraseña |
|-----|---------|------------|
| Administrador | `admin@empresa.com` | `Admin123*` |
| RH | `rh@empresa.com` | `rrhh12345` |
| Técnico (TI) | `ti@empresa.com` | `Ti12345*` |
| Consultoría / Jefaturas | `consultoria@empresa.com` | `Consultoria123*` |

_Nota:_ Las contraseñas se encuentran en los seeders `20250101010000-base-seed` y `20250115020000-add-new-roles`. Modifícalas si el proyecto será público.

## Variables de entorno esenciales

### Backend (`backend/.env`)

| Variable | Descripción |
|----------|-------------|
| `PORT` | Puerto HTTP del API (default 4000).
| `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME` | Conexión MySQL.
| `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET` | Llaves para los tokens.
| `REDIS_URL`, `BULLMQ_PREFIX` | Cola de trabajos.
| `FILE_UPLOAD_DIR` | Carpeta donde se guardan los archivos importados.

### Frontend (`PJA/.env`)

| Variable | Descripción |
|----------|-------------|
| `VITE_API_URL` | URL base del backend (ej. `http://localhost:4000/api`).
| `VITE_SESSION_TIMEOUT` | (Opcional) Expiración de sesión en minutos.

## Flujo de desarrollo sin Docker (opcional)

1. **Backend**
   ```powershell
   cd backend
   npm install
   cp .env.example .env
   npm run migrate
   npm run seed
   npm run dev        # nodemon + ts-node
   npm run queue:worker   # en otra terminal para BullMQ
   ```
2. **Frontend**
   ```powershell
   cd PJA
   npm install
   cp .env.example .env
   npm run dev
   ```

## Scripts útiles

| Ubicación | Comando | Descripción |
|-----------|---------|-------------|
| backend   | `npm run dev` | API en modo watch (Nodemon + ts-node).
| backend   | `npm run build` / `npm run start` | Compilación y servidor productivo.
| backend   | `npm run migrate` / `npm run seed` | Ejecutar migraciones y seeders.
| backend   | `npm run queue:worker` | Inicia el worker BullMQ.
| backend   | `npm run test` | Ejecuta Jest (unit/integration).
| frontend  | `npm run dev` | Vite + React en caliente.
| frontend  | `npm run build` / `npm run preview` | Build y verificación productiva.

## Migraciones y datos de prueba

- Las migraciones viven en `backend/src/database/migrations`. Para generar nuevas usa `npx sequelize-cli migration:generate --name describe-tu-cambio`.
- Los seeders residen en `backend/src/database/seeders`. Ejemplos incluidos:
  - `20250101010000-base-seed`: roles básicos, departamento, empleado demo y usuarios `admin`/`rh`.
  - `20250115020000-add-new-roles`: crea los roles `ti` y `jefaturas-adscripciones` + usuarios asociados.
- En Docker se ejecutan automáticamente; en desarrollo manual usa `npm run seed`.
- Si necesitas reiniciar todo, elimina los volúmenes: `docker compose down -v` y vuelve a subir.

## Pruebas y calidad

- Backend: ejecuta `npm run test` (Jest) y añade pruebas en `backend/src/tests`.
- Linter/format: utiliza los linters configurados en cada paquete (`eslint`, `prettier` en el frontend, `tsc` como type-checker en el backend).
- Asegura que las migraciones y seeders sean idempotentes; evita datos sensibles en los seeders cuando publiques el repo.

## Próximos pasos sugeridos

1. **Configurar CI/CD** (GitHub Actions o Azure DevOps) para construir imágenes y correr tests automáticamente.
2. **Monitoreo y logs**: exportar los logs Pino a un stack ELK/Datadog y habilitar alerts sobre BullMQ.
3. **Hardening**: rotar secretos, activar HTTPS/SSL en el ingress y habilitar backups automáticos de MySQL.

¡Listo! Con este README cualquier persona puede clonar el proyecto, levantarlo con Docker y contar con datos de prueba idénticos a tu entorno actual. Ajusta los bloques que necesites antes de compartirlo públicamente.
