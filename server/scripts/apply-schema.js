// One-shot helper to apply server/db/schema.sql against the DB defined in
// server/.env. Used during deployment setup; not wired into npm scripts.
// Run with: node scripts/apply-schema.js  (from /server)

const fs = require("fs");
const path = require("path");
const mysql = require("mysql2/promise");
const { databaseOptions } = require("../config/databaseOptions");

require("dotenv").config();

async function main() {
  const sql = fs.readFileSync(
    path.resolve(__dirname, "../db/schema.sql"),
    "utf8"
  );

  const conn = await mysql.createConnection(databaseOptions({
    multipleStatements: true,
  }));

  await conn.query(sql);
  await conn.end();
  console.log("Schema applied to", process.env.DB_HOST);
}

main().catch((err) => {
  console.error("Failed to apply schema:", err);
  process.exit(1);
});
