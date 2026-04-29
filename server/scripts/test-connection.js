// Quick connection test for the Railway MySQL using whatever env is set.
// Tries with and without SSL and reports which one worked.

const mysql = require("mysql2/promise");
require("dotenv").config();

const baseConfig = {
  host: process.env.DB_HOST,
  port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 3306,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  connectTimeout: 10000,
};

async function tryConnect(label, extra) {
  try {
    const conn = await mysql.createConnection({ ...baseConfig, ...extra });
    const [rows] = await conn.query("SELECT COUNT(*) AS n FROM books");
    await conn.end();
    console.log(`[${label}] OK — books table has ${rows[0].n} rows`);
  } catch (err) {
    console.log(`[${label}] FAIL — ${err.code || ""} ${err.message}`);
  }
}

(async () => {
  console.log("Testing host:", baseConfig.host, "port:", baseConfig.port);
  await tryConnect("no-ssl", {});
  await tryConnect("ssl-relaxed", { ssl: { rejectUnauthorized: false } });
  await tryConnect("ssl-strict", { ssl: {} });
})();
