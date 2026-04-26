// One-shot migration: adds books.created_by + the FK to users(id), so the
// owner-only checks in booksController.js (which were already conditional on
// the column existing) actually take effect. Idempotent.
//   node scripts/migrate-add-book-owner.js

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

  const [colExists] = await conn.query(
    "SHOW COLUMNS FROM books LIKE 'created_by'"
  );
  if (colExists.length === 0) {
    await conn.query("ALTER TABLE books ADD COLUMN created_by INT NULL");
    console.log("Added books.created_by column");
  } else {
    console.log("books.created_by already present — skipping ADD COLUMN");
  }

  // FK is added separately so we can detect whether it already exists. Adding
  // a duplicate FK fails with ER_FK_DUP_NAME — the catch keeps this script
  // idempotent across reruns.
  try {
    await conn.query(
      `ALTER TABLE books
       ADD CONSTRAINT fk_books_creator
       FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL`
    );
    console.log("Added fk_books_creator FK");
  } catch (err) {
    if (err.code === "ER_FK_DUP_NAME" || err.code === "ER_DUP_KEYNAME") {
      console.log("fk_books_creator already exists — skipping");
    } else {
      throw err;
    }
  }

  const [check] = await conn.query(
    "SELECT COUNT(*) AS total, SUM(created_by IS NULL) AS unowned FROM books"
  );
  console.log("After migration:", check[0]);

  await conn.end();
})().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
