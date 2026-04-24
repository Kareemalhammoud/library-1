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
| Deployed Backend API | _TBD — added during Phase 2 deployment_ |
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

**Users** — A single registered user account stored in `localStorage`
Attributes: `username`, `email`, `password`, `createdAt`, optional `profilePic`.

**Loans** — Borrowing records persisted in `localStorage`
Attributes: `bookId`, `borrowedAt`, `dueAt`, `renewCount`, `isReserved`.

---

## Technology Stack

| Technology | Role |
|------------|------|
| **React 18** | UI framework — functional components and hooks (`useState`, `useEffect`, `useMemo`, `useRef`, `useContext`) |
| **React Router v6** | Client-side routing and navigation |
| **Tailwind CSS v4** | Utility-first styling with responsive design and dark mode support |
| **Vite** | Project scaffolding and development server |
| **localStorage** | Client-side data persistence |
| **CSS Modules** | Scoped component-level styling |

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

Open `http://localhost:5173`. The frontend reads `VITE_API_URL` for the
backend base URL — defaults to `http://localhost:5000/api`, no `.env` needed
locally.

### Building for Production

```bash
npm run build
npm run preview
```

---

## Backend API

Base URL: `http://localhost:5000/api` (local).

Authenticated endpoints expect `Authorization: Bearer <jwt>` — the token is
issued by `/api/auth/login` and stored by the frontend in `localStorage` under
the key `token`.

### Books (read-only on this branch — admin CRUD is owned by Rayan)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/books` | — | List all books. Optional query params: `search`, `genre`, `language`, `limit`. |
| GET | `/api/books/:id` | — | Single book by id. 404 if not found. |

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
  "badge": null
}
```

### Events (full CRUD, owner-scoped)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/events` | — | List events. Optional query params: `category`, `format`, `month` (1–12), `search`, `featured=true`. Sorted by date ascending. |
| GET | `/api/events/:id` | — | Single event by id. |
| POST | `/api/events` | ✅ | Create an event. The creator becomes `created_by`. Required body: `title`, `date` (YYYY-MM-DD). Optional: `time`, `location`, `category`, `format`, `featured`, `image`, `description`, `longDescription`, `speaker`, `seats`, `registered`, `audience`, `takeaway`, `highlights` (array). |
| PUT | `/api/events/:id` | ✅ | Update an event. 403 unless you are the original creator. Body takes any subset of the POST fields. |
| DELETE | `/api/events/:id` | ✅ | Delete an event. 403 unless you are the original creator. |

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

Seeded events have `createdBy: null` so they are immutable via the public CRUD
endpoints — they can only be managed by re-running `npm run seed`.

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

![Services](./images/ServicesAnimation.gif)

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

![Add/Edit Book](./images/AddEdit.gif)

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

## Mock Data & Simulated Interactions

The application runs entirely client-side with no backend.

### Static Mock Data

- `BOOKS` — Array of 53 books with full metadata and cover images
- `EVENTS` — Array of simulated library events

Both are managed through a React Context (`BooksContext`) and support in-memory CRUD operations.

### localStorage Persistence

Used for: user authentication state, registered user data, loan records, reading progress per book, dark mode preference, and borrowed book status.

### Simulated Interactions

- Book borrowing and loan renewal
- Study room reservation
- Ask a Librarian chat
- Client-side filtering, sorting, and search
- Event registration interface _(non-functional in Phase 1)_

---

## Project Structure

```
src/
├── assets/           # Static assets (images, icons)
├── components/       # Reusable UI components
├── context/          # React Context providers (BooksContext, etc.)
├── data/             # Mock data files (bookData.js, eventsData.js)
├── hooks/            # Custom React hooks
├── pages/            # Page-level components (ListView, BookDetail, etc.)
├── styles/           # CSS Modules and global styles
├── utils/            # Helper functions
├── App.jsx           # Root component with routing
└── main.jsx          # Entry point
```

---

## Accessibility

- Semantic HTML elements throughout
- Descriptive `alt` text for all images
- Proper `<label>` associations for all form inputs
- ARIA attributes on dynamic and interactive elements
- Full keyboard accessibility
- Adequate color contrast in both light and dark modes

---

## Dark Mode

Global dark mode is toggled via a button in the Header component and persisted to `localStorage`. The implementation uses Tailwind CSS dark mode utilities alongside `:global(body.dark)` selectors within CSS Modules for scoped component overrides.

---

## Technical Notes

- `--legacy-peer-deps` is required at install time due to a version conflict between Vite and the Tailwind CSS v4 PostCSS plugin.
- `postcss.config.js` must use `@tailwindcss/postcss` (not the standard `tailwindcss` plugin) due to a v4 API change.
- Related books shuffle stability is achieved via `useMemo` with a `[book.id, book.genre]` dependency array to prevent re-shuffling on unrelated re-renders.
- All `localStorage` writes follow a consistent `useEffect` + unique-key pattern for predictable persistence behavior.
