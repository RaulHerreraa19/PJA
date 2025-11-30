# Attendance Control API

Node.js + TypeScript + Express backend for the Plataforma Judicial Administrativa attendance system.

## Prerequisites

- Node.js 18.18+
- npm 10+
- MySQL 8+
- Redis 6+

## Local development

1. Copy the environment template:
   ```bash
   cp .env.example .env
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run database migrations and seed data:
   ```bash
   npm run migrate
   npm run seed
   ```
4. Start the API in watch mode:
   ```bash
   npm run dev
   ```
5. (Optional) start the BullMQ worker in a second shell:
   ```bash
   npm run queue:worker
   ```

Health check endpoint: `GET http://localhost:4000/health`

## Useful npm scripts

| Script                 | Description                          |
| ---------------------- | ------------------------------------ |
| `npm run dev`          | Nodemon + ts-node development server |
| `npm run build`        | TypeScript compilation to `dist/`    |
| `npm run start`        | Run compiled server (production)     |
| `npm run migrate`      | Run all Sequelize migrations         |
| `npm run seed`         | Execute all database seeders         |
| `npm run queue:worker` | Start the BullMQ worker              |

## Docker workflow

1. Copy `.env.example` to `.env` (compose reuses it).
2. From the repository root run:
   ```bash
   docker compose up --build
   ```
3. Services started:
   - `backend`: Express API (`http://localhost:4000`). Runs migrations + seed before booting.
   - `worker`: BullMQ worker (same image, different command).
   - `mysql`: MySQL 8 with a persisted volume.
   - `redis`: Redis 7 for BullMQ.
   - `frontend`: Vite dev server (`http://localhost:5173`).

Stop everything with `docker compose down` (add `-v` to drop volumes).

## Database seeding

The base seeder inserts:

- Default roles (`admin`, `rh`, `user`, `jefaturas-adscripciones`, `ti`).
- One department, position, schedule, and employee placeholder.
- Admin user (`admin@empresa.com / Admin123*`).
- RH user (`rh@empresa.com / rrhh12345`).
- Open period (`Q1 2025`).
  Extend or add new seeders under `src/database/seeders/` as needed.

Add new seed files via `npx sequelize-cli seed:generate --name add-more-data` and include them in migrations workflow.

## API usage cheatsheet

```bash
# 1) Login (stores refresh cookie, returns access token)
curl -i \
   -X POST http://localhost:4000/api/auth/login \
   -H "Content-Type: application/json" \
   -d '{"email": "admin@empresa.com", "password": "Admin123*"}'

# 2) Fetch employees (Authorization header uses the token from step 1)
curl -s \
   http://localhost:4000/api/employees \
   -H "Authorization: Bearer <ACCESS_TOKEN>"

# 3) Upload attendance file (CSV or DAT)
curl -s \
   -X POST http://localhost:4000/api/import/clockings \
   -H "Authorization: Bearer <ACCESS_TOKEN>" \
   -F "file=@./samples/clockings.csv" \
   -F "format=csv"
```

### Parser behavior

- Uploads are written to `FILE_UPLOAD_DIR`, then queued via BullMQ for background parsing.
- Supported formats: CSV (default) and DAT (pipe-delimited). Override via the optional `format` field.
- Customize column mapping, delimiters, or timezone inside `src/utils/fileParser.ts` if your biometric device exports different headers.
