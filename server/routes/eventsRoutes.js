const express = require("express");
const {
  getAllEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent
} = require("../controllers/eventsController");
const authMiddleware = require("../middleware/authMiddleware");
const adminOnly = require("../middleware/adminOnly");

const router = express.Router();

router.get("/", getAllEvents);
router.get("/:id", getEventById);

router.post("/", authMiddleware, adminOnly, createEvent);
router.put("/:id", authMiddleware, adminOnly, updateEvent);
router.delete("/:id", authMiddleware, adminOnly, deleteEvent);

module.exports = router;