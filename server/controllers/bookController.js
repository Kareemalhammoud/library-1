const pool = require("../config/db");

// GET /api/books
const getBooks = async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT * FROM books ORDER BY created_at DESC"
    );
    res.json(rows);
  } catch (error) {
    console.error("getBooks error:", error);
    res.status(500).json({ message: "Failed to fetch books" });
  }
};

// GET /api/books/:id
const getBookById = async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT * FROM books WHERE id = ?",
      [req.params.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "Book not found" });
    }

    res.json(rows[0]);
  } catch (error) {
    console.error("getBookById error:", error);
    res.status(500).json({ message: "Failed to fetch book" });
  }
};

// POST /api/books
const createBook = async (req, res) => {
  try {
    const { title, author, category, description, image, availableCopies } = req.body;

    if (!title || !author || !category) {
      return res.status(400).json({
        message: "Title, author, and category are required",
      });
    }

    const [result] = await pool.query(
      `INSERT INTO books
      (title, author, category, description, image, available_copies, created_by)
      VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        title,
        author,
        category,
        description || "",
        image || "",
        availableCopies ?? 1,
        req.user.id,
      ]
    );

    const [rows] = await pool.query(
      "SELECT * FROM books WHERE id = ?",
      [result.insertId]
    );

    res.status(201).json(rows[0]);
  } catch (error) {
    console.error("createBook error:", error);
    res.status(500).json({ message: "Failed to create book" });
  }
};

// PUT /api/books/:id
const updateBook = async (req, res) => {
  try {
    const { title, author, category, description, image, availableCopies } = req.body;

    const [rows] = await pool.query(
      "SELECT * FROM books WHERE id = ?",
      [req.params.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "Book not found" });
    }

    const book = rows[0];

    if (book.created_by !== req.user.id) {
      return res.status(403).json({
        message: "Not authorized to update this book",
      });
    }

    await pool.query(
      `UPDATE books
       SET title = ?, author = ?, category = ?, description = ?, image = ?, available_copies = ?
       WHERE id = ?`,
      [
        title,
        author,
        category,
        description || "",
        image || "",
        availableCopies ?? 1,
        req.params.id,
      ]
    );

    const [updatedRows] = await pool.query(
      "SELECT * FROM books WHERE id = ?",
      [req.params.id]
    );

    res.json(updatedRows[0]);
  } catch (error) {
    console.error("updateBook error:", error);
    res.status(500).json({ message: "Failed to update book" });
  }
};

// DELETE /api/books/:id
const deleteBook = async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT * FROM books WHERE id = ?",
      [req.params.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "Book not found" });
    }

    const book = rows[0];

    if (book.created_by !== req.user.id) {
      return res.status(403).json({
        message: "Not authorized to delete this book",
      });
    }

    await pool.query("DELETE FROM books WHERE id = ?", [req.params.id]);

    res.json({ message: "Book deleted successfully" });
  } catch (error) {
    console.error("deleteBook error:", error);
    res.status(500).json({ message: "Failed to delete book" });
  }
};

module.exports = {
  getBooks,
  getBookById,
  createBook,
  updateBook,
  deleteBook,
};