const pool = require("../config/db");

// COALESCE the user's real name over the anonymous reviewer_name column so a
// single `reviewer_name` field in the response works for both seeded reviews
// (null user) and user-submitted ones.
const REVIEW_COLUMNS = `
  reviews.id, reviews.book_id AS bookId, reviews.user_id AS userId,
  COALESCE(users.full_name, reviews.reviewer_name) AS reviewer_name,
  reviews.rating, reviews.comment, reviews.created_at AS createdAt
`;

const getReviewsForBook = async (req, res) => {
  try {
    const bookId = Number.parseInt(req.params.bookId, 10);
    if (!Number.isInteger(bookId)) {
      return res.status(400).json({ message: "Invalid book id" });
    }

    const [rows] = await pool.query(
      `SELECT ${REVIEW_COLUMNS}
       FROM reviews
       LEFT JOIN users ON reviews.user_id = users.id
       WHERE reviews.book_id = ?
       ORDER BY reviews.created_at DESC`,
      [bookId]
    );

    res.json(rows);
  } catch (error) {
    console.error("Get reviews error:", error);
    res.status(500).json({ message: "Failed to load reviews" });
  }
};

const createReview = async (req, res) => {
  try {
    const bookId = Number.parseInt(req.params.bookId, 10);
    if (!Number.isInteger(bookId)) {
      return res.status(400).json({ message: "Invalid book id" });
    }

    const rating = Number.parseInt(req.body.rating, 10);
    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      return res.status(400).json({ message: "Rating must be between 1 and 5" });
    }

    const comment = typeof req.body.comment === "string" ? req.body.comment.trim() : "";

    const [books] = await pool.query("SELECT id FROM books WHERE id = ?", [bookId]);
    if (books.length === 0) {
      return res.status(404).json({ message: "Book not found" });
    }

    // One review per user per book — re-reviewing updates the existing row so
    // users don't accidentally stack duplicate reviews.
    const [existing] = await pool.query(
      "SELECT id FROM reviews WHERE book_id = ? AND user_id = ?",
      [bookId, req.user.id]
    );

    let reviewId;
    if (existing.length > 0) {
      reviewId = existing[0].id;
      await pool.query(
        "UPDATE reviews SET rating = ?, comment = ? WHERE id = ?",
        [rating, comment || null, reviewId]
      );
    } else {
      const [result] = await pool.query(
        `INSERT INTO reviews (book_id, user_id, rating, comment)
         VALUES (?, ?, ?, ?)`,
        [bookId, req.user.id, rating, comment || null]
      );
      reviewId = result.insertId;
    }

    const [rows] = await pool.query(
      `SELECT ${REVIEW_COLUMNS}
       FROM reviews
       LEFT JOIN users ON reviews.user_id = users.id
       WHERE reviews.id = ?`,
      [reviewId]
    );

    res.status(existing.length > 0 ? 200 : 201).json(rows[0]);
  } catch (error) {
    console.error("Create review error:", error);
    res.status(500).json({ message: "Failed to submit review" });
  }
};

const deleteReview = async (req, res) => {
  try {
    const reviewId = Number.parseInt(req.params.id, 10);
    if (!Number.isInteger(reviewId)) {
      return res.status(400).json({ message: "Invalid review id" });
    }

    const [existing] = await pool.query(
      "SELECT user_id FROM reviews WHERE id = ?",
      [reviewId]
    );

    if (existing.length === 0) {
      return res.status(404).json({ message: "Review not found" });
    }

    // Seeded reviews (user_id = null) are immutable via the public API; only
    // the original author may delete their own review.
    if (existing[0].user_id !== req.user.id) {
      return res.status(403).json({ message: "Not authorized to delete this review" });
    }

    await pool.query("DELETE FROM reviews WHERE id = ?", [reviewId]);
    res.json({ message: "Review deleted" });
  } catch (error) {
    console.error("Delete review error:", error);
    res.status(500).json({ message: "Failed to delete review" });
  }
};

module.exports = {
  getReviewsForBook,
  createReview,
  deleteReview
};
