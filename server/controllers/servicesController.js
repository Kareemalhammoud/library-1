const pool = require("../config/db");

const VALID_CAMPUSES = new Set(["Beirut", "Byblos"]);
const STUDY_ROOM_STATUSES = new Set(["pending", "confirmed", "cancelled"]);
const HELP_STATUSES = new Set(["open", "in_progress", "resolved"]);

const normalizeString = (value) => (typeof value === "string" ? value.trim() : "");

const parsePositiveInt = (value) => {
  const parsed = Number.parseInt(value, 10);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
};

const isValidDateString = (value) => /^\d{4}-\d{2}-\d{2}$/.test(value);

const getStudyRoomBookings = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT id, campus, room, booking_date AS date, start_time AS time,
              duration, people, student_id AS studentId, requested_at AS requestedAt,
              status, notes, created_at AS createdAt
       FROM study_room_bookings
       ORDER BY booking_date DESC, start_time DESC, created_at DESC`
    );

    res.json({ bookings: rows });
  } catch (error) {
    console.error("Get study room bookings error:", error);
    res.status(500).json({ message: "Failed to load study room bookings" });
  }
};

const createStudyRoomBooking = async (req, res) => {
  try {
    const campus = normalizeString(req.body.campus);
    const room = normalizeString(req.body.room);
    const date = normalizeString(req.body.date);
    const time = normalizeString(req.body.time);
    const duration = normalizeString(req.body.duration);
    const people = parsePositiveInt(req.body.people);
    const studentId = normalizeString(req.body.studentId || req.body.student_id);
    const notes = normalizeString(req.body.notes);

    if (!VALID_CAMPUSES.has(campus)) {
      return res.status(400).json({ message: "Campus must be Beirut or Byblos" });
    }

    if (!room || !date || !time || !duration || !studentId) {
      return res.status(400).json({ message: "Room, date, duration, time, and student ID are required" });
    }

    if (!isValidDateString(date)) {
      return res.status(400).json({ message: "Date must use YYYY-MM-DD format" });
    }

    if (!people || people > 20) {
      return res.status(400).json({ message: "Group size must be between 1 and 20 people" });
    }

    const [conflicts] = await pool.query(
      `SELECT id FROM study_room_bookings
       WHERE room = ? AND booking_date = ? AND start_time = ?
         AND status IN ('pending', 'confirmed')
       LIMIT 1`,
      [room, date, time]
    );

    if (conflicts.length > 0) {
      return res.status(409).json({ message: "This room is already booked for that date and time" });
    }

    const [result] = await pool.query(
      `INSERT INTO study_room_bookings
       (campus, room, booking_date, start_time, duration, people, student_id, requested_at, status, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'confirmed', ?)`,
      [
        campus,
        room,
        date,
        time,
        duration,
        people,
        studentId,
        req.body.requestedAt ? new Date(req.body.requestedAt) : new Date(),
        notes || null,
      ]
    );

    const [rows] = await pool.query(
      `SELECT id, campus, room, booking_date AS date, start_time AS time,
              duration, people, student_id AS studentId, requested_at AS requestedAt,
              status, notes, created_at AS createdAt
       FROM study_room_bookings
       WHERE id = ?`,
      [result.insertId]
    );

    res.status(201).json({
      message: "Study room booking confirmed",
      booking: rows[0],
    });
  } catch (error) {
    console.error("Create study room booking error:", error);
    res.status(500).json({ message: "Failed to create study room booking" });
  }
};

const updateStudyRoomBookingStatus = async (req, res) => {
  try {
    const bookingId = Number.parseInt(req.params.id, 10);
    const status = normalizeString(req.body.status);

    if (!Number.isInteger(bookingId)) {
      return res.status(400).json({ message: "Invalid booking id" });
    }

    if (!STUDY_ROOM_STATUSES.has(status)) {
      return res.status(400).json({ message: "Invalid booking status" });
    }

    const [result] = await pool.query(
      "UPDATE study_room_bookings SET status = ? WHERE id = ?",
      [status, bookingId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Study room booking not found" });
    }

    res.json({ message: "Study room booking updated", id: bookingId, status });
  } catch (error) {
    console.error("Update study room booking error:", error);
    res.status(500).json({ message: "Failed to update study room booking" });
  }
};

const getHelpRequests = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT id, name, email, message, requested_at AS requestedAt,
              status, created_at AS createdAt
       FROM help_requests
       ORDER BY created_at DESC`
    );

    res.json({ requests: rows });
  } catch (error) {
    console.error("Get help requests error:", error);
    res.status(500).json({ message: "Failed to load help requests" });
  }
};

const createHelpRequest = async (req, res) => {
  try {
    const message = normalizeString(req.body.message || req.body.text);
    const name = normalizeString(req.body.name);
    const email = normalizeString(req.body.email);

    if (!message) {
      return res.status(400).json({ message: "Message is required" });
    }

    const [result] = await pool.query(
      `INSERT INTO help_requests (name, email, message, requested_at, status)
       VALUES (?, ?, ?, ?, 'open')`,
      [
        name || null,
        email || null,
        message,
        req.body.requestedAt ? new Date(req.body.requestedAt) : new Date(),
      ]
    );

    const [rows] = await pool.query(
      `SELECT id, name, email, message, requested_at AS requestedAt,
              status, created_at AS createdAt
       FROM help_requests
       WHERE id = ?`,
      [result.insertId]
    );

    res.status(201).json({
      message: "Help request received",
      request: rows[0],
    });
  } catch (error) {
    console.error("Create help request error:", error);
    res.status(500).json({ message: "Failed to create help request" });
  }
};

const updateHelpRequestStatus = async (req, res) => {
  try {
    const requestId = Number.parseInt(req.params.id, 10);
    const status = normalizeString(req.body.status);

    if (!Number.isInteger(requestId)) {
      return res.status(400).json({ message: "Invalid help request id" });
    }

    if (!HELP_STATUSES.has(status)) {
      return res.status(400).json({ message: "Invalid help request status" });
    }

    const [result] = await pool.query(
      "UPDATE help_requests SET status = ? WHERE id = ?",
      [status, requestId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Help request not found" });
    }

    res.json({ message: "Help request updated", id: requestId, status });
  } catch (error) {
    console.error("Update help request error:", error);
    res.status(500).json({ message: "Failed to update help request" });
  }
};

module.exports = {
  getStudyRoomBookings,
  createStudyRoomBooking,
  updateStudyRoomBookingStatus,
  getHelpRequests,
  createHelpRequest,
  updateHelpRequestStatus,
};
