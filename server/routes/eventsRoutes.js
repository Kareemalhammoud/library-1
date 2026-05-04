const express = require("express");
const {
  getAllEvents,
  getEventById,
  getMyEventRegistrations,
  registerForEvent,
  cancelEventRegistration,
  createEvent,
  updateEvent,
  deleteEvent
} = require("../controllers/eventsController");
const authMiddleware = require("../middleware/authMiddleware");
const adminOnly = require("../middleware/adminOnly");

const router = express.Router();

// Public reads
router.get("/", getAllEvents);
router.get("/registrations/me", authMiddleware, getMyEventRegistrations);
router.post("/:id/register", authMiddleware, registerForEvent);
router.delete("/:id/register", authMiddleware, cancelEventRegistration);
router.get("/:id", getEventById);

// Admin-only writes
router.post("/", authMiddleware, adminOnly, createEvent);
router.put("/:id", authMiddleware, adminOnly, updateEvent);
router.delete("/:id", authMiddleware, adminOnly, deleteEvent);

module.exports = router;
