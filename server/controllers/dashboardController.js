const pool = require("../config/db");

const getDashboardData = async (req, res) => {
  try {
    const userId = req.user.id;

    // active loans (not returned)
    const [activeLoans] = await pool.query(
      `SELECT loans.id, books.id AS book_id, books.title, books.author, books.cover, loans.borrow_date, loans.due_date, loans.renew_count, loans.status
       FROM loans
       JOIN books ON loans.book_id = books.id
       WHERE loans.user_id = ? AND loans.return_date IS NULL`,
      [userId]
    );

    // full history
    const [history] = await pool.query(
      `SELECT loans.id, books.id AS book_id, books.title, books.author, books.cover, loans.borrow_date, loans.due_date, loans.return_date, loans.renew_count, loans.status
       FROM loans
       JOIN books ON loans.book_id = books.id
       WHERE loans.user_id = ?
       ORDER BY loans.created_at DESC`,
      [userId]
    );

    // overdue loans
    const [overdue] = await pool.query(
      `SELECT loans.id, books.id AS book_id, books.title, books.author, books.cover, loans.due_date, loans.renew_count
       FROM loans
       JOIN books ON loans.book_id = books.id
       WHERE loans.user_id = ?
       AND loans.return_date IS NULL
       AND loans.due_date < CURDATE()`,
      [userId]
    );

    // renewals (loans that were renewed)
    const [renewals] = await pool.query(
      `SELECT loans.id, books.id AS book_id, books.title, books.cover, loans.renew_count, loans.due_date
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