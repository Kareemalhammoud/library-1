const pool = require("../config/db");

const VALID_CAMPUSES = new Set(["Beirut", "Byblos"]);
const STUDY_ROOM_STATUSES = new Set(["pending", "confirmed", "cancelled"]);
const HELP_STATUSES = new Set(["open", "in_progress", "resolved"]);
const ROOM_CAMPUS = new Map([
  ["RNL-805", "Beirut"],
  ["RNL-806A", "Beirut"],
  ["RNL-806B", "Beirut"],
  ["RNL-807A", "Beirut"],
  ["RNL-807B", "Beirut"],
  ["JGJL-204", "Byblos"],
  ["JGJL-302", "Byblos"],
  ["JGJL-401", "Byblos"],
  ["JGJL-402", "Byblos"],
  ["JGJL-403", "Byblos"],
  ["JGJL-404", "Byblos"],
  ["JGJL-406", "Byblos"],
  ["JGJL-407", "Byblos"],
  ["JGJL-408", "Byblos"],
  ["JGJL-501", "Byblos"],
  ["JGJL-506", "Byblos"],
  ["HSL-3103", "Byblos"],
  ["HSL-3105", "Byblos"],
  ["HSL-3106", "Byblos"],
]);
const VALID_DURATIONS = new Set(["30 minutes", "1 hour", "2 hours"]);
const VALID_TIMES = new Set(["08:00", "10:00", "12:00", "14:00", "16:00"]);
const TIME_SLOTS = Array.from(VALID_TIMES);

const normalizeString = (value) => (typeof value === "string" ? value.trim() : "");
const isValidLauId = (value) => /^\d{8,9}$/.test(value);

const parsePositiveInt = (value) => {
  const parsed = Number.parseInt(value, 10);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
};

const isValidDateString = (value) => /^\d{4}-\d{2}-\d{2}$/.test(value);

const isRealDateString = (value) => {
  if (!isValidDateString(value)) return false;
  const date = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
};

const getStudyRoomBookings = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT id, campus, room, DATE_FORMAT(booking_date, '%Y-%m-%d') AS date, start_time AS time,
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

const getStudyRoomAvailability = async (req, res) => {
  try {
    const room = normalizeString(req.query.room);
    const date = normalizeString(req.query.date);
    const campus = normalizeString(req.query.campus);

    if (!ROOM_CAMPUS.has(room)) {
      return res.status(400).json({ message: "Unknown study room" });
    }

    if (campus && (!VALID_CAMPUSES.has(campus) || ROOM_CAMPUS.get(room) !== campus)) {
      return res.status(400).json({ message: "Selected room does not belong to the selected campus" });
    }

    if (!isRealDateString(date)) {
      return res.status(400).json({ message: "Date must use YYYY-MM-DD format" });
    }

    const [rows] = await pool.query(
      `SELECT start_time AS time, status
       FROM study_room_bookings
       WHERE room = ? AND booking_date = ?
         AND status IN ('pending', 'confirmed')`,
      [room, date]
    );

    const bookedTimes = new Set(rows.map((row) => row.time));

    res.json({
      campus: ROOM_CAMPUS.get(room),
      room,
      date,
      slots: TIME_SLOTS.map((time) => ({
        time,
        available: !bookedTimes.has(time),
      })),
    });
  } catch (error) {
    console.error("Get study room availability error:", error);
    res.status(500).json({ message: "Failed to load study room availability" });
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

    if (!isValidLauId(studentId)) {
      return res.status(400).json({ message: "LAU ID must be 8 or 9 digits" });
    }

    if (!isRealDateString(date)) {
      return res.status(400).json({ message: "Date must use YYYY-MM-DD format" });
    }

    if (!people || people > 20) {
      return res.status(400).json({ message: "Group size must be between 1 and 20 people" });
    }

    if (!ROOM_CAMPUS.has(room)) {
      return res.status(400).json({ message: "Unknown study room" });
    }

    if (ROOM_CAMPUS.get(room) !== campus) {
      return res.status(400).json({ message: "Selected room does not belong to the selected campus" });
    }

    if (!VALID_DURATIONS.has(duration)) {
      return res.status(400).json({ message: "Invalid booking duration" });
    }

    if (!VALID_TIMES.has(time)) {
      return res.status(400).json({ message: "Invalid time slot" });
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
      `SELECT id, campus, room, DATE_FORMAT(booking_date, '%Y-%m-%d') AS date, start_time AS time,
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
  getStudyRoomAvailability,
  createStudyRoomBooking,
  updateStudyRoomBookingStatus,
  getHelpRequests,
  createHelpRequest,
  updateHelpRequestStatus,
};
