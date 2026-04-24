const express = require("express");
const {
  getReviewsForBook,
  createReview,
  deleteReview
} = require("../controllers/reviewsController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// Public read for each book's review list
router.get("/book/:bookId", getReviewsForBook);

// Authenticated writes
router.post("/book/:bookId", authMiddleware, createReview);
router.delete("/:id", authMiddleware, deleteReview);

module.exports = router;
