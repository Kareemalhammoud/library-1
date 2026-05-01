const pool = require("../config/db");

let progressTableReady = false;

async function ensureProgressTable() {
  if (progressTableReady) return;

  await pool.query(`
    CREATE TABLE IF NOT EXISTS reading_progress (
      user_id INT NOT NULL,
      book_id INT NOT NULL,
      progress TINYINT NOT NULL DEFAULT 0,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      PRIMARY KEY (user_id, book_id),
      CONSTRAINT fk_reading_progress_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      CONSTRAINT fk_reading_progress_book FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE,
      CONSTRAINT chk_reading_progress_value CHECK (progress BETWEEN 0 AND 100)
    )
  `);

  progressTableReady = true;
}

function parseBookId(req) {
  const bookId = Number.parseInt(req.params.bookId, 10);
  return Number.isInteger(bookId) ? bookId : null;
}

function parseProgress(value) {
  const progress = Number(value);
  if (!Number.isFinite(progress)) return null;
  return Math.max(0, Math.min(100, Math.round(progress)));
}

const getReadingProgress = async (req, res) => {
  try {
    const bookId = parseBookId(req);
    if (bookId === null) {
      return res.status(400).json({ message: "Invalid book id" });
    }

    await ensureProgressTable();

    const [books] = await pool.query("SELECT id FROM books WHERE id = ?", [bookId]);
    if (books.length === 0) {
      return res.status(404).json({ message: "Book not found" });
    }

    const [rows] = await pool.query(
      "SELECT progress, updated_at AS updatedAt FROM reading_progress WHERE user_id = ? AND book_id = ?",
      [req.user.id, bookId]
    );

    res.json({
      bookId,
      progress: rows[0]?.progress ?? 0,
      updatedAt: rows[0]?.updatedAt ?? null
    });
  } catch (error) {
    console.error("Get reading progress error:", error);
    res.status(500).json({ message: "Failed to load reading progress" });
  }
};

const updateReadingProgress = async (req, res) => {
  try {
    const bookId = parseBookId(req);
    const progress = parseProgress(req.body.progress);

    if (bookId === null) {
      return res.status(400).json({ message: "Invalid book id" });
    }
    if (progress === null) {
      return res.status(400).json({ message: "Invalid reading progress" });
    }

    await ensureProgressTable();

    const [books] = await pool.query("SELECT id FROM books WHERE id = ?", [bookId]);
    if (books.length === 0) {
      return res.status(404).json({ message: "Book not found" });
    }

    await pool.query(
      `INSERT INTO reading_progress (user_id, book_id, progress)
       VALUES (?, ?, ?)
       ON DUPLICATE KEY UPDATE progress = VALUES(progress), updated_at = CURRENT_TIMESTAMP`,
      [req.user.id, bookId, progress]
    );

    res.json({ bookId, progress });
  } catch (error) {
    console.error("Update reading progress error:", error);
    res.status(500).json({ message: "Failed to save reading progress" });
  }
};

module.exports = {
  getReadingProgress,
  updateReadingProgress
};
