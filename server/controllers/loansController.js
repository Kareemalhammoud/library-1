const pool = require("../config/db");

const LOAN_PERIOD_DAYS = 14;

// Return columns shaped to match what the dashboard controller emits, so
// the two endpoints are interchangeable from the frontend's point of view.
const LOAN_COLUMNS = `
  loans.id, books.id AS book_id, books.title, books.author,
  DATE_FORMAT(loans.borrow_date, '%Y-%m-%d') AS borrow_date,
  DATE_FORMAT(loans.due_date, '%Y-%m-%d') AS due_date,
  DATE_FORMAT(loans.return_date, '%Y-%m-%d') AS return_date,
  loans.renew_count, loans.status
`;

const toDateString = (d) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

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
    const bookId = Number.parseInt(req.body.bookId ?? req.params.bookId ?? req.params.id, 10);
    if (!Number.isInteger(bookId)) {
      return res.status(400).json({ message: "Invalid book id" });
    }

    // 404 fast if the book does not exist, so the frontend gets a clear
    // error instead of an opaque FK violation.
    const [books] = await pool.query(
      "SELECT id, available_copies FROM books WHERE id = ?",
      [bookId]
    );
    if (books.length === 0) {
      return res.status(404).json({ message: "Book not found" });
    }
    if (books[0].available_copies <= 0) {
      return res.status(409).json({ message: "No copies available right now" });
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

    const [result] = await pool.query(
      `INSERT INTO loans (user_id, book_id, borrow_date, due_date, status)
       VALUES (?, ?, ?, ?, 'active')`,
      [req.user.id, bookId, toDateString(borrowDate), toDateString(dueDate)]
    );

    // Decrement available copies. The WHERE clause guards against races —
    // if a concurrent borrow already drained the inventory, we roll back.
    const [decResult] = await pool.query(
      `UPDATE books SET available_copies = available_copies - 1
       WHERE id = ? AND available_copies > 0`,
      [bookId]
    );
    if (decResult.affectedRows === 0) {
      await pool.query("DELETE FROM loans WHERE id = ?", [result.insertId]);
      return res.status(409).json({ message: "No copies available right now" });
    }

    const [rows] = await pool.query(
      `SELECT ${LOAN_COLUMNS}
       FROM loans JOIN books ON loans.book_id = books.id
       WHERE loans.id = ?`,
      [result.insertId]
    );

    await pool.query(
      `UPDATE reservations
       SET status = 'fulfilled', fulfilled_at = NOW()
       WHERE user_id = ? AND book_id = ? AND status = 'active'`,
      [req.user.id, bookId]
    );

    res.status(201).json(rows[0]);
  } catch (error) {
    console.error("Create loan error:", error);
    res.status(500).json({ message: "Failed to borrow book" });
  }
};

const createReservation = async (req, res) => {
  try {
    const bookId = Number.parseInt(req.body.bookId ?? req.params.bookId ?? req.params.id, 10);
    if (!Number.isInteger(bookId)) {
      return res.status(400).json({ message: "Invalid book id" });
    }

    const [books] = await pool.query("SELECT id, available_copies FROM books WHERE id = ?", [bookId]);
    if (books.length === 0) {
      return res.status(404).json({ message: "Book not found" });
    }
    if (books[0].available_copies > 0) {
      return res.status(409).json({ message: "Copies are available right now. Borrow this book instead." });
    }

    const [activeLoans] = await pool.query(
      `SELECT id FROM loans
       WHERE user_id = ? AND book_id = ? AND return_date IS NULL`,
      [req.user.id, bookId]
    );
    if (activeLoans.length > 0) {
      return res.status(409).json({ message: "You already have this book on loan" });
    }

    const [existing] = await pool.query(
      `SELECT id FROM reservations
       WHERE user_id = ? AND book_id = ? AND status = 'active'`,
      [req.user.id, bookId]
    );
    if (existing.length > 0) {
      return res.status(409).json({ message: "You already reserved this book" });
    }

    const [result] = await pool.query(
      `INSERT INTO reservations (user_id, book_id, status)
       VALUES (?, ?, 'active')`,
      [req.user.id, bookId]
    );

    const [rows] = await pool.query(
      `SELECT reservations.id, books.id AS book_id, books.title, books.author,
              reservations.reserved_at, reservations.fulfilled_at, reservations.status
       FROM reservations
       JOIN books ON reservations.book_id = books.id
       WHERE reservations.id = ?`,
      [result.insertId]
    );

    res.status(201).json(rows[0]);
  } catch (error) {
    console.error("Create reservation error:", error);
    res.status(500).json({ message: "Failed to reserve book" });
  }
};

const returnLoan = async (req, res) => {
  try {
    const loanId = Number.parseInt(req.params.id, 10);
    if (!Number.isInteger(loanId)) {
      return res.status(400).json({ message: "Invalid loan id" });
    }

    const [rows] = await pool.query(
      "SELECT id, user_id, book_id, return_date FROM loans WHERE id = ?",
      [loanId]
    );
    if (rows.length === 0) {
      return res.status(404).json({ message: "Loan not found" });
    }

    const loan = rows[0];
    if (loan.user_id !== req.user.id) {
      return res.status(403).json({ message: "Not your loan" });
    }
    if (loan.return_date !== null) {
      return res.status(409).json({ message: "Loan already returned" });
    }

    await pool.query(
      `UPDATE loans SET return_date = ?, status = 'returned' WHERE id = ?`,
      [toDateString(new Date()), loanId]
    );
    await pool.query(
      `UPDATE books
       SET available_copies = LEAST(available_copies + 1, COALESCE(total_copies, available_copies + 1))
       WHERE id = ?`,
      [loan.book_id]
    );

    res.json({ message: "Loan returned" });
  } catch (error) {
    console.error("Return loan error:", error);
    res.status(500).json({ message: "Failed to return loan" });
  }
};

module.exports = {
  getActiveLoans,
  createLoan,
  createReservation,
  returnLoan
};
