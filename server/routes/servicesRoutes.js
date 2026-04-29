const express = require("express");
const {
  getStudyRoomBookings,
  createStudyRoomBooking,
  updateStudyRoomBookingStatus,
  getHelpRequests,
  createHelpRequest,
  updateHelpRequestStatus,
} = require("../controllers/servicesController");

const router = express.Router();

router.get("/study-room-bookings", getStudyRoomBookings);
router.post("/study-room-bookings", createStudyRoomBooking);
router.patch("/study-room-bookings/:id/status", updateStudyRoomBookingStatus);

router.get("/services/study-rooms", getStudyRoomBookings);
router.post("/services/study-rooms", createStudyRoomBooking);
router.patch("/services/study-rooms/:id/status", updateStudyRoomBookingStatus);

router.get("/help-requests", getHelpRequests);
router.post("/help-requests", createHelpRequest);
router.patch("/help-requests/:id/status", updateHelpRequestStatus);

router.get("/services/help-requests", getHelpRequests);
router.post("/services/help-requests", createHelpRequest);
router.patch("/services/help-requests/:id/status", updateHelpRequestStatus);

module.exports = router;
