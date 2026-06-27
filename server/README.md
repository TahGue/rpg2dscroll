# Malik Server

Node.js API with Express, Prisma, and SQLite (local dev).

## Setup

```bash
cp .env.example .env
npm run db:push --workspace=server
npm run dev:server
```

API runs on http://localhost:3001

## Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | /api/health | Health check |
| POST | /api/auth/register | Create account |
| POST | /api/auth/login | Login |
| GET | /api/save | Load cloud save (auth) |
| PUT | /api/save | Save progress (auth) |

The Vite dev server proxies `/api` to port 3001.
