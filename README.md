# LAU Riyad Nassar Library — Web Application

> **CSC443 · Project Phase 1 · Team: Dodgers**

A fully responsive and interactive frontend for the Lebanese American University's Riyad Nassar Library. Built with Semantic HTML, React, Tailwind CSS, and React Router, the application simulates a comprehensive library management system — covering browsing and borrowing books, attending events, booking study rooms, and managing a personal account. All features are powered by mock data and client-side state management with no backend required. The website is designed to be accessible and user friendly. 

---

## Links

| Resource | URL |
|----------|-----|
| Deployed Application | https://library-1-tau.vercel.app |
| GitHub Repository | https://github.com/Kareemalhammoud/library-1 |

---

## Team Members

| Member | Pages / Features |
|--------|-----------------|
| **Kareem Naous** | User Dashboard, Login, Register, Dark Mode |
| **Perla Imad** | List View, Book Detail, Services, Responsive Design |
| **Kareem Hammoud** | Homepage, Events, Catalog |
| **Rayan Madi** | Add Book, Edit Book, Author Detail |

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

### Running Locally

```bash
# 1. Clone the repository
git clone https://github.com/Kareemalhammoud/library-1.git
cd library-1

# 2. Install dependencies
#    The --legacy-peer-deps flag is required due to a peer dependency conflict
#    between Vite and Tailwind CSS v4's PostCSS plugin.
npm install --legacy-peer-deps

# 3. Start the development server
npm run dev

# 4. Open in your browser
#    http://localhost:5173
```

> **Note:** The project uses a manual `postcss.config.js` configured with `@tailwindcss/postcss` due to a breaking API change in Tailwind CSS v4.

### Building for Production

```bash
npm run build
npm run preview
```

---

## Screenshots & Features

### Homepage (`/`)

![Homepage](./screenshots/homepage.png)

The landing page features a hero section with a Ken Burns-style animation cycling through LAU campus photos. Dynamic CTAs adapt based on login state — "Get Started" for guests, "Explore the Catalog" for authenticated users. Real LAU library statistics are displayed (1.1M+ resources, 185 online databases, 8,000+ students served, 517+ reading seats). An infinite-scroll book carousel with pause-on-hover behavior, built using `useLayoutEffect` and the Web Animations API, is also included alongside an upcoming events preview.

---

### Book Catalog (`/catalog`)

![Book Catalog](./screenshots/catalog.png)

A fully searchable catalog of 53 books with advanced filtering. Features a full-text search bar with an advanced search modal (title, author, subject, format, year range). Multi-criteria filter bar covers availability, resource type, language, subject, campus, and year. Grid and list view toggle, sorting options (relevance, title, author, year, availability), and an admin mode — restricted to `admin@lau.edu` — for adding and editing books via a modal form. Responsive across all breakpoints.

---

### List View (`/catalog/list`)

![List View](./screenshots/listview.png)

A searchable, filterable, and paginated catalog view.

- Real-time search by title and/or author
- Filters: genre, language, campus, and availability
- Sorting: alphabetical (A–Z / Z–A), year (newest / oldest), rating (highest / lowest)
- Pagination with 12 items per page and scroll-to-top behavior
- Skeleton loading states with shimmer animation to simulate async data fetching
- Responsive grid layout across mobile, tablet, and desktop

---

### Book Detail (`/books/:id`)

![Book Detail](./screenshots/bookdetail.png)

A detailed view for individual books.

- Responsive layout across mobile, tablet, and desktop
- Borrow confirmation modal with confirmation and success states; includes authentication check
- Reading progress slider persisted to `localStorage` per book
- Share button with inline "Copied!" feedback state
- Related books section (shuffled via `useMemo` with `[book.id, book.genre]` dependencies to prevent re-shuffling on re-render)
- Full book metadata: year, publisher, ISBN, pages, language, campus, rating, availability status, and copy count

---

### Services (`/services`)

![Services](./screenshots/services.png)

A multi-section page reflecting real LAU library services:

- **Borrowing & Renewals** — Circulation policies and loan rules
- **Study Room Booking** — Reservation form with campus, room, date, time slot, duration, and student ID validation; supports Beirut (RNL) and Byblos (JGJL/HSL) campuses
- **Printing, Scanning & Photocopying** — Overview of shared printing resources across library floors
- **Writing & Communication Center** — Session booking information for essay, citation, and research support
- **Ask a Librarian** — Simulated real-time chat interface

All sections are fully responsive.

---

### Events (`/events`)

![Events](./screenshots/events.png)

- Hero section with a 3-panel image mosaic layout
- Featured event spotlight with full details (date, time, location, speaker, seats remaining)
- Category filter tabs: Workshops, Author Talks, Exhibitions, Book Clubs, Film, and more
- Multi-criteria filtering by month, format (In-Person / Online), and text search
- Active filter count badge with a clear-all action
- Event cards with date badges, category color coding, and location/time details
- Filtering optimized with `useMemo`

---

### User Dashboard (`/dashboard`)

> _Screenshot coming soon — Kareem Naous_

A protected route requiring authentication. Displays user profile information, supports editable username and profile picture upload (stored as base64 in `localStorage`), and shows the full loan history with per-loan renewal functionality.

---

### Login & Register (`/login`, `/register`)

> _Screenshot coming soon — Kareem Naous_

**Login:** Email and password validation with error handling. Redirects to the originally requested page using `location.state.from`. Credentials are verified against data stored in `localStorage`.

**Register:** Validates username, email, and password with enforced password strength requirements. Prevents duplicate account creation.

---

### Add / Edit Book (`/books/add`, `/books/:id/edit`)

![Add/Edit Book](./screenshots/add-edit-book.png)

A dynamic form that handles both adding new books and editing existing entries. When editing, the form is pre-filled with existing data from the global context. Key features include:

- Image upload with real-time cover preview
- Author biography system with optional editing; auto-populates from a local dictionary if left empty
- Campus handling: Beirut, Byblos, or both — with proper fallback logic
- Data normalization: language (EN / FR), numeric type conversions
- Form validation and structured data handling
- Integration with global `BooksContext` for state management

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
