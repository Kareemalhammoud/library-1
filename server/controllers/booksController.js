const pool = require("../config/db");

// Alias columns back to the camelCase shape the React pages expect.
const BOOK_COLUMNS = `
  id, title, author, genre, language, year, rating, pages,
  publisher, isbn, description, cover, color,
  genre_color AS genreColor, badge
`;

const getAllBooks = async (req, res) => {
  try {
    const { search, genre, language, limit } = req.query;

    const conditions = [];
    const params = [];

    if (search) {
      const like = `%${search}%`;
      conditions.push(
        "(title LIKE ? OR author LIKE ? OR isbn LIKE ? OR genre LIKE ? OR publisher LIKE ?)"
      );
      params.push(like, like, like, like, like);
    }

    if (genre && genre !== "All") {
      conditions.push("genre = ?");
      params.push(genre);
    }

    if (language) {
      conditions.push("language = ?");
      params.push(language);
    }

    let sql = `SELECT ${BOOK_COLUMNS} FROM books`;
    if (conditions.length > 0) sql += ` WHERE ${conditions.join(" AND ")}`;
    sql += " ORDER BY id ASC";

    // Cap with LIMIT only when a valid positive integer is provided.
    const parsedLimit = Number.parseInt(limit, 10);
    if (Number.isInteger(parsedLimit) && parsedLimit > 0) {
      sql += " LIMIT ?";
      params.push(parsedLimit);
    }

    const [rows] = await pool.query(sql, params);
    res.json(rows);
  } catch (error) {
    console.error("Get books error:", error);
    res.status(500).json({ message: "Failed to load books" });
  }
};

const getBookById = async (req, res) => {
  try {
    const bookId = Number.parseInt(req.params.id, 10);
    if (!Number.isInteger(bookId)) {
      return res.status(400).json({ message: "Invalid book id" });
    }

    const [rows] = await pool.query(
      `SELECT ${BOOK_COLUMNS} FROM books WHERE id = ?`,
      [bookId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "Book not found" });
    }

    res.json(rows[0]);
  } catch (error) {
    console.error("Get book error:", error);
    res.status(500).json({ message: "Failed to load book" });
  }
};

module.exports = {
  getAllBooks,
  getBookById
};
