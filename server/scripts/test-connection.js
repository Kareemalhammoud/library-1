// Quick connection test using the same TLS policy as the application.

const mysql = require("mysql2/promise");
require("dotenv").config();
const { databaseOptions } = require("../config/databaseOptions");

const baseConfig = databaseOptions({
  connectTimeout: 10000,
});

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
  await tryConnect("configured", {});
})();
