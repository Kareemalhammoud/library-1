const pool = require("../config/db");

const normalizeString = (value) => {
  if (typeof value !== "string") return "";
  return value.trim();
};

const normalizeCopies = (value) => {
  const copies = Number(value);
  if (!Number.isInteger(copies) || copies < 0) {
    return null;
  }
  return copies;
};

const buildCoverUrl = (book) => {
  const savedImage = normalizeString(book.image);

  if (savedImage) {
    return savedImage;
  }

  const isbn = normalizeString(book.isbn).replace(/-/g, "");

  if (!isbn) {
    return "";
  }

  return `https://covers.openlibrary.org/b/isbn/${isbn}-L.jpg?default=false`;
};

const formatBook = (book) => {
  return {
    ...book,
    image: buildCoverUrl(book),
  };
};

// GET /api/books
const getBooks = async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT * FROM books ORDER BY created_at DESC"
    );

    res.json(rows.map(formatBook));
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

    res.json(formatBook(rows[0]));
  } catch (error) {
    console.error("getBookById error:", error);
    res.status(500).json({ message: "Failed to fetch book" });
  }
};

// POST /api/books
const createBook = async (req, res) => {
  try {
    const title = normalizeString(req.body.title);
    const author = normalizeString(req.body.author);
    const category = normalizeString(req.body.category);
    const description = normalizeString(req.body.description);
    const image = normalizeString(req.body.image);
    const publisher = normalizeString(req.body.publisher);
    const isbn = normalizeString(req.body.isbn);
    const campus = normalizeString(req.body.campus) || "Beirut";
    const language = normalizeString(req.body.language) || "English";
    const authorBiography = normalizeString(req.body.authorBiography);
    const year = req.body.year ? Number(req.body.year) : null;
    const pages = req.body.pages ? Number(req.body.pages) : null;
    const rating = req.body.rating ? Number(req.body.rating) : null;
    const availableCopies = req.body.availableCopies ?? 1;

    if (!title || !author || !category) {
      return res.status(400).json({
        message: "Title, author, and category are required",
      });
    }

    const normalizedCopies = normalizeCopies(availableCopies);

    if (normalizedCopies === null) {
      return res.status(400).json({
        message: "availableCopies must be a whole number greater than or equal to 0",
      });
    }

    const [result] = await pool.query(
      `INSERT INTO books
      (
        title,
        author,
        publisher,
        category,
        isbn,
        description,
        authorBiography,
        image,
        available_copies,
        year,
        pages,
        rating,
        campus,
        language,
        created_by
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        title,
        author,
        publisher,
        category,
        isbn,
        description,
        authorBiography,
        image,
        normalizedCopies,
        year,
        pages,
        rating,
        campus,
        language,
        req.user.id,
      ]
    );

    const [rows] = await pool.query(
      "SELECT * FROM books WHERE id = ?",
      [result.insertId]
    );

    res.status(201).json(formatBook(rows[0]));
  } catch (error) {
    console.error("createBook error:", error);
    res.status(500).json({ message: "Failed to create book" });
  }
};

// PUT /api/books/:id
const updateBook = async (req, res) => {
  try {
    const title = normalizeString(req.body.title);
    const author = normalizeString(req.body.author);
    const category = normalizeString(req.body.category);
    const description = normalizeString(req.body.description);
    const image = normalizeString(req.body.image);
    const publisher = normalizeString(req.body.publisher);
    const isbn = normalizeString(req.body.isbn);
    const campus = normalizeString(req.body.campus) || "Beirut";
    const language = normalizeString(req.body.language) || "English";
    const authorBiography = normalizeString(req.body.authorBiography);
    const year = req.body.year ? Number(req.body.year) : null;
    const pages = req.body.pages ? Number(req.body.pages) : null;
    const rating = req.body.rating ? Number(req.body.rating) : null;
    const availableCopies = req.body.availableCopies ?? 1;

    if (!title || !author || !category) {
      return res.status(400).json({
        message: "Title, author, and category are required",
      });
    }

    const normalizedCopies = normalizeCopies(availableCopies);

    if (normalizedCopies === null) {
      return res.status(400).json({
        message: "availableCopies must be a whole number greater than or equal to 0",
      });
    }

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
       SET
         title = ?,
         author = ?,
         publisher = ?,
         category = ?,
         isbn = ?,
         description = ?,
         authorBiography = ?,
         image = ?,
         available_copies = ?,
         year = ?,
         pages = ?,
         rating = ?,
         campus = ?,
         language = ?
       WHERE id = ?`,
      [
        title,
        author,
        publisher,
        category,
        isbn,
        description,
        authorBiography,
        image,
        normalizedCopies,
        year,
        pages,
        rating,
        campus,
        language,
        req.params.id,
      ]
    );

    const [updatedRows] = await pool.query(
      "SELECT * FROM books WHERE id = ?",
      [req.params.id]
    );

    res.json(formatBook(updatedRows[0]));
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