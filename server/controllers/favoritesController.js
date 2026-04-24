const pool = require("../config/db");

// Same aliasing as booksController so the favorites list returns books in the
// exact shape the frontend already consumes.
const BOOK_COLUMNS = `
  books.id, books.title, books.author, books.genre, books.language,
  books.year, books.rating, books.pages, books.publisher, books.isbn,
  books.description, books.cover, books.color,
  books.genre_color AS genreColor, books.badge
`;

const getFavorites = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT ${BOOK_COLUMNS}
       FROM favorites
       JOIN books ON favorites.book_id = books.id
       WHERE favorites.user_id = ?
       ORDER BY favorites.created_at DESC`,
      [req.user.id]
    );
    res.json(rows);
  } catch (error) {
    console.error("Get favorites error:", error);
    res.status(500).json({ message: "Failed to load favorites" });
  }
};

const addFavorite = async (req, res) => {
  try {
    const bookId = Number.parseInt(req.params.bookId, 10);
    if (!Number.isInteger(bookId)) {
      return res.status(400).json({ message: "Invalid book id" });
    }

    // Confirm book exists — otherwise the FK insert would fail with a less
    // friendly 500 error.
    const [books] = await pool.query("SELECT id FROM books WHERE id = ?", [bookId]);
    if (books.length === 0) {
      return res.status(404).json({ message: "Book not found" });
    }

    // INSERT IGNORE silently no-ops if the (user_id, book_id) pair already
    // exists, so calling "favorite" twice is idempotent.
    await pool.query(
      "INSERT IGNORE INTO favorites (user_id, book_id) VALUES (?, ?)",
      [req.user.id, bookId]
    );

    res.status(201).json({ message: "Added to favorites", bookId });
  } catch (error) {
    console.error("Add favorite error:", error);
    res.status(500).json({ message: "Failed to add favorite" });
  }
};

const removeFavorite = async (req, res) => {
  try {
    const bookId = Number.parseInt(req.params.bookId, 10);
    if (!Number.isInteger(bookId)) {
      return res.status(400).json({ message: "Invalid book id" });
    }

    await pool.query(
      "DELETE FROM favorites WHERE user_id = ? AND book_id = ?",
      [req.user.id, bookId]
    );

    res.json({ message: "Removed from favorites", bookId });
  } catch (error) {
    console.error("Remove favorite error:", error);
    res.status(500).json({ message: "Failed to remove favorite" });
  }
};

module.exports = {
  getFavorites,
  addFavorite,
  removeFavorite
};
