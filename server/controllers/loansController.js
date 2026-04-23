const pool = require("../config/db");

const LOAN_PERIOD_DAYS = 14;

// Return columns shaped to match what the dashboard controller emits, so
// the two endpoints are interchangeable from the frontend's point of view.
const LOAN_COLUMNS = `
  loans.id, books.id AS book_id, books.title, books.author,
  loans.borrow_date, loans.due_date, loans.return_date,
  loans.renew_count, loans.status
`;

const getActiveLoans = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT ${LOAN_COLUMNS}
       FROM loans
       JOIN books ON loans.book_id = books.id
       WHERE loans.user_id = ? AND loans.return_date IS NULL
       ORDER BY loans.created_at DESC`,
      [req.user.id]
    );
    res.json(rows);
  } catch (error) {
    console.error("Get loans error:", error);
    res.status(500).json({ message: "Failed to load loans" });
  }
};

const createLoan = async (req, res) => {
  try {
    const bookId = Number.parseInt(req.body.bookId, 10);
    if (!Number.isInteger(bookId)) {
      return res.status(400).json({ message: "Invalid book id" });
    }

    // 404 fast if the book does not exist, so the frontend gets a clear
    // error instead of an opaque FK violation.
    const [books] = await pool.query("SELECT id FROM books WHERE id = ?", [bookId]);
    if (books.length === 0) {
      return res.status(404).json({ message: "Book not found" });
    }

    // Only one active loan per (user, book) pair. Returned loans don't count —
    // a user can borrow the same book again after returning it.
    const [existing] = await pool.query(
      `SELECT id FROM loans
       WHERE user_id = ? AND book_id = ? AND return_date IS NULL`,
      [req.user.id, bookId]
    );
    if (existing.length > 0) {
      return res.status(409).json({ message: "You already have this book on loan" });
    }

    const borrowDate = new Date();
    const dueDate = new Date(borrowDate);
    dueDate.setDate(dueDate.getDate() + LOAN_PERIOD_DAYS);

    const toDateString = (d) => {
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, "0");
      const day = String(d.getDate()).padStart(2, "0");
      return `${y}-${m}-${day}`;
    };

    const [result] = await pool.query(
      `INSERT INTO loans (user_id, book_id, borrow_date, due_date, status)
       VALUES (?, ?, ?, ?, 'active')`,
      [req.user.id, bookId, toDateString(borrowDate), toDateString(dueDate)]
    );

    const [rows] = await pool.query(
      `SELECT ${LOAN_COLUMNS}
       FROM loans JOIN books ON loans.book_id = books.id
       WHERE loans.id = ?`,
      [result.insertId]
    );

    res.status(201).json(rows[0]);
  } catch (error) {
    console.error("Create loan error:", error);
    res.status(500).json({ message: "Failed to borrow book" });
  }
};

module.exports = {
  getActiveLoans,
  createLoan
};
