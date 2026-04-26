# LAU Riyad Nassar Library — Web Application

> **CSC443 · Project Phases 1 & 2 · Team: Dodgers**

A full-stack web application for the Lebanese American University's Riyad Nassar
Library. Phase 1 delivered a responsive React frontend. Phase 2 adds a
Node/Express backend, a MySQL database, JWT-based authentication, and
authenticated CRUD endpoints — converting the simulated frontend into a
persistent, secure full-stack app.

---

## Links

| Resource | URL |
|----------|-----|
| Deployed Frontend | https://library-1-tau.vercel.app |
| Deployed Backend API | https://library-api-46jn.onrender.com |
| GitHub Repository | https://github.com/Kareemalhammoud/library-1 |

---

## Team Members

### Phase 1 — Frontend

| Member | Pages / Features |
|--------|-----------------|
| **Kareem Naous** | User Dashboard, Login, Register, EventDetail, Dark Mode |
| **Perla Imad** | List View, Book Detail, Services, Responsive Design |
| **Kareem Hammoud** | Homepage, Events, Catalog |
| **Rayan Madi** | Add Book, Edit Book, Author Detail |

### Phase 2 — Full-Stack

| Member | Backend / Integration |
|--------|----------------------|
| **Kareem Naous** | Auth backend (register/login, bcrypt, JWT middleware), user profile + loans backend, Dashboard integration |
| **Perla Imad** | Book Detail & List frontend API integration, Services integration, loading/error/success states |
| **Kareem Hammoud** | Books and Events read APIs, Events full CRUD with ownership authorization, DB schema + seed script for books and events, Home/Catalog/Events frontend integration, deployment lead |
| **Rayan Madi** | Authenticated Book CRUD (create/update/delete), book ownership/authorization, Add/Edit Book frontend integration |

---

## Assigned Topic & Data Entities

**Topic:** University Library Management System — LAU Riyad Nassar Library

### Primary Data Entities

**Books** — Core entity defined in `src/data/bookData.js`
Attributes: `id`, `title`, `author`, `genre`, `year`, `publisher`, `isbn`, `pages`, `rating`, `language`, `campus`, `description`, `cover` (image URL), availability status, copy count.

**Events** — Defined in `src/data/eventsData.js`
Attributes: `id`, `title`, `category`, `date`, `time`, `location`, `format`, `description`, `speaker`, `seats`, `registered`, `image`, `featured` flag.

**Users** — Persisted in the MySQL `users` table.
Attributes: `id`, `full_name`, `email` (unique), `password` (bcrypt hash), `created_at`.

**Loans** — Persisted in the MySQL `loans` table; one row per borrow event.
Attributes: `id`, `user_id` (FK → users), `book_id` (FK → books), `borrow_date`, `due_date`, `return_date`, `renew_count`, `status` (`active`, `returned`).

**Reviews** and **Favorites** are supporting entities, persisted as their own
MySQL tables (`reviews`, `favorites`) with foreign keys to `users` and `books`.
The full schema is in [`server/db/schema.sql`](server/db/schema.sql).

---

## Technology Stack

### Frontend

| Technology | Role |
|------------|------|
| **React 18** | UI framework — functional components and hooks (`useState`, `useEffect`, `useMemo`, `useRef`, `useContext`) |
| **React Router v6** | Client-side routing and navigation |
| **Tailwind CSS v4** | Utility-first styling, responsive design, dark mode |
| **Vite** | Build tool and dev server |
| **localStorage** | Session-only state (JWT, dark-mode preference) |

### Backend

| Technology | Role |
|------------|------|
| **Node.js + Express 5** | HTTP server and routing |
| **MySQL 8** | Persistent store for users, books, events, loans, reviews, favorites |
| **mysql2** | Promise-based MySQL client with connection pooling |
| **bcrypt** | Password hashing on registration; constant-time compare on login |
| **jsonwebtoken** | JWT issuance on login/register, verification in `authMiddleware` |
| **morgan** | HTTP request logging (`dev` locally, `combined` in production) |
| **swagger-ui-express** | Interactive API docs at `/api-docs` |
| **dotenv** | Loads `server/.env` for DB credentials, JWT secret, port |

---

## Setup Instructions

### Prerequisites

- Node.js v18 or higher
- npm v9 or higher
- MySQL v8 or higher (for the backend)

### Full-stack Local Setup

The project is now two services: a React frontend (Vite, at the repo root) and
a Node/Express backend (in `server/`). You need both running.

**Backend (terminal 1):** follow [`server/SETUP.md`](server/SETUP.md) — it walks
through installing MySQL, creating the `lau_library` database, applying
`server/db/schema.sql`, copying `server/.env.example` to `server/.env`, seeding
books and events (`npm run seed`), and starting the API (`npm run dev`). The
API listens on `http://localhost:5000`.

**Frontend (terminal 2):** from the repo root:

```bash
npm install --legacy-peer-deps   # peer conflict between Vite and Tailwind v4
npm run dev
```

Open `http://localhost:5173`. The frontend reads two Vite env vars to
locate the backend; both default to a local API at `http://localhost:5000`
and need no `.env` for the standard local setup:

| Variable | Used by | Default |
|----------|---------|---------|
| `VITE_API_URL`  | The shared `src/utils/api.js` client and auth/dashboard pages. Points at the API root **including `/api`**. | `http://localhost:5000/api` |
| `VITE_API_BASE` | A few pages (`Home`, `BookDetail`) that build full URLs themselves. Points at the API root **without `/api`**. | `http://localhost:5000` |

If you point the frontend at a non-default backend (e.g. a deployed API),
set both — they should be the same host, with and without the `/api`
suffix.

---

## Backend API

Base URLs:

| Environment | URL |
|-------------|-----|
| Production | `https://library-api-46jn.onrender.com/api` |
| Local      | `http://localhost:5000/api` (or whatever `PORT` is in `server/.env`) |

Authenticated endpoints expect `Authorization: Bearer <jwt>`. The token is
issued by `/api/auth/login` (and `/api/auth/register`) and is stored by the
frontend in `localStorage` under the key `token`.

Errors come back as JSON of shape `{ "message": "..." }` with an HTTP status
that matches the failure (`400` invalid input, `401` unauthenticated, `403`
forbidden, `404` not found, `409` conflict, `500` server error).

### Auth

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/auth/register` | — | Create a user. Body: `full_name`, `email`, `password`. Returns the new user + a JWT. 400 on missing fields or duplicate email. |
| POST | `/api/auth/login`    | — | Authenticate. Body: `email`, `password`. Returns the user + a JWT. 401 on bad credentials. |

Response shape (both endpoints):

```json
{
  "message": "Login successful",
  "token": "eyJhbGciOi...",
  "user": {
    "id": 7,
    "full_name": "Karim Hammoud",
    "email": "karim@example.com",
    "createdAt": "2026-04-25T18:00:00.000Z"
  }
}
```

### Users

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/users/me` | ✅ | Returns the currently authenticated user (`id`, `full_name`, `email`, `createdAt`). 401 if the JWT is missing or invalid. |

### Books (full CRUD, admin-only writes)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET    | `/api/books`     | — | List all books. Optional query params: `search`, `genre`, `language`, `limit`. |
| GET    | `/api/books/:id` | — | Single book by id. 404 if not found. |
| POST   | `/api/books`     | 🛡️ admin | Create a book. Required body: `title`, `author`. Optional: `genre`, `language`, `year`, `pages`, `rating`, `publisher`, `isbn`, `description`, `cover`, `availableCopies` (defaults to schema default `3`). |
| PUT    | `/api/books/:id` | 🛡️ admin | Update a book. Same body shape as POST. 404 if not found. |
| DELETE | `/api/books/:id` | 🛡️ admin | Delete a book. 404 if not found. |

Book response shape (aliased to match the frontend):

```json
{
  "id": 0,
  "title": "The Story of Art",
  "author": "E.H. Gombrich",
  "genre": "Art",
  "language": "EN",
  "year": 1950,
  "rating": 4.5,
  "pages": 688,
  "publisher": "Phaidon Press",
  "isbn": "978-0-7148-3247-0",
  "description": "...",
  "cover": "https://.../cover.jpg",
  "color": "amber",
  "genreColor": "#8C6A1E",
  "badge": null,
  "copies": 3
}
```

### Events (full CRUD, admin-only writes)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/events` | — | List events. Optional query params: `category`, `format`, `month` (1–12), `search`, `featured=true`. Sorted by date ascending. |
| GET | `/api/events/:id` | — | Single event by id. |
| POST | `/api/events` | 🛡️ admin | Create an event. Required body: `title`, `date` (YYYY-MM-DD). Optional: `time`, `location`, `category`, `format`, `featured`, `image`, `description`, `longDescription`, `speaker`, `seats`, `registered`, `audience`, `takeaway`, `highlights` (array). |
| PUT | `/api/events/:id` | 🛡️ admin | Update an event. Body takes any subset of the POST fields. |
| DELETE | `/api/events/:id` | 🛡️ admin | Delete an event. |

Event response shape:

```json
{
  "id": 1,
  "title": "Research Skills Workshop: Finding Academic Sources",
  "date": "2026-03-25",
  "time": "2:00 PM - 4:00 PM",
  "location": "Riyad Nassar Library, Beirut",
  "category": "Workshops",
  "format": "In-Person",
  "featured": 1,
  "image": "https://...",
  "description": "...",
  "longDescription": "...",
  "speaker": "Dr. Nada El-Husseini",
  "seats": 30,
  "registered": 22,
  "audience": "...",
  "takeaway": "...",
  "highlights": ["...", "..."],
  "createdBy": null,
  "createdAt": "2026-04-21T18:00:00.000Z"
}
```

Seeded events have `createdBy: null`. Together with the admin-only write
rule, this means the seed-shipped event list is only mutable by an admin
account, or by re-running `npm run seed`.

### Dashboard

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/dashboard` | ✅ | Aggregated view for the logged-in user. Returns four lists in one payload — used by the Dashboard page so the frontend doesn't have to chain four requests. |

Response shape:

```json
{
  "activeLoans": [
    { "id": 12, "title": "...", "author": "...", "borrow_date": "...",
      "due_date": "...", "renew_count": 0, "status": "active" }
  ],
  "history": [
    { "id": 12, "title": "...", "author": "...", "borrow_date": "...",
      "due_date": "...", "return_date": null, "renew_count": 0, "status": "active" }
  ],
  "overdue": [
    { "id": 9, "title": "...", "author": "...", "due_date": "...", "renew_count": 0 }
  ],
  "renewals": [
    { "id": 9, "title": "...", "renew_count": 1, "due_date": "..." }
  ]
}
```

### Favorites

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET    | `/api/favorites`           | ✅ | List the current user's favorite books. Same book shape as `/api/books`. |
| POST   | `/api/favorites/:bookId`   | ✅ | Add a book to favorites. Idempotent — favoriting an already-favorited book is a no-op (still 201). 404 if the book doesn't exist. |
| DELETE | `/api/favorites/:bookId`   | ✅ | Remove a book from favorites. Always 200 (silent if not present). |

### Loans

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET  | `/api/loans` | ✅ | Active (un-returned) loans for the current user, ordered newest-first. |
| POST | `/api/loans` | ✅ | Borrow a book. Body: `{ "bookId": 0 }`. Issues a 14-day loan. 404 if the book doesn't exist; **409** if you already have an active loan on that book. |

Loan response shape:

```json
{
  "id": 12,
  "book_id": 0,
  "title": "The Story of Art",
  "author": "E.H. Gombrich",
  "borrow_date": "2026-04-26",
  "due_date":    "2026-05-10",
  "return_date": null,
  "renew_count": 0,
  "status": "active"
}
```

### Reviews

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET    | `/api/reviews/book/:bookId` | — | Reviews for a book, newest first. |
| POST   | `/api/reviews/book/:bookId` | ✅ | Submit (or update) a review. Body: `{ "rating": 1-5, "comment": "..." }`. One review per `(user, book)` — re-posting updates the existing row (returns 200 instead of 201). |
| DELETE | `/api/reviews/:id`          | ✅ | Delete your own review. 403 if it isn't yours. Seeded reviews (`user_id = null`) cannot be deleted via the API. |

Review response shape:

```json
{
  "id": 1,
  "bookId": 0,
  "userId": 7,
  "reviewer_name": "Karim Hammoud",
  "rating": 5,
  "comment": "Made me fall in love with art history.",
  "createdAt": "2026-04-26T01:00:00.000Z"
}
```

For seeded reviews `userId` is `null` and `reviewer_name` is the hand-picked
display name from `server/scripts/seed.js`.

### Authorization model: admin-only writes on books and events

Books and events are the library's curated catalog, not user-contributed
content, so writes on those collections are restricted to admin
accounts. The check is implemented as an `adminOnly` middleware that
runs after `authMiddleware` and rejects any user whose email is not in
the configured admin list.

| Action | Public read | Authenticated user | Admin |
|--------|-------------|--------------------|-------|
| `GET /api/books`, `/api/events` | ✅ | ✅ | ✅ |
| `POST` / `PUT` / `DELETE` on books or events | ❌ | ❌ (403) | ✅ |

Per-user resources — favorites, loans, and reviews — remain user-scoped:
each user can only create or remove their own. See those sections above
for the exact rules.

### Admin accounts

Two admin emails are recognized by default: **`admin@lau.edu`** and
**`superadmin@lau.edu`**. Any account registered under one of those
emails has admin powers; in the UI it sees the "Add Book" button on
the catalog and "Edit" / "Delete" controls on each book.

The list is configurable per environment, so you don't need to ship
code to add or rotate an admin:

| Side | Variable | Default |
|------|----------|---------|
| Backend | `ADMIN_EMAILS` (comma-separated) | `admin@lau.edu,superadmin@lau.edu` |
| Frontend | `VITE_ADMIN_EMAILS` (comma-separated) | `admin@lau.edu,superadmin@lau.edu` |

Both variables must agree — the backend enforces, the frontend gates
the admin-only UI controls. Setting only the backend yields a working
but incomplete experience (the UI hides the admin buttons even though
the API would accept the writes).

For local development, register one of the admin accounts after
seeding the database:

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H 'Content-Type: application/json' \
  -d '{"full_name":"LAU Admin","email":"admin@lau.edu","password":"Admin123!"}'
```

Then sign in at `/login` with `admin@lau.edu` / `Admin123!`. The
deployed environment provisions admin accounts the same way against
the hosted database, with passwords chosen at registration time.

---

## Screenshots & Features

### Homepage (`/`)

![Homepage](./images/HomeAnimation.gif)

The landing page features a hero section with a Ken Burns-style animation cycling through LAU campus photos. Dynamic CTAs adapt based on login state — "Get Started" for guests, "Explore the Catalog" for authenticated users. Real LAU library statistics are displayed (1.1M+ resources, 185 online databases, 8,000+ students served, 517+ reading seats). An infinite-scroll book carousel with pause-on-hover behavior, built using `useLayoutEffect` and the Web Animations API, is also included alongside an upcoming events preview.

---

### Book Catalog (`/catalog`)

![Book Catalog](./images/CatalogAnimation.gif)

A fully searchable catalog of 53 books with advanced filtering. Features a full-text search bar with an advanced search modal (title, author, subject, format, year range). Multi-criteria filter bar covers availability, resource type, language, subject, campus, and year. Grid and list view toggle, sorting options (relevance, title, author, year, availability), and an admin mode — restricted to `admin@lau.edu` — for adding and editing books via a modal form. Responsive across all breakpoints.

---

### List View (`/catalog/list`)

![List View](./images/ListViewAnimation.gif)

A searchable, filterable, and paginated catalog view.

- Real-time search by title and/or author
- Filters: genre, language, campus, and availability
- Sorting: alphabetical (A–Z / Z–A), year (newest / oldest), rating (highest / lowest)
- Pagination with 12 items per page and scroll-to-top behavior
- Skeleton loading states with shimmer animation to simulate async data fetching
- Responsive grid layout across mobile, tablet, and desktop

---

### Book Detail (`/books/:id`)

![Book Detail](./images/BookDetailsAnimation.gif)

A detailed view for individual books.

- Responsive layout across mobile, tablet, and desktop
- Borrow confirmation modal with confirmation and success states; includes authentication check
- Reading progress slider persisted to `localStorage` per book
- Share button with inline "Copied!" feedback state
- Related books section (shuffled via `useMemo` with `[book.id, book.genre]` dependencies to prevent re-shuffling on re-render)
- Full book metadata: year, publisher, ISBN, pages, language, campus, rating, availability status, and copy count

---

### Services (`/services`)

![Services](./images/Services%20Animation.gif)

A multi-section page reflecting real LAU library services:

- **Borrowing & Renewals** — Circulation policies and loan rules
- **Study Room Booking** — Reservation form with campus, room, date, time slot, duration, and student ID validation; supports Beirut (RNL) and Byblos (JGJL/HSL) campuses
- **Printing, Scanning & Photocopying** — Overview of shared printing resources across library floors
- **Writing & Communication Center** — Session booking information for essay, citation, and research support
- **Ask a Librarian** — Simulated real-time chat interface

All sections are fully responsive.

---

### Events (`/events`)

![Events](./images/EventsAnimation.gif)

- Hero section with a 3-panel image mosaic layout  
- Featured event spotlight with full details (date, time, location, speaker, seats remaining)  
- Category filter tabs: Workshops, Author Talks, Exhibitions, Book Clubs, Film, and more  
- Multi-criteria filtering by month, format (In-Person / Online), and text search  
- Active filter count badge with a clear-all action  
- Event cards with date badges, category color coding, and location/time details  
- Filtering optimized with `useMemo`  
- **Event Details Page**
  - Accessible via the **"Learn More"** button on each event  
  - Displays a more detailed view of the selected event  
  - Includes extended information and full event description  
  - Allows users to **register for the event**  

---

### User Dashboard (`/dashboard`)

![Dashboard](./images/DashboardAnimation.gif)

A protected route that requires user authentication before access is granted. The dashboard acts as the main hub for user interaction and includes the following features:

- **User Profile Management**
  - Displays user information
  - Allows editing of the username
  - Supports profile picture upload (stored as Base64 in `localStorage`)

- **Library Activity**
  - Displays **checked-out books** and **overdue books**
  - Provides detailed information for each book
  - Allows users to **renew borrowed books** (with defined limits)

- **Calendar Integration**
  - Displays upcoming events and deadlines in an organized calendar view

---

### Login & Register (`/login`, `/register`)

![Login](./images/LoginAnimation.gif) ![Register](./images/RegisterAnimation.gif)


**Login:** Email and password validation with error handling. Redirects to the originally requested page using `location.state.from`. Credentials are verified against data stored in `localStorage`.

**Register:** Validates username, email, and password with enforced password strength requirements. Prevents duplicate account creation.

---

### Add / Edit Book (`/books/add`, `/books/:id/edit`)

![Add/Edit Book](./images/AddEditAnimation.gif)

A dynamic form that handles both adding new books and editing existing entries. When editing, the form is pre-filled with existing data from the global context. Key features include:

- Image upload with real-time cover preview
- Author biography system with optional editing; auto-populates from a local dictionary if left empty
- Campus handling: Beirut, Byblos, or both — with proper fallback logic
- Data normalization: language (EN / FR), numeric type conversions
- Form validation and structured data handling
- Integration with global `BooksContext` for state management

---
### 🌙 Dark Mode

![Dark Mode](./images/DarkModeAnimation.gif)

The application supports a fully responsive dark mode designed for accessibility and user comfort.

- Toggle available globally via the Header component
- Preference is saved in `localStorage` and persists across sessions
- Consistent styling across all pages and components
- Built using Tailwind CSS dark mode utilities with additional scoped overrides


---

## Data Sources & Client-Side State

Phase 2 replaced Phase 1's in-memory simulation with a real Node/Express
+ MySQL backend. A few client-side bits remain by design — they are
documented here so the architecture is unambiguous.

### Seed data, not mock data

- `src/data/bookData.js` — 53 books with full metadata and cover images.
- `src/data/eventsData.js` — 8 library events.

These arrays are now **seed sources**, not runtime data. `npm run seed`
in `server/` reads them and inserts the rows into the `books` and
`events` tables. The frontend reads everything from the API.

### What's still in localStorage

- `token` — the JWT issued at login; sent as `Authorization: Bearer <token>` on protected calls.
- `user` — minimal profile snapshot for the current session.
- `isLoggedIn` — convenience flag used by route guards.
- Dark-mode preference.

Loans, favorites, reviews, and reading progress are persisted on the
backend; localStorage is no longer the source of truth for any
domain data.

### What's still simulated

- **Ask a Librarian** chat widget — UI-only, no backend.
- **Study room reservation** form — UI-only.
- **Event registration** button — UI-only (the seat counter on each event is read from the API but no booking endpoint exists).

Everything else (book borrow/return/renew, book CRUD, event CRUD,
favorites, reviews, dashboard) is backed by real API calls.

---

## Technical Challenges & How We Solved Them

### Deploying a backend that needed a managed database

The backend is on Render free tier and the MySQL is on Railway. Wiring them
together exposed three real-world issues we had to solve:

1. **Port collision on macOS.** Apple's AirPlay Receiver squats `:5000` on
   recent macOS releases, so `app.listen(5000)` silently exits on those
   dev machines. We made the port configurable via `PORT` in `server/.env`
   so anyone hitting this can switch to `5001` (or anything else) without
   touching code.
2. **Connecting to a managed DB requires more config than the local one.**
   Railway's MySQL proxy uses a non-3306 port and benefits from SSL. The
   original `server/config/db.js` only read `DB_HOST`, `DB_USER`,
   `DB_PASSWORD`, `DB_NAME`. We added `DB_PORT` and an optional
   `DB_SSL=true` toggle (gated so local dev still works with no SSL).
3. **Loading the schema and seed against the cloud DB.** We wrote two
   reusable Node scripts under `server/scripts/`:
   - `apply-schema.js` — runs `server/db/schema.sql` against whatever DB
     the current `.env` points to.
   - `migrate-add-copies.js` — idempotent ALTER for adding the
     `available_copies` column without re-seeding (used to fix the
     "fully borrowed" bug below without dropping production data).

### "Fully Borrowed" on every book after backend integration

Phase 1's `bookData.js` had no `copies` field, so the Phase 2 schema didn't
get one either. The catalog read `book.copies ?? 0`, which was always `0`,
which the UI rendered as "fully borrowed" everywhere. We:

1. Added `available_copies INT NOT NULL DEFAULT 3` to `server/db/schema.sql`.
2. Aliased it to `copies` in the SQL projection (so the frontend keeps using
   the short name).
3. Ran `migrate-add-copies.js` against the live Railway DB to backfill
   without losing data.

### Frontend pages reading the wrong field name

A subtler version of the same bug: `BookDetail`, `ListView`, and `Home`
were reading `data.available_copies` / `data.image` / `data.category` while
the API returns `copies` / `cover` / `genre`. Worse, `BookDetail` defined a
`normalizeBook()` function that did the right mapping but **was never
called** — `setBook(oneBook)` stored the raw API payload. Fix was to
actually invoke `normalizeBook` and add the API field names to its fallback
chains so legacy payload shapes still work.

### Vercel SPA 404s on deep routes

Vercel returns its own 404 for any URL without a matching file. React Router
handles `/catalog`, `/books/0`, etc. client-side, so a refresh or shared
link 404'd before reaching the SPA. Adding a `vercel.json` rewriting
`/(.*)` to `/index.html` lets the router take over.

### Safari ignoring the SVG favicon

Safari has spotty SVG-favicon support, so the tab icon was blank. We
generated a 64×64 PNG (entirely in Python with `struct` + `zlib`, no
external image libraries — see commit `Add PNG favicon as Safari
fallback`) and declared it in `index.html` *before* the SVG so Safari
picks the PNG and other browsers still get the SVG.

### Render env-var name typo causing a generic ECONNREFUSED

When the backend first deployed, `/api/books` returned a generic 500. The
Render logs showed `code: 'ECONNREFUSED'` with no other context — a
classic "default to localhost:3306" failure. Cause: the Render env tab had
`DB-HOST` (hyphen) instead of `DB_HOST` (underscore), so Node's
`process.env.DB_HOST` was `undefined`. Catching this required reading
the actual deploy logs rather than guessing. Hard-won lesson: when
debugging deployments, always look at logs first.
