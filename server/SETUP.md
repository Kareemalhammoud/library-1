# Local Setup

This walks you through getting a working backend + database on your machine
from nothing, on macOS. Windows/Linux users: install MySQL the usual way for
your OS and the rest is identical.

## 1. Install MySQL (once)

```bash
brew install mysql
brew services start mysql
```

If you prefer a UI, install MySQL Workbench too (`brew install --cask mysqlworkbench`).

On first install MySQL is usually passwordless for `root`. If yours isn't,
keep track of the password you set; you'll put it in `.env` below.

## 2. Create the database

```bash
mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS lau_library;"
```

## 3. Apply the schema

From the repo root:

```bash
mysql -u root -p lau_library < server/db/schema.sql
```

This creates the `users`, `books`, `events`, and `loans` tables.

## 4. Configure the backend

```bash
cd server
cp .env.example .env
```

Open `server/.env` and fill in `DB_PASSWORD` (leave blank if root has no
password) and `JWT_SECRET` (any long random string — e.g. run
`openssl rand -base64 48`).

## 5. Install backend deps

```bash
npm install
```

## 6. Seed books and events

```bash
npm run seed
```

This populates `books` and `events` from the arrays in
`src/data/bookData.js` and `src/data/eventsData.js`. Safe to re-run —
it truncates and re-inserts.

## 7. Run the backend

```bash
npm run dev
```

The API is now live on `http://localhost:5000`. Smoke-test it:

```bash
curl http://localhost:5000/test-db           # { "message": "Database connected successfully", ... }
curl http://localhost:5000/api/books | head  # should print a JSON array of books
curl http://localhost:5000/api/events        # should print a JSON array of events
```

## 8. Run the frontend

In a second terminal, from the repo root:

```bash
npm install
npm run dev
```

Visit `http://localhost:5173`. Home, Catalog, Events, the book page, and the
event page should all load data from the backend.

## Troubleshooting

- `ER_ACCESS_DENIED_ERROR` — wrong `DB_USER` / `DB_PASSWORD` in `server/.env`.
- `ECONNREFUSED 127.0.0.1:3306` — MySQL isn't running. `brew services start mysql`.
- `Unknown database 'lau_library'` — run step 2 again.
- Catalog / Events pages stuck on "Loading..." — check the backend terminal
  for errors; `curl http://localhost:5000/api/books` should work.
