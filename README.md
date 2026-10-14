# Retain

A personal expense and budget manager. Users record expenses, set a monthly budget and see where their money goes. Admins manage expense categories and view platform insights.

**Live app:** _added after deployment_

## Technologies

| Layer | Stack |
|---|---|
| Frontend | React, TypeScript, Vite, React Router, Redux Toolkit, Material-UI |
| Backend | Node.js, Express, TypeScript |
| Database | PostgreSQL (Prisma ORM) |
| Auth | JSON Web Tokens, bcrypt |

## Project structure

```
frontend/   React app
backend/    Express REST API
```

## Setup

Requirements: Node.js 20 or newer and a PostgreSQL database.

### Backend

```bash
cd backend
npm install
cp .env.example .env   # then fill in the values
npm run db:migrate     # creates the tables
npm run seed           # creates the default categories and the first admin account
npm run dev
```

The API runs on http://localhost:5000. Check it with `GET /api/health`.

`npm run seed` is safe to run again: it never duplicates categories or the admin.

### Frontend

```bash
cd frontend
npm install
cp .env.example .env.local
npm run dev
```

The app runs on http://localhost:5173.

## Features

_Filled in as features are built._

## API

Base URL: `http://localhost:5000/api`. Protected endpoints need the header `Authorization: Bearer <token>`.

Errors always have the shape `{ "message": string, "errors"?: { field: message } }`.

### Auth

| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/auth/register` | Public | Create an account. Body: `name`, `email`, `password` (min 8). Returns `{ token, user }`. |
| POST | `/auth/login` | Public | Sign in. Body: `email`, `password`. Returns `{ token, user }`. |
| GET | `/auth/me` | Signed in | Returns the current `{ user }`. |

_More endpoints added as the API is built._
