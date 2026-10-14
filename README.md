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

### Expenses

All expense endpoints are for signed-in users and only ever touch that user's own expenses. Another user's expense returns 404.

| Method | Endpoint | Description |
|---|---|---|
| GET | `/expenses` | List with filters, sorting and pagination (query parameters below). Returns `{ data, pagination }`. |
| GET | `/expenses/:id` | One expense. |
| POST | `/expenses` | Create. Body: `title`, `amount`, `categoryId`, `date` (YYYY-MM-DD), `paymentMethod`, optional `notes`. |
| PATCH | `/expenses/:id` | Update. Send only the fields to change. |
| DELETE | `/expenses/:id` | Delete. Returns 204. |

Query parameters for `GET /expenses`, all optional:

| Parameter | Example | Meaning |
|---|---|---|
| `search` | `lunch` | Text in the title or notes, case-insensitive |
| `categoryId` | `uuid` | One category |
| `paymentMethod` | `mobile_money` | One of `cash`, `card`, `mobile_money`, `bank_transfer`, `other` |
| `startDate`, `endDate` | `2026-10-01` | Date range, inclusive |
| `minAmount`, `maxAmount` | `50` | Amount range, inclusive |
| `sortBy` | `date` | `date` (default) or `amount` |
| `sortOrder` | `desc` | `desc` (default) or `asc` |
| `page`, `limit` | `1`, `10` | Pagination. `limit` is at most 100. |

### Budgets

| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/budgets/:month` | Signed in | Budget summary for a month (YYYY-MM): `amount`, `spent`, `remaining`, `percentUsed`, `status`. |
| PUT | `/budgets/:month` | Signed in | Set or update the month's budget. Body: `amount`. |

`status` is `none` (no budget set), `within`, `approaching` (80% or more used) or `over`.

### Categories

| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/categories` | Signed in | All categories. |
| POST | `/categories` | Admin | Create. Body: `name`. Names are unique, ignoring case. |
| PATCH | `/categories/:id` | Admin | Rename. Body: `name`. |
| DELETE | `/categories/:id` | Admin | Delete. Its expenses move to "Uncategorized", which itself cannot be renamed or deleted. |

### Dashboards

| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/dashboard?month=YYYY-MM` | Signed in | Total spent, budget summary, highest expense, spending by category and recent expenses for the month (default: current month). |
| GET | `/admin/insights` | Admin | Total users, total expenses and their value, expenses recorded this month, spending per category, top 5 and bottom 5 categories by use, recent expenses and recent users. |
