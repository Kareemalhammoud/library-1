const express = require("express");
const {
  getAllEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent
} = require("../controllers/eventsController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// Public reads
router.get("/", getAllEvents);
router.get("/:id", getEventById);

// Protected writes — only the event's creator can edit or delete it
router.post("/", authMiddleware, createEvent);
router.put("/:id", authMiddleware, updateEvent);
router.delete("/:id", authMiddleware, deleteEvent);

module.exports = router;
