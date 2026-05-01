const express = require("express");
const {
  getReadingProgress,
  updateReadingProgress
} = require("../controllers/readingProgressController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.use(authMiddleware);

router.get("/:bookId", getReadingProgress);
router.put("/:bookId", updateReadingProgress);

module.exports = router;
