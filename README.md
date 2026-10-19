# Retain

A personal expense and budget manager. Users record expenses, set a monthly budget and see where their money goes. Admins manage expense categories and view platform insights.

**Live app:** https://retain-expense-manager-pm16-omega.vercel.app

## Contents

- [Technologies](#technologies)
- [Features](#features)
- [How the frontend is built](#how-the-frontend-is-built)
- [Authentication and authorization](#authentication-and-authorization)
- [Database](#database)
- [Project structure](#project-structure)
- [Setup](#setup)
- [Commands](#commands)
- [Deployment](#deployment)
- [Troubleshooting](#troubleshooting)
- [API](#api)
- [Author](#author)

## Technologies

| Layer | Stack |
|---|---|
| Frontend | React 19, TypeScript, Vite, React Router, Redux Toolkit, Material-UI (MUI) 9 |
| Backend | Node.js, Express 5, TypeScript, Zod (request validation) |
| Database | PostgreSQL with Prisma ORM |
| Auth | JSON Web Tokens, bcrypt password hashing |
| Hosting | Vercel (frontend), Render (backend), Neon (PostgreSQL) |

## Features

### For users

- **Sign up, sign in and sign out.** A page refresh keeps you signed in; an expired session sends you back to sign in and then returns you to the page you were on.
- **Expenses:** create, view, edit and delete your own expenses. Each has a title, amount, category, date, payment method and optional notes. Click a row to see every detail of an expense.
- **Search, filter and sort:** search titles and notes; filter by category, payment method, date range and amount range; sort by date or amount by clicking the table headers. Results are paginated (10 per page).
- **Monthly budget:** set or update a budget for any month and see the total spent, the remaining amount, and whether you are within budget, approaching it (80% or more used) or over it.
- **Dashboard:** for the selected month, total spending, remaining budget, highest expense, spending by category and recent expenses.

### For admins

- **Categories:** create, rename and delete expense categories. Deleting a category moves its expenses to the default **Uncategorized** category, which cannot itself be renamed or deleted.
- **Platform insights:** total registered users, total expenses and their total value, expenses recorded this month, spending per category, top 5 and bottom 5 categories by use, recently added expenses and recently registered users.
- Admins see only the admin area; the personal pages (dashboard, expenses, budget) are for regular users.

### Security

- Passwords are hashed with bcrypt and never returned by the API.
- Every expense and budget request is limited to the signed-in user's own data. Another user's expense returns 404, so ids cannot be probed.
- Admin endpoints check the role on the server, not only in the browser. Sign-up always creates a regular user.
- All request bodies and query strings are validated with Zod, and errors come back with a message per field.
- CORS only lets the app's own frontend call the API from a browser.

## How the frontend is built

| Concern | Approach | Where |
|---|---|---|
| Authentication | **React Context** holds the user and provides sign up, sign in and sign out | `src/context/AuthProvider.tsx`, `src/context/authContext.ts`, `src/hooks/useAuth.ts` |
| Protected routes | Route guards read the auth context: `ProtectedRoute` (signed in), `AdminRoute` (admin only), `UserRoute` (regular users only), `GuestRoute` (sign-in pages) | `src/components/routing/` |
| Filtering, searching, sorting | **Redux Toolkit** slice holding every filter, the sort and the page | `src/store/filtersSlice.ts`, `src/store/store.ts` |
| API calls | Typed fetch wrapper that attaches the token and turns errors into `ApiError` | `src/api/client.ts` |
| Types | Shared TypeScript types for every API request and response | `src/types/api.ts` |
| UI | Material-UI components with a custom theme; responsive from phone to desktop | `src/theme.ts`, `src/components/layout/AppLayout.tsx` |

## Authentication and authorization

### Flow

1. The user signs up (`POST /auth/register`) or signs in (`POST /auth/login`). The server returns a JWT and the user.
2. The token holds the user's id and role and is valid for **7 days**. The frontend keeps it in `localStorage` and sends it with every request as `Authorization: Bearer <token>`.
3. On page load, if a token is saved, the frontend calls `GET /auth/me` to restore the user, so a refresh does not sign you out.
4. If any request answers 401 (token expired or invalid), the session ends and the user is sent to sign in; afterwards they return to the page they were on.
5. Signing out removes the token from the browser.

### On the server

- `requireAuth` checks the token and then **loads the user from the database on every request**, so a deleted account or a changed role takes effect at once instead of when the token expires.
- `requireAdmin` runs after `requireAuth` and answers 403 to anyone who is not an admin.
- Expense and budget queries always include the signed-in user's id, so users can only ever reach their own data.

### Roles

| Role | Can do |
|---|---|
| User | Manage their own expenses and budgets, see their dashboard, read the category list |
| Admin | Create, rename and delete categories; view platform insights |

## Database

PostgreSQL, managed with Prisma (`backend/prisma/schema.prisma`).

| Model | What it stores |
|---|---|
| **User** | Name, unique email, bcrypt password hash and role (`user` or `admin`) |
| **Category** | A unique name. Exactly one category, Uncategorized, is marked as the default. Categories are shared by all users. |
| **Expense** | Title, amount, date, payment method and optional notes. Belongs to one user and one category. |
| **Budget** | A month (`YYYY-MM`) and an amount. Belongs to one user, with **at most one budget per user per month**. |

```
User ──< Expense >── Category
User ──< Budget
```

- Amounts use `Decimal(12, 2)`, so money is never rounded by floating-point maths.
- Expense dates are plain calendar days with no time, so month totals are not shifted by time zones.
- Deleting a user deletes their expenses and budgets. A category cannot be deleted while expenses still point to it; the API moves them to Uncategorized first, in one transaction.
- The amount spent, the remaining amount and the budget status are calculated when requested, not stored.

## Project structure

```
backend/
  prisma/            Database schema and migrations
  src/
    config/          Environment variables and the Prisma client
    controllers/     Route handlers
    middleware/      Authentication, validation and error handling
    routes/          Express routers
    schemas/         Zod validation schemas
    services/        Budget calculations shared by several routes
    utils/           JWT, money and month helpers
    seed.ts          Creates the default categories and the first admin
frontend/
  src/
    api/             API client
    components/      Layout, route guards, StatCard and expense components
    context/         Authentication context
    hooks/           useAuth, useCategories
    pages/           One file per page, admin pages in pages/admin
    store/           Redux store and the filters slice
    types/           Shared TypeScript types
    utils/           Budget status labels and colours, responsive helpers
```

## Setup

Requirements: Node.js 20 or newer, npm, and a PostgreSQL database (local, or hosted such as Neon).

### Get the code

```bash
git clone https://github.com/iclaudiaadeline/retain-expense-manager.git
cd retain-expense-manager
```

### Backend

```bash
cd backend
npm install            # also generates the Prisma client
cp .env.example .env   # then fill in the values (see below)
npm run db:migrate     # creates the tables
npm run seed           # creates the default categories and the first admin account
npm run dev
```

The API runs on http://localhost:5000. Check it with `GET /api/health`.

`npm run seed` is safe to run again: it never duplicates categories or the admin. It creates these categories: Food & Dining, Transport, Housing, Utilities, Health, Education, Entertainment, Shopping and the default Uncategorized.

| Variable | Required | Meaning |
|---|---|---|
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `JWT_SECRET` | Yes | Secret used to sign login tokens. At least 16 characters; use a long random string. |
| `PORT` | No | Port the API listens on (default 5000) |
| `CLIENT_URL` | No | Website(s) allowed to call the API, separated by commas (default http://localhost:5173). The deployed frontend is always allowed. |
| `ADMIN_NAME`, `ADMIN_EMAIL`, `ADMIN_PASSWORD` | Only for `npm run seed` | The first admin account. The password needs at least 8 characters. |

The backend checks these when it starts and stops with a clear message if one is missing or invalid.

### Frontend

```bash
cd frontend
npm install
cp .env.example .env.local
npm run dev
```

The app runs on http://localhost:5173.

| Variable | Required | Meaning |
|---|---|---|
| `VITE_API_URL` | No | Base URL of the API (default `http://localhost:5000/api`) |

### Accounts

Sign up in the app to get a regular user account. The admin account is the one created by `npm run seed` from `ADMIN_EMAIL` and `ADMIN_PASSWORD`; there is no way to sign up as an admin.

#### Demo admin account

To try the admin pages on the live app, sign in with this account. For the user pages, sign up with any email.

| Role | Email | Password |
|---|---|---|
| Admin | `admin@example.com` | `Musanze123` |

This account exists only for demonstration. Please do not delete the default categories.

## Commands

### Backend (`backend/`)

| Command | What it does |
|---|---|
| `npm run dev` | Start the API and restart it on every change |
| `npm run build` | Generate the Prisma client and compile TypeScript to `dist/` |
| `npm start` | Run the compiled API (production) |
| `npm run typecheck` | Check types without building |
| `npm run seed` | Create the default categories and the first admin |
| `npm run db:migrate` | Apply migrations in development and create new ones after schema changes |
| `npm run db:deploy` | Apply existing migrations (production) |
| `npm run db:studio` | Open Prisma Studio to browse the database |

### Frontend (`frontend/`)

| Command | What it does |
|---|---|
| `npm run dev` | Start the Vite development server |
| `npm run build` | Type-check and build for production into `dist/` |
| `npm run preview` | Serve the production build locally |
| `npm run lint` | Lint the code with oxlint |

## Deployment

| Part | Host | Settings |
|---|---|---|
| Database | Neon | A PostgreSQL database; its connection string is the backend's `DATABASE_URL`. |
| Backend | Render | Root directory `backend`. Build: `npm install && npm run build`. Start: `npm start`. Environment variables as in the table above. Run `npm run db:deploy` to apply migrations and `npm run seed` once to create the categories and the admin. |
| Frontend | Vercel | Root directory `frontend`. Build: `npm run build`, output `dist`. Set `VITE_API_URL` to the backend's URL plus `/api`. `vercel.json` rewrites every path to `index.html` so refreshing a page or opening a direct link works. |

## Troubleshooting

**The backend stops with "Invalid environment variables".**
A required value in `backend/.env` is missing or too short. The message names the variable. `JWT_SECRET` must be at least 16 characters.

**The app says "Cannot reach the server".**
The backend is not running, or `VITE_API_URL` points to the wrong address. After changing `.env.local`, restart `npm run dev` in `frontend`, because Vite only reads it at start-up.

**The live app is slow to load the first time.**
On Render's free plan the backend sleeps after a period without visitors. The first request wakes it up, which can take up to a minute; after that it is fast.

**Prisma errors about a missing client or missing tables.**
Run `npx prisma generate` in `backend` to rebuild the client, then `npm run db:migrate` (locally) or `npm run db:deploy` (production) to create the tables.

**Deleting a category fails with "Default category is missing".**
The Uncategorized category does not exist yet. Run `npm run seed` in `backend`.

**The admin cannot sign in after changing `ADMIN_PASSWORD`.**
The seed script only creates the admin if that email does not exist yet; it never changes an existing admin's password. Use a new `ADMIN_EMAIL`, or update the password in the database.

## API

Base URL: `http://localhost:5000/api` when running locally. Protected endpoints need the header `Authorization: Bearer <token>`.

Errors always have the shape `{ "message": string, "errors"?: { field: message } }`. Common status codes: 400 validation failed, 401 not signed in or token expired, 403 not an admin, 404 not found, 409 already exists.

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
| `page`, `limit` | `1`, `10` | Pagination. `limit` defaults to 10, at most 100. |

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
| DELETE | `/categories/:id` | Admin | Delete. Its expenses move to "Uncategorized", which itself cannot be renamed or deleted. Returns how many expenses were moved. |

### Dashboards

| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/dashboard?month=YYYY-MM` | Signed in | Total spent, budget summary, highest expense, spending by category and recent expenses for the month (default: current month). |
| GET | `/admin/insights` | Admin | Total users, total expenses and their value, expenses recorded this month, spending per category, top 5 and bottom 5 categories by use, recent expenses and recent users. |

## Author

Built by [@iclaudiaadeline](https://github.com/iclaudiaadeline) as an individual summative project.
