const express = require("express");
const {
  getStudyRoomBookings,
  getStudyRoomAvailability,
  createStudyRoomBooking,
  updateStudyRoomBookingStatus,
  getHelpRequests,
  createHelpRequest,
  updateHelpRequestStatus,
} = require("../controllers/servicesController");
const authMiddleware = require("../middleware/authMiddleware");
const adminOnly = require("../middleware/adminOnly");

const router = express.Router();

router.get("/study-room-bookings/availability", getStudyRoomAvailability);
router.get("/study-room-bookings", authMiddleware, adminOnly, getStudyRoomBookings);
router.post("/study-room-bookings", createStudyRoomBooking);
router.patch("/study-room-bookings/:id/status", authMiddleware, adminOnly, updateStudyRoomBookingStatus);

router.get("/services/study-rooms/availability", getStudyRoomAvailability);
router.get("/services/study-rooms", authMiddleware, adminOnly, getStudyRoomBookings);
router.post("/services/study-rooms", createStudyRoomBooking);
router.patch("/services/study-rooms/:id/status", authMiddleware, adminOnly, updateStudyRoomBookingStatus);

router.get("/help-requests", authMiddleware, adminOnly, getHelpRequests);
router.post("/help-requests", createHelpRequest);
router.patch("/help-requests/:id/status", authMiddleware, adminOnly, updateHelpRequestStatus);

router.get("/services/help-requests", authMiddleware, adminOnly, getHelpRequests);
router.post("/services/help-requests", createHelpRequest);
router.patch("/services/help-requests/:id/status", authMiddleware, adminOnly, updateHelpRequestStatus);

module.exports = router;
