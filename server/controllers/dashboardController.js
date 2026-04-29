const pool = require("../config/db");

let cachedCoverExpr = null;
async function getCoverExpr() {
  if (cachedCoverExpr !== null) return cachedCoverExpr;
  const [rows] = await pool.query("SHOW COLUMNS FROM books");
  const cols = new Set(rows.map((r) => r.Field));
  cachedCoverExpr = cols.has("cover")
    ? "books.cover"
    : cols.has("image")
      ? "books.image AS cover"
      : "NULL AS cover";
  return cachedCoverExpr;
}

const getDashboardData = async (req, res) => {
  try {
    const userId = req.user.id;
    const coverExpr = await getCoverExpr();

    // active loans (not returned)
    const [activeLoans] = await pool.query(
      `SELECT loans.id, books.id AS book_id, books.title, books.author, ${coverExpr},
              loans.borrow_date, loans.due_date, loans.renew_count, loans.status
       FROM loans
       JOIN books ON loans.book_id = books.id
       WHERE loans.user_id = ? AND loans.return_date IS NULL`,
      [userId]
    );

    // full history
    const [history] = await pool.query(
      `SELECT loans.id, books.id AS book_id, books.title, books.author, ${coverExpr},
              loans.borrow_date, loans.due_date, loans.return_date, loans.renew_count, loans.status
       FROM loans
       JOIN books ON loans.book_id = books.id
       WHERE loans.user_id = ?
       ORDER BY loans.created_at DESC`,
      [userId]
    );

    // overdue loans
    const [overdue] = await pool.query(
      `SELECT loans.id, books.id AS book_id, books.title, books.author, ${coverExpr},
              loans.due_date, loans.renew_count
       FROM loans
       JOIN books ON loans.book_id = books.id
       WHERE loans.user_id = ?
       AND loans.return_date IS NULL
       AND loans.due_date < CURDATE()`,
      [userId]
    );

    // renewals (loans that were renewed)
    const [renewals] = await pool.query(
      `SELECT loans.id, books.id AS book_id, books.title, ${coverExpr},
              loans.renew_count, loans.due_date
       FROM loans
       JOIN books ON loans.book_id = books.id
       WHERE loans.user_id = ? AND loans.renew_count > 0`,
      [userId]
    );

    res.json({
      activeLoans,
      history,
      overdue,
      renewals
    });
  } catch (error) {
    console.error("Dashboard error:", error);
    res.status(500).json({ message: "Failed to load dashboard data" });
  }
};

module.exports = {
  getDashboardData
};