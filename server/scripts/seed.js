// Populates the `books` and `events` tables from the arrays in
// src/data/bookData.js and src/data/eventsData.js. Safe to re-run: it
// clears the two tables first (and clears dependent tables first because
// loans and registrations foreign-key into books/events). Run with:
// `npm run seed` from /server.

const path = require("path");
const { pathToFileURL } = require("url");

require("dotenv").config();

const pool = require("../config/db");

const BOOK_DATA_PATH = path.resolve(__dirname, "../../src/data/bookData.js");
const EVENTS_DATA_PATH = path.resolve(__dirname, "../../src/data/eventsData.js");

async function loadFrontendData() {
  // bookData.js / eventsData.js are ES modules — use dynamic import.
  const bookModule = await import(pathToFileURL(BOOK_DATA_PATH).href);
  const eventsModule = await import(pathToFileURL(EVENTS_DATA_PATH).href);
  return { books: bookModule.BOOKS, events: eventsModule.EVENTS };
}

async function seedBooks(books) {
  // With AUTO_INCREMENT, MySQL replaces id=0 with the next auto value unless
  // NO_AUTO_VALUE_ON_ZERO is set — which would collide with the real id=1 row.
  await pool.query(
    "SET SESSION sql_mode = CONCAT(@@SESSION.sql_mode, ',NO_AUTO_VALUE_ON_ZERO')"
  );
  await pool.query("DELETE FROM books");
  await pool.query("ALTER TABLE books AUTO_INCREMENT = 1");

  const values = books.map((b) => [
    b.id,
    b.title,
    b.author,
    b.genre ?? null,
    b.language ?? null,
    b.year ?? null,
    b.rating ?? null,
    b.pages ?? null,
    b.publisher ?? null,
    b.isbn ?? null,
    b.description ?? null,
    b.cover ?? null,
    b.color ?? null,
    b.genreColor ?? null,
    b.badge ?? null,
    b.availableCopies ?? 3,
  ]);

  await pool.query(
    `INSERT INTO books
      (id, title, author, genre, language, year, rating, pages,
       publisher, isbn, description, cover, color, genre_color, badge,
       available_copies)
     VALUES ?`,
    [values]
  );

  console.log(`Seeded ${books.length} books.`);
}

// Hand-picked reviews so the feature isn't empty on a fresh DB. user_id is
// null (anonymous); reviewer_name stands in for who wrote it.
const HARDCODED_REVIEWS = [
  { book_id: 0, reviewer_name: "Nour K.", rating: 5, comment: "Made me fall in love with art history. Gombrich writes like a patient friend." },
  { book_id: 0, reviewer_name: "Rania M.", rating: 4, comment: "Dense in the best way. Took me months but worth every page." },
  { book_id: 2, reviewer_name: "Karim H.", rating: 5, comment: "The prose is unreal. I keep rereading the last chapter." },
  { book_id: 2, reviewer_name: "Lea S.", rating: 4, comment: "Shorter than I expected, but it stays with you." },
  { book_id: 4, reviewer_name: "Sara M.", rating: 5, comment: "Jane's voice is so modern it's startling. Still a favorite after many rereads." },
  { book_id: 8, reviewer_name: "Omar T.", rating: 4, comment: "Couldn't put it down. The arena scenes are wild." },
  { book_id: 8, reviewer_name: "Maya J.", rating: 5, comment: "One of those rare YA books that actually has something to say." },
  { book_id: 25, reviewer_name: "Rayan M.", rating: 5, comment: "The only book I've read cover-to-cover in two days. A perfect adventure." },
  { book_id: 25, reviewer_name: "Perla I.", rating: 4, comment: "Cozy and epic at the same time. Bilbo is the best." },
  { book_id: 40, reviewer_name: "Nadim A.", rating: 5, comment: "Harari makes huge history feel intimate. Changed how I think about agriculture." },
  { book_id: 44, reviewer_name: "Jana B.", rating: 5, comment: "The scope is breathtaking. Worth pushing through the first 100 pages." },
  { book_id: 44, reviewer_name: "Fadi R.", rating: 4, comment: "Politics, ecology, religion, and spice — Herbert doesn't waste a page." },
];

async function seedReviews() {
  await pool.query("DELETE FROM reviews");
  await pool.query("ALTER TABLE reviews AUTO_INCREMENT = 1");

  const values = HARDCODED_REVIEWS.map((r) => [
    r.book_id, null, r.reviewer_name, r.rating, r.comment,
  ]);

  await pool.query(
    `INSERT INTO reviews (book_id, user_id, reviewer_name, rating, comment)
     VALUES ?`,
    [values]
  );

  console.log(`Seeded ${HARDCODED_REVIEWS.length} reviews.`);
}

async function seedEvents(events) {
  await pool.query("DELETE FROM events");
  await pool.query("ALTER TABLE events AUTO_INCREMENT = 1");

  const values = events.map((e) => [
    e.id,
    e.title,
    e.date,
    e.time ?? null,
    e.location ?? null,
    e.category ?? null,
    e.format ?? null,
    e.featured ? 1 : 0,
    e.image ?? null,
    e.description ?? null,
    e.longDescription ?? null,
    e.speaker ?? null,
    e.seats ?? null,
    e.registered ?? null,
    e.audience ?? null,
    e.takeaway ?? null,
    e.highlights ? JSON.stringify(e.highlights) : null,
  ]);

  await pool.query(
    `INSERT INTO events
      (id, title, date, time, location, category, format, featured,
       image, description, long_description, speaker, seats, registered,
       audience, takeaway, highlights)
     VALUES ?`,
    [values]
  );

  console.log(`Seeded ${events.length} events.`);
}

async function main() {
  try {
    const { books, events } = await loadFrontendData();
    // Loans + reviews reference books, so they must go before we wipe books.
    await pool.query("DELETE FROM loans");
    await pool.query("DELETE FROM reviews");
    await pool.query("DELETE FROM event_registrations");
    await seedBooks(books);
    await seedEvents(events);
    await seedReviews();
    console.log("Seed complete.");
    process.exit(0);
  } catch (error) {
    console.error("Seed failed:", error);
    process.exit(1);
  }
}

main();
