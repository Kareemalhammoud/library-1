// One-shot helper to apply server/db/schema.sql against the DB defined in
// server/.env. Used during deployment setup; not wired into npm scripts.
// Run with: node scripts/apply-schema.js  (from /server)

const fs = require("fs");
const path = require("path");
const mysql = require("mysql2/promise");

require("dotenv").config();

async function main() {
  const sql = fs.readFileSync(
    path.resolve(__dirname, "../db/schema.sql"),
    "utf8"
  );

  const conn = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 3306,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    ssl: process.env.DB_SSL === "true" ? { rejectUnauthorized: false } : undefined,
    multipleStatements: true,
  });

  await conn.query(sql);
  await conn.end();
  console.log("Schema applied to", process.env.DB_HOST);
}

main().catch((err) => {
  console.error("Failed to apply schema:", err);
  process.exit(1);
});
