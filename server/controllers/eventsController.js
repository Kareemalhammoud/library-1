const pool = require("../config/db");

const EVENT_COLUMNS = `
  id, title, date, time, location, category, format,
  featured, image, description,
  long_description AS longDescription,
  speaker, seats, registered, audience, takeaway, highlights,
  created_by AS createdBy, created_at AS createdAt
`;

const formatEventRow = (row) => {
  if (!row) return row;

  const copy = { ...row };

  if (copy.date instanceof Date) {
    const y = copy.date.getFullYear();
    const m = String(copy.date.getMonth() + 1).padStart(2, "0");
    const d = String(copy.date.getDate()).padStart(2, "0");
    copy.date = `${y}-${m}-${d}`;
  }

  if (typeof copy.highlights === "string") {
    try {
      copy.highlights = JSON.parse(copy.highlights);
    } catch {
      copy.highlights = [];
    }
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
      highlights,
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
        registered ?? 0,
        audience ?? null,
        takeaway ?? null,
        highlights ? JSON.stringify(highlights) : null,
        req.user.id,
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
      "SELECT id FROM events WHERE id = ?",
      [eventId]
    );

    if (existing.length === 0) {
      return res.status(404).json({ message: "Event not found" });
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
      highlights,
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
        eventId,
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
      "SELECT id FROM events WHERE id = ?",
      [eventId]
    );

    if (existing.length === 0) {
      return res.status(404).json({ message: "Event not found" });
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
  createEvent,
  updateEvent,
  deleteEvent,
};