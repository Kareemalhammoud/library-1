// One-shot migration: adds the available_copies column to the books table
// (idempotent) and backfills any 0/missing values to 3. Run from /server.
//   node scripts/migrate-add-copies.js

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

  const [existing] = await conn.query(
    "SHOW COLUMNS FROM books LIKE 'available_copies'"
  );
  if (existing.length === 0) {
    await conn.query(
      "ALTER TABLE books ADD COLUMN available_copies INT NOT NULL DEFAULT 3"
    );
    console.log("Added available_copies column (default 3)");
  } else {
    console.log("available_copies already present — skipping ADD COLUMN");
  }

  const [result] = await conn.query(
    "UPDATE books SET available_copies = 3 WHERE available_copies = 0"
  );
  console.log(`Backfilled ${result.affectedRows} rows to copies=3`);

  const [check] = await conn.query(
    "SELECT COUNT(*) AS total, MIN(available_copies) AS min, MAX(available_copies) AS max FROM books"
  );
  console.log("After migration:", check[0]);

  await conn.end();
})().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
