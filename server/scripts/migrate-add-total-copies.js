// One-shot migration: adds the total_copies column to the books table
// (idempotent) and backfills it from available_copies + active loan count.
// Run from /server:
//   node scripts/migrate-add-total-copies.js

const mysql = require("mysql2/promise");
require("dotenv").config();

(async () => {
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 3306,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    ssl: process.env.DB_SSL === "true" ? { rejectUnauthorized: false } : undefined,
  });

  const [existing] = await conn.query("SHOW COLUMNS FROM books LIKE 'total_copies'");
  if (existing.length === 0) {
    await conn.query("ALTER TABLE books ADD COLUMN total_copies INT NOT NULL DEFAULT 3");
    console.log("Added total_copies column (default 3)");
  } else {
    console.log("total_copies already present — skipping ADD COLUMN");
  }

  // Backfill: total = available + currently borrowed (active loans).
  // For books that have no loans, this just sets total = available_copies.
  const [result] = await conn.query(`
    UPDATE books b
    LEFT JOIN (
      SELECT book_id, COUNT(*) AS active_count
      FROM loans
      WHERE return_date IS NULL
      GROUP BY book_id
    ) l ON l.book_id = b.id
    SET b.total_copies = b.available_copies + COALESCE(l.active_count, 0)
  `);
  console.log(`Backfilled total_copies on ${result.affectedRows} rows`);

  const [check] = await conn.query(
    "SELECT COUNT(*) AS total, MIN(total_copies) AS min, MAX(total_copies) AS max FROM books"
  );
  console.log("After migration:", check[0]);

  await conn.end();
})().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
