const mysql = require("mysql2/promise");
require("dotenv").config();
const { databaseOptions } = require("./databaseOptions");

const pool = mysql.createPool(databaseOptions({
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
}));

module.exports = pool;
