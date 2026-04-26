const pool = require("../config/db");

const ADMIN_EMAIL = "admin@lau.edu";
const isAdmin = (user) => user?.email === ADMIN_EMAIL;

// Cache the books-table column set after the first request. The schema
// doesn't change at runtime, and SHOW COLUMNS adds a round-trip per call —
// noticeable when the DB is in a different region than the API.
let cachedColumns = null;
let cachedColumnMeta = null;
async function getBookColumns() {
  if (cachedColumns) return cachedColumns;
  const [rows] = await pool.query("SHOW COLUMNS FROM books");
  cachedColumnMeta = new Map(rows.map((row) => [row.Field, row]));
  cachedColumns = new Set(rows.map((row) => row.Field));
  return cachedColumns;
}

async function getBookColumnMeta() {
  if (cachedColumnMeta) return cachedColumnMeta;
  await getBookColumns();
  return cachedColumnMeta;
}

const normalizeString = (value) => {
  if (typeof value !== "string") return "";
  return value.trim();
};

const parseOptionalInt = (value) => {
  if (value === undefined || value === null || value === "") return null;
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return null;
  return Math.trunc(parsed);
};

const parseOptionalNumber = (value) => {
  if (value === undefined || value === null || value === "") return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

function getVarcharLength(type) {
  const match = /^varchar\((\d+)\)/i.exec(type || "");
  return match ? Number.parseInt(match[1], 10) : null;
}

function normalizeLanguageForColumn(language, columnMeta) {
  const value = normalizeString(language);
  if (!value) return "";

  const maxLength = getVarcharLength(columnMeta?.Type);
  if (maxLength !== null && maxLength <= 4) {
    if (/^fr(ench)?$/i.test(value)) return "FR";
    if (/^en(glish)?$/i.test(value)) return "EN";
  }

  return value;
}

function bookSelectSql(columns) {
  const has = (name) => columns.has(name);

  const idExpr = has("id") ? "id" : "NULL AS id";
  const titleExpr = has("title") ? "title" : "NULL AS title";
  const authorExpr = has("author") ? "author" : "NULL AS author";
  const genreExpr = has("genre")
    ? "genre"
    : has("category")
      ? "category AS genre"
      : "NULL AS genre";
  const languageExpr = has("language") ? "language" : "NULL AS language";
  const campusExpr = has("campus") ? "campus" : "NULL AS campus";
  const yearExpr = has("year") ? "year" : "NULL AS year";
  const ratingExpr = has("rating") ? "rating" : "NULL AS rating";
  const pagesExpr = has("pages") ? "pages" : "NULL AS pages";
  const publisherExpr = has("publisher") ? "publisher" : "NULL AS publisher";
  const isbnExpr = has("isbn") ? "isbn" : "NULL AS isbn";
  const descriptionExpr = has("description") ? "description" : "NULL AS description";
  const authorBiographyExpr = has("authorBiography") ? "authorBiography" : "NULL AS authorBiography";
  const coverExpr = has("cover")
    ? "cover"
    : has("image")
      ? "image AS cover"
      : "NULL AS cover";
  const colorExpr = has("color") ? "color" : "NULL AS color";
  const genreColorExpr = has("genre_color") ? "genre_color AS genreColor" : "NULL AS genreColor";
  const badgeExpr = has("badge") ? "badge" : "NULL AS badge";
  const copiesExpr = has("available_copies")
    ? "available_copies AS copies"
    : has("copies")
      ? "copies"
      : "0 AS copies";

  return `
    ${idExpr}, ${titleExpr}, ${authorExpr}, ${genreExpr}, ${languageExpr},
    ${campusExpr}, ${yearExpr}, ${ratingExpr}, ${pagesExpr}, ${publisherExpr},
    ${isbnExpr}, ${descriptionExpr}, ${authorBiographyExpr}, ${coverExpr},
    ${colorExpr}, ${genreColorExpr}, ${badgeExpr}, ${copiesExpr}
  `;
}

function makePlaceholderCover(title, author) {
  const safeTitle = normalizeString(title) || "Untitled";
  const safeAuthor = normalizeString(author) || "Unknown Author";
  const escapedTitle = safeTitle.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const escapedAuthor = safeAuthor.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

  const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="300" height="450" viewBox="0 0 300 450">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#f1f5f3"/>
      <stop offset="100%" stop-color="#dfe8e4"/>
    </linearGradient>
  </defs>
  <rect width="300" height="450" fill="url(#bg)"/>
  <rect x="16" y="16" width="268" height="418" rx="14" fill="none" stroke="#c0cec7" stroke-width="2"/>
  <text x="150" y="165" text-anchor="middle" font-family="Arial, sans-serif" font-size="18" font-weight="700" fill="#21312a">
    ${escapedTitle.slice(0, 28)}
  </text>
  <text x="150" y="198" text-anchor="middle" font-family="Arial, sans-serif" font-size="18" font-weight="700" fill="#21312a">
    ${escapedTitle.slice(28, 56)}
  </text>
  <text x="150" y="255" text-anchor="middle" font-family="Arial, sans-serif" font-size="14" fill="#3b544a">
    ${escapedAuthor.slice(0, 34)}
  </text>
</svg>`;

  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

function normalizeBookRow(row) {
  const cover = normalizeString(row.cover);
  return {
    ...row,
    cover: cover || makePlaceholderCover(row.title, row.author)
  };
}

function buildCreatedBookFallback(id, payload) {
  return normalizeBookRow({
    id,
    title: payload.title,
    author: payload.author,
    genre: payload.genre || null,
    language: payload.language || null,
    campus: payload.campus || null,
    year: payload.year,
    rating: payload.rating,
    pages: payload.pages,
    publisher: payload.publisher || null,
    isbn: payload.isbn || null,
    description: payload.description || null,
    authorBiography: payload.authorBiography || null,
    cover: payload.cover || null,
    color: null,
    genreColor: null,
    badge: null,
    copies: payload.copies ?? 0
  });
}

const getAllBooks = async (req, res) => {
  try {
    const { search, genre, language, limit } = req.query;
    const columns = await getBookColumns();

    const conditions = [];
    const params = [];
    const genreColumn = columns.has("genre") ? "genre" : columns.has("category") ? "category" : null;
    const languageColumn = columns.has("language") ? "language" : null;
    const publisherColumn = columns.has("publisher") ? "publisher" : null;
    const isbnColumn = columns.has("isbn") ? "isbn" : null;

    if (search) {
      const like = `%${search}%`;
      const searchClauses = ["title LIKE ?", "author LIKE ?"];
      params.push(like, like);
      if (isbnColumn) {
        searchClauses.push(`${isbnColumn} LIKE ?`);
        params.push(like);
      }
      if (genreColumn) {
        searchClauses.push(`${genreColumn} LIKE ?`);
        params.push(like);
      }
      if (publisherColumn) {
        searchClauses.push(`${publisherColumn} LIKE ?`);
        params.push(like);
      }
      conditions.push(
        `(${searchClauses.join(" OR ")})`
      );
    }

    if (genre && genre !== "All" && genreColumn) {
      conditions.push(`${genreColumn} = ?`);
      params.push(genre);
    }

    if (language && languageColumn) {
      conditions.push(`${languageColumn} = ?`);
      params.push(language);
    }

    let sql = `SELECT ${bookSelectSql(columns)} FROM books`;
    if (conditions.length > 0) sql += ` WHERE ${conditions.join(" AND ")}`;
    sql += " ORDER BY id ASC";

    // Cap with LIMIT only when a valid positive integer is provided.
    const parsedLimit = Number.parseInt(limit, 10);
    if (Number.isInteger(parsedLimit) && parsedLimit > 0) {
      sql += " LIMIT ?";
      params.push(parsedLimit);
    }

    const [rows] = await pool.query(sql, params);
    res.json(rows.map(normalizeBookRow));
  } catch (error) {
    console.error("Get books error:", error);
    res.status(500).json({ message: "Failed to load books" });
  }
};

const getBookById = async (req, res) => {
  try {
    const bookId = Number.parseInt(req.params.id, 10);
    const columns = await getBookColumns();
    if (!Number.isInteger(bookId)) {
      return res.status(400).json({ message: "Invalid book id" });
    }

    const [rows] = await pool.query(
      `SELECT ${bookSelectSql(columns)} FROM books WHERE id = ?`,
      [bookId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "Book not found" });
    }

    res.json(normalizeBookRow(rows[0]));
  } catch (error) {
    console.error("Get book error:", error);
    res.status(500).json({ message: "Failed to load book" });
  }
};

const createBook = async (req, res) => {
  try {
    const columns = await getBookColumns();
    const columnMeta = await getBookColumnMeta();
    const title = normalizeString(req.body.title);
    const author = normalizeString(req.body.author);
    const genre = normalizeString(req.body.genre || req.body.category);
    const language = normalizeLanguageForColumn(req.body.language, columnMeta.get("language"));
    const campus = normalizeString(req.body.campus);
    const publisher = normalizeString(req.body.publisher);
    const isbn = normalizeString(req.body.isbn);
    const description = normalizeString(req.body.description);
    const authorBiography = normalizeString(req.body.authorBiography);
    const cover = normalizeString(req.body.cover || req.body.image || req.body.coverImage);
    const year = parseOptionalInt(req.body.year);
    const pages = parseOptionalInt(req.body.pages);
    const rating = parseOptionalNumber(req.body.rating);
    const copies = parseOptionalInt(req.body.availableCopies ?? req.body.copies);

    if (!title || !author) {
      return res.status(400).json({ message: "Title and author are required" });
    }

    if (copies !== null && copies < 0) {
      return res.status(400).json({ message: "Copies cannot be negative" });
    }

    const fields = [];
    const values = [];
    const addField = (name, value, includeWhenEmpty = false) => {
      if (!columns.has(name)) return;
      if (!includeWhenEmpty && (value === "" || value === undefined)) return;
      fields.push(name);
      values.push(value);
    };

    addField("title", title, true);
    addField("author", author, true);
    if (columns.has("genre")) addField("genre", genre || null, true);
    if (columns.has("category")) addField("category", genre || null, true);
    addField("language", language || null, true);
    addField("campus", campus || null, true);
    addField("publisher", publisher || null, true);
    addField("isbn", isbn || null, true);
    addField("description", description || null, true);
    addField("authorBiography", authorBiography || null, true);
    addField("cover", cover || null, true);
    addField("image", cover || null, true);
    addField("year", year, true);
    addField("pages", pages, true);
    addField("rating", rating, true);
    if (copies !== null) {
      addField("available_copies", copies, true);
      addField("copies", copies, true);
    }
    if (columns.has("created_by")) addField("created_by", req.user.id, true);

    const placeholders = fields.map(() => "?").join(", ");
    const [result] = await pool.query(
      `INSERT INTO books (${fields.join(", ")}) VALUES (${placeholders})`,
      values
    );

    try {
      const [rows] = await pool.query(
        `SELECT ${bookSelectSql(columns)} FROM books WHERE id = ?`,
        [result.insertId]
      );

      if (rows.length > 0) {
        return res.status(201).json(normalizeBookRow(rows[0]));
      }
    } catch (readError) {
      console.error("Create book reload warning:", readError);
    }

    res.status(201).json(
      buildCreatedBookFallback(result.insertId, {
        title,
        author,
        genre,
        language,
        campus,
        year,
        rating,
        pages,
        publisher,
        isbn,
        description,
        authorBiography,
        cover,
        copies
      })
    );
  } catch (error) {
    console.error("Create book error:", error);
    res.status(500).json({ message: "Failed to create book" });
  }
};

const updateBook = async (req, res) => {
  try {
    const bookId = Number.parseInt(req.params.id, 10);
    if (!Number.isInteger(bookId)) {
      return res.status(400).json({ message: "Invalid book id" });
    }

    const columns = await getBookColumns();
    const columnMeta = await getBookColumnMeta();
    const [existingRows] = await pool.query("SELECT * FROM books WHERE id = ?", [bookId]);
    if (existingRows.length === 0) {
      return res.status(404).json({ message: "Book not found" });
    }

    const existing = existingRows[0];
    if (columns.has("created_by") && existing.created_by !== null && existing.created_by !== req.user.id && !isAdmin(req.user)) {
      return res.status(403).json({ message: "Not authorized to update this book" });
    }

    const title = normalizeString(req.body.title);
    const author = normalizeString(req.body.author);
    const genre = normalizeString(req.body.genre || req.body.category);
    const language = normalizeLanguageForColumn(req.body.language, columnMeta.get("language"));
    const campus = normalizeString(req.body.campus);
    const publisher = normalizeString(req.body.publisher);
    const isbn = normalizeString(req.body.isbn);
    const description = normalizeString(req.body.description);
    const authorBiography = normalizeString(req.body.authorBiography);
    const cover = normalizeString(req.body.cover || req.body.image || req.body.coverImage);
    const year = parseOptionalInt(req.body.year);
    const pages = parseOptionalInt(req.body.pages);
    const rating = parseOptionalNumber(req.body.rating);
    const copies = parseOptionalInt(req.body.availableCopies ?? req.body.copies);

    if (!title || !author) {
      return res.status(400).json({ message: "Title and author are required" });
    }

    if (copies !== null && copies < 0) {
      return res.status(400).json({ message: "Copies cannot be negative" });
    }

    const sets = [];
    const values = [];
    const addSet = (name, value) => {
      if (!columns.has(name)) return;
      sets.push(`${name} = ?`);
      values.push(value);
    };

    addSet("title", title);
    addSet("author", author);
    if (columns.has("genre")) addSet("genre", genre || null);
    if (columns.has("category")) addSet("category", genre || null);
    addSet("language", language || null);
    addSet("campus", campus || null);
    addSet("publisher", publisher || null);
    addSet("isbn", isbn || null);
    addSet("description", description || null);
    addSet("authorBiography", authorBiography || null);
    addSet("cover", cover || null);
    addSet("image", cover || null);
    addSet("year", year);
    addSet("pages", pages);
    addSet("rating", rating);
    if (copies !== null) {
      addSet("available_copies", copies);
      addSet("copies", copies);
    }

    if (sets.length === 0) {
      return res.status(400).json({ message: "No valid fields to update" });
    }

    values.push(bookId);
    await pool.query(`UPDATE books SET ${sets.join(", ")} WHERE id = ?`, values);

    const [rows] = await pool.query(
      `SELECT ${bookSelectSql(columns)} FROM books WHERE id = ?`,
      [bookId]
    );

    res.json(normalizeBookRow(rows[0]));
  } catch (error) {
    console.error("Update book error:", error);
    res.status(500).json({ message: "Failed to update book" });
  }
};

const deleteBook = async (req, res) => {
  try {
    const bookId = Number.parseInt(req.params.id, 10);
    if (!Number.isInteger(bookId)) {
      return res.status(400).json({ message: "Invalid book id" });
    }

    const columns = await getBookColumns();
    const [existingRows] = await pool.query("SELECT * FROM books WHERE id = ?", [bookId]);
    if (existingRows.length === 0) {
      return res.status(404).json({ message: "Book not found" });
    }

    const existing = existingRows[0];
    if (columns.has("created_by") && existing.created_by !== null && existing.created_by !== req.user.id && !isAdmin(req.user)) {
      return res.status(403).json({ message: "Not authorized to delete this book" });
    }

    await pool.query("DELETE FROM books WHERE id = ?", [bookId]);
    res.json({ message: "Book deleted successfully" });
  } catch (error) {
    console.error("Delete book error:", error);
    res.status(500).json({ message: "Failed to delete book" });
  }
};

module.exports = {
  getAllBooks,
  getBookById,
  createBook,
  updateBook,
  deleteBook
};

