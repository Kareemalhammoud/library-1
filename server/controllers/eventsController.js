const pool = require("../config/db");

const EVENT_COLUMNS = `
  id, title, date, time, location, category, format,
  featured, image, description,
  long_description AS longDescription,
  speaker, seats, registered, audience, takeaway, highlights,
  created_by AS createdBy, created_at AS createdAt
`;

let registrationsTableReady = false;

async function ensureEventRegistrationsTable() {
  if (registrationsTableReady) return;

  await pool.query(`
    CREATE TABLE IF NOT EXISTS event_registrations (
      user_id       INT NOT NULL,
      event_id      INT NOT NULL,
      registered_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (user_id, event_id),
      INDEX idx_event_registrations_event (event_id),
      CONSTRAINT fk_event_registrations_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      CONSTRAINT fk_event_registrations_event FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE
    )
  `);

  registrationsTableReady = true;
}

// MySQL returns a DATE column as a JS Date in the local timezone, which can
// shift the day across midnight. The frontend wants "YYYY-MM-DD" strings, so
// format it ourselves.
const formatEventRow = (row) => {
  if (!row) return row;
  const copy = { ...row };
  if (copy.date instanceof Date) {
    const y = copy.date.getFullYear();
    const m = String(copy.date.getMonth() + 1).padStart(2, "0");
    const d = String(copy.date.getDate()).padStart(2, "0");
    copy.date = `${y}-${m}-${d}`;
  }
  return copy;
};

const getAllEvents = async (req, res) => {
  try {
    const { category, format, month, search, featured } = req.query;

    const conditions = [];
    const params = [];

    if (category && category !== "All") {
      conditions.push("category = ?");
      params.push(category);
    }

    if (format && format !== "All Formats") {
      conditions.push("format = ?");
      params.push(format);
    }

    if (month) {
      // month is an integer 1-12 — filter by MONTH(date).
      const parsedMonth = Number.parseInt(month, 10);
      if (Number.isInteger(parsedMonth) && parsedMonth >= 1 && parsedMonth <= 12) {
        conditions.push("MONTH(date) = ?");
        params.push(parsedMonth);
      }
    }

    if (search) {
      const like = `%${search}%`;
      conditions.push(
        "(title LIKE ? OR description LIKE ? OR location LIKE ? OR speaker LIKE ?)"
      );
      params.push(like, like, like, like);
    }

    if (featured === "true") {
      conditions.push("featured = 1");
    }

    let sql = `SELECT ${EVENT_COLUMNS} FROM events`;
    if (conditions.length > 0) sql += ` WHERE ${conditions.join(" AND ")}`;
    sql += " ORDER BY date ASC, id ASC";

    const [rows] = await pool.query(sql, params);
    res.json(rows.map(formatEventRow));
  } catch (error) {
    console.error("Get events error:", error);
    res.status(500).json({ message: "Failed to load events" });
  }
};

const getEventById = async (req, res) => {
  try {
    const eventId = Number.parseInt(req.params.id, 10);
    if (!Number.isInteger(eventId)) {
      return res.status(400).json({ message: "Invalid event id" });
    }

    const [rows] = await pool.query(
      `SELECT ${EVENT_COLUMNS} FROM events WHERE id = ?`,
      [eventId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "Event not found" });
    }

    res.json(formatEventRow(rows[0]));
  } catch (error) {
    console.error("Get event error:", error);
    res.status(500).json({ message: "Failed to load event" });
  }
};

const getMyEventRegistrations = async (req, res) => {
  try {
    await ensureEventRegistrationsTable();

    const [rows] = await pool.query(
      `SELECT
         er.event_id AS id,
         e.title,
         e.date,
         e.time,
         e.location,
         er.registered_at AS registeredAt
       FROM event_registrations er
       JOIN events e ON e.id = er.event_id
       WHERE er.user_id = ?
       ORDER BY e.date ASC, e.id ASC`,
      [req.user.id]
    );

    res.json(rows.map(formatEventRow));
  } catch (error) {
    console.error("Get event registrations error:", error);
    res.status(500).json({ message: "Failed to load event registrations" });
  }
};

const registerForEvent = async (req, res) => {
  const eventId = Number.parseInt(req.params.id, 10);
  if (!Number.isInteger(eventId)) {
    return res.status(400).json({ message: "Invalid event id" });
  }

  let connection;
  try {
    await ensureEventRegistrationsTable();

    connection = await pool.getConnection();
    await connection.beginTransaction();

    const [events] = await connection.query(
      "SELECT id, title, date, time, location, seats, registered FROM events WHERE id = ? FOR UPDATE",
      [eventId]
    );

    if (events.length === 0) {
      await connection.rollback();
      return res.status(404).json({ message: "Event not found" });
    }

    const event = events[0];

    const [existing] = await connection.query(
      "SELECT user_id FROM event_registrations WHERE user_id = ? AND event_id = ?",
      [req.user.id, eventId]
    );

    if (existing.length > 0) {
      await connection.rollback();
      return res.status(409).json({ message: "You are already registered for this event" });
    }

    const seats = event.seats == null ? null : Number(event.seats);
    const registered = Number(event.registered || 0);

    if (seats !== null && registered >= seats) {
      await connection.rollback();
      return res.status(409).json({ message: "This event is full" });
    }

    await connection.query(
      "INSERT INTO event_registrations (user_id, event_id) VALUES (?, ?)",
      [req.user.id, eventId]
    );

    await connection.query(
      "UPDATE events SET registered = COALESCE(registered, 0) + 1 WHERE id = ?",
      [eventId]
    );

    await connection.commit();

    const [rows] = await pool.query(
      `SELECT ${EVENT_COLUMNS} FROM events WHERE id = ?`,
      [eventId]
    );

    res.status(201).json({
      message: "Registered for event",
      event: formatEventRow(rows[0])
    });
  } catch (error) {
    if (connection) await connection.rollback();
    console.error("Register for event error:", error);
    res.status(500).json({ message: "Failed to register for event" });
  } finally {
    if (connection) connection.release();
  }
};

const cancelEventRegistration = async (req, res) => {
  const eventId = Number.parseInt(req.params.id, 10);
  if (!Number.isInteger(eventId)) {
    return res.status(400).json({ message: "Invalid event id" });
  }

  let connection;
  try {
    await ensureEventRegistrationsTable();

    connection = await pool.getConnection();
    await connection.beginTransaction();

    const [events] = await connection.query(
      "SELECT id FROM events WHERE id = ? FOR UPDATE",
      [eventId]
    );

    if (events.length === 0) {
      await connection.rollback();
      return res.status(404).json({ message: "Event not found" });
    }

    const [result] = await connection.query(
      "DELETE FROM event_registrations WHERE user_id = ? AND event_id = ?",
      [req.user.id, eventId]
    );

    if (result.affectedRows === 0) {
      await connection.rollback();
      return res.status(404).json({ message: "Registration not found" });
    }

    await connection.query(
      "UPDATE events SET registered = GREATEST(COALESCE(registered, 0) - 1, 0) WHERE id = ?",
      [eventId]
    );

    await connection.commit();

    const [rows] = await pool.query(
      `SELECT ${EVENT_COLUMNS} FROM events WHERE id = ?`,
      [eventId]
    );

    res.json({
      message: "Event registration cancelled",
      event: formatEventRow(rows[0])
    });
  } catch (error) {
    if (connection) await connection.rollback();
    console.error("Cancel event registration error:", error);
    res.status(500).json({ message: "Failed to cancel event registration" });
  } finally {
    if (connection) connection.release();
  }
};

const createEvent = async (req, res) => {
  try {
    const {
      title,
      date,
      time,
      location,
      category,
      format,
      featured,
      image,
      description,
      longDescription,
      speaker,
      seats,
      registered,
      audience,
      takeaway,
      highlights
    } = req.body;

    if (!title || !date) {
      return res.status(400).json({ message: "Title and date are required" });
    }

    const [result] = await pool.query(
      `INSERT INTO events
        (title, date, time, location, category, format, featured,
         image, description, long_description, speaker, seats, registered,
         audience, takeaway, highlights, created_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        title,
        date,
        time ?? null,
        location ?? null,
        category ?? null,
        format ?? null,
        featured ? 1 : 0,
        image ?? null,
        description ?? null,
        longDescription ?? null,
        speaker ?? null,
        seats ?? null,
        registered ?? null,
        audience ?? null,
        takeaway ?? null,
        highlights ? JSON.stringify(highlights) : null,
        req.user.id
      ]
    );

    const [rows] = await pool.query(
      `SELECT ${EVENT_COLUMNS} FROM events WHERE id = ?`,
      [result.insertId]
    );

    res.status(201).json(formatEventRow(rows[0]));
  } catch (error) {
    console.error("Create event error:", error);
    res.status(500).json({ message: "Failed to create event" });
  }
};

const updateEvent = async (req, res) => {
  try {
    const eventId = Number.parseInt(req.params.id, 10);
    if (!Number.isInteger(eventId)) {
      return res.status(400).json({ message: "Invalid event id" });
    }

    const [existing] = await pool.query(
      "SELECT created_by FROM events WHERE id = ?",
      [eventId]
    );

    if (existing.length === 0) {
      return res.status(404).json({ message: "Event not found" });
    }

    // Ownership check: only the user who created the event can edit it.
    if (existing[0].created_by !== req.user.id) {
      return res.status(403).json({ message: "Not authorized to edit this event" });
    }

    const {
      title,
      date,
      time,
      location,
      category,
      format,
      featured,
      image,
      description,
      longDescription,
      speaker,
      seats,
      registered,
      audience,
      takeaway,
      highlights
    } = req.body;

    await pool.query(
      `UPDATE events SET
         title = COALESCE(?, title),
         date = COALESCE(?, date),
         time = COALESCE(?, time),
         location = COALESCE(?, location),
         category = COALESCE(?, category),
         format = COALESCE(?, format),
         featured = COALESCE(?, featured),
         image = COALESCE(?, image),
         description = COALESCE(?, description),
         long_description = COALESCE(?, long_description),
         speaker = COALESCE(?, speaker),
         seats = COALESCE(?, seats),
         registered = COALESCE(?, registered),
         audience = COALESCE(?, audience),
         takeaway = COALESCE(?, takeaway),
         highlights = COALESCE(?, highlights)
       WHERE id = ?`,
      [
        title ?? null,
        date ?? null,
        time ?? null,
        location ?? null,
        category ?? null,
        format ?? null,
        featured === undefined ? null : featured ? 1 : 0,
        image ?? null,
        description ?? null,
        longDescription ?? null,
        speaker ?? null,
        seats ?? null,
        registered ?? null,
        audience ?? null,
        takeaway ?? null,
        highlights ? JSON.stringify(highlights) : null,
        eventId
      ]
    );

    const [rows] = await pool.query(
      `SELECT ${EVENT_COLUMNS} FROM events WHERE id = ?`,
      [eventId]
    );
    res.json(formatEventRow(rows[0]));
  } catch (error) {
    console.error("Update event error:", error);
    res.status(500).json({ message: "Failed to update event" });
  }
};

const deleteEvent = async (req, res) => {
  try {
    const eventId = Number.parseInt(req.params.id, 10);
    if (!Number.isInteger(eventId)) {
      return res.status(400).json({ message: "Invalid event id" });
    }

    const [existing] = await pool.query(
      "SELECT created_by FROM events WHERE id = ?",
      [eventId]
    );

    if (existing.length === 0) {
      return res.status(404).json({ message: "Event not found" });
    }

    if (existing[0].created_by !== req.user.id) {
      return res.status(403).json({ message: "Not authorized to delete this event" });
    }

    await pool.query("DELETE FROM events WHERE id = ?", [eventId]);
    res.json({ message: "Event deleted" });
  } catch (error) {
    console.error("Delete event error:", error);
    res.status(500).json({ message: "Failed to delete event" });
  }
};

module.exports = {
  getAllEvents,
  getEventById,
  getMyEventRegistrations,
  registerForEvent,
  cancelEventRegistration,
  createEvent,
  updateEvent,
  deleteEvent
};
