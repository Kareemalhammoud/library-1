import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import PropTypes from "prop-types";
import { createStudyRoomBooking, fetchStudyRoomAvailability } from "@/services/libraryApi";

const CAMPUS_ROOMS = {
  Beirut: {
    library: "Riyad Nassar Library (RNL)",
    equipment: "Whiteboards and flipcharts",
    rooms: [
      { id: "RNL-805", name: "RNL 805 - Jawdat R. Haydar" },
      { id: "RNL-806A", name: "RNL 806 A" },
      { id: "RNL-806B", name: "RNL 806 B" },
      { id: "RNL-807A", name: "RNL 807 A" },
      { id: "RNL-807B", name: "RNL 807 B" },
    ],
  },
  Byblos: {
    library: "Joseph G. Jabbra Library (JGJL) and HSL",
    equipment: "TV screens, whiteboards, and flipcharts",
    rooms: [
      { id: "JGJL-204", name: "JGJL 204" },
      { id: "JGJL-302", name: "JGJL 302" },
      { id: "JGJL-401", name: "JGJL 401" },
      { id: "JGJL-402", name: "JGJL 402" },
      { id: "JGJL-403", name: "JGJL 403" },
      { id: "JGJL-404", name: "JGJL 404" },
      { id: "JGJL-406", name: "JGJL 406" },
      { id: "JGJL-407", name: "JGJL 407" },
      { id: "JGJL-408", name: "JGJL 408" },
      { id: "JGJL-501", name: "JGJL 501" },
      { id: "JGJL-506", name: "JGJL 506" },
      { id: "HSL-3103", name: "HSL 3103.1" },
      { id: "HSL-3105", name: "HSL 3105" },
      { id: "HSL-3106", name: "HSL 3106" },
    ],
  },
};

const DURATIONS = ["30 minutes", "1 hour", "2 hours"];
const DEFAULT_SLOTS = ["08:00", "10:00", "12:00", "14:00", "16:00"];

const RULES = [
  "Bookings are limited to 2 hours per session.",
  "Rooms are intended for groups of 2 or more users.",
  "A valid LAU ID card is required to reserve a room.",
  "If a room is unattended for over 15 minutes, the booking may be released.",
  "Keep noise to a minimum and leave the room ready for the next group.",
];

function formatTime(time) {
  const [hour, minute] = time.split(":").map(Number);
  const suffix = hour >= 12 ? "PM" : "AM";
  const displayHour = hour % 12 || 12;
  return `${displayHour}:${String(minute).padStart(2, "0")} ${suffix}`;
}

function todayString() {
  return new Date().toISOString().slice(0, 10);
}

function isValidLauId(value) {
  return /^\d{8,9}$/.test(value.trim());
}

const BackButton = ({ onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className="mb-6 flex items-center gap-1.5 text-[13px] font-medium text-[#5ecba1] transition-opacity hover:opacity-80"
  >
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
      <path d="M19 12H5M12 5l-7 7 7 7" />
    </svg>
    Back to Services
  </button>
);

BackButton.propTypes = {
  onClick: PropTypes.func.isRequired,
};

export default function StudyRoomsPage() {
  const navigate = useNavigate();
  const [campus, setCampus] = useState("Beirut");
  const [form, setForm] = useState({
    room: CAMPUS_ROOMS.Beirut.rooms[0].id,
    date: todayString(),
    time: "",
    duration: "1 hour",
    people: "2",
    studentId: "",
    notes: "",
  });
  const [slots, setSlots] = useState(DEFAULT_SLOTS.map((time) => ({ time, available: true })));
  const [availabilityLoading, setAvailabilityLoading] = useState(false);
  const [availabilityError, setAvailabilityError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [confirmedBooking, setConfirmedBooking] = useState(null);

  const data = CAMPUS_ROOMS[campus];
  const selectedRoom = useMemo(
    () => data.rooms.find((room) => room.id === form.room) || data.rooms[0],
    [data.rooms, form.room]
  );

  useEffect(() => {
    setForm((prev) => ({
      ...prev,
      room: CAMPUS_ROOMS[campus].rooms[0].id,
      time: "",
    }));
    setConfirmedBooking(null);
  }, [campus]);

  useEffect(() => {
    if (!form.room || !form.date) return;

    let cancelled = false;
    setAvailabilityLoading(true);
    setAvailabilityError("");

    fetchStudyRoomAvailability({ campus, room: form.room, date: form.date })
      .then((data) => {
        if (cancelled) return;
        setSlots(Array.isArray(data.slots) ? data.slots : DEFAULT_SLOTS.map((time) => ({ time, available: true })));
        if (data.slots?.some((slot) => slot.time === form.time && !slot.available)) {
          setForm((prev) => ({ ...prev, time: "" }));
        }
      })
      .catch((error) => {
        if (cancelled) return;
        setAvailabilityError(error.message || "Unable to load time slots.");
        setSlots(DEFAULT_SLOTS.map((time) => ({ time, available: true })));
      })
      .finally(() => {
        if (!cancelled) setAvailabilityLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [campus, form.room, form.date, form.time]);

  function update(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
    setSubmitError("");
    setConfirmedBooking(null);
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitError("");

    if (!form.room || !form.date || !form.time || !form.duration || !form.studentId.trim()) {
      setSubmitError("Choose a room, date, time, duration, and enter your LAU ID.");
      return;
    }

    if (!isValidLauId(form.studentId)) {
      setSubmitError("LAU ID must be 8 or 9 digits.");
      return;
    }

    setSubmitting(true);
    try {
      const result = await createStudyRoomBooking({
        campus,
        room: form.room,
        date: form.date,
        time: form.time,
        duration: form.duration,
        people: form.people,
        studentId: form.studentId.trim(),
        notes: form.notes.trim(),
        requestedAt: new Date().toISOString(),
      });

      setConfirmedBooking(result.booking);
      setForm((prev) => ({ ...prev, time: "", notes: "" }));
      const availability = await fetchStudyRoomAvailability({ campus, room: form.room, date: form.date });
      setSlots(Array.isArray(availability.slots) ? availability.slots : slots);
    } catch (error) {
      setSubmitError(error.message || "Unable to reserve this study room.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#f2f6f3] dark:bg-[#1a1a1a]">
      <section className="relative overflow-hidden bg-[linear-gradient(165deg,#0A2E22_0%,#061C14_100%)] px-8 py-12 md:px-16">
        <div className="pointer-events-none absolute -bottom-20 -right-10 h-72 w-72 rounded-full bg-[#1a6644]/8" />
        <BackButton onClick={() => navigate("/services")} />
        <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#5ecba1]">
          Services / Study Rooms
        </p>
        <h1 className="mb-2 text-4xl font-bold leading-tight text-white">
          Group Study Rooms
        </h1>
        <p className="max-w-lg text-sm leading-relaxed text-white/65">
          Reserve a room directly through the library system. Pick a campus, room, date, and open time slot.
        </p>
      </section>

      <div className="max-w-6xl px-8 py-10 md:px-16">
        <section className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { label: "Max booking", value: "2 hrs" },
            { label: "Min group size", value: "2 people" },
            { label: "Beirut rooms", value: "5" },
            { label: "Byblos rooms", value: "14" },
          ].map((stat) => (
            <article key={stat.label} className="rounded-xl border border-[#cfe2d6] bg-white p-4 dark:border-[#333] dark:bg-[#242424]">
              <p className="mb-1 text-[11px] text-[#5e7a68] dark:text-[#888]">{stat.label}</p>
              <p className="text-xl font-bold text-[#162a1f] dark:text-white">{stat.value}</p>
            </article>
          ))}
        </section>

        <div className="grid gap-5 lg:grid-cols-[1fr_380px]">
          <section className="rounded-2xl border border-[#cfe2d6] bg-white p-6 dark:border-[#333] dark:bg-[#242424]">
            <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2 className="mb-1 text-[17px] font-bold text-[#162a1f] dark:text-white">Rooms and Availability</h2>
                <p className="text-[12px] text-[#5e7a68] dark:text-[#888]">{data.library} - {data.equipment}</p>
              </div>
              <div className="flex gap-2">
                {["Beirut", "Byblos"].map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setCampus(item)}
                    className={`h-9 rounded-xl border px-4 text-[13px] font-semibold transition-colors ${
                      campus === item
                        ? "border-[#1a6644] bg-[#1a6644] text-white"
                        : "border-[#c5ddd0] bg-[#f7fbf8] text-[#3d6650] hover:border-[#1a6644] dark:border-[#333] dark:bg-[#2e2e2e] dark:text-[#888]"
                    }`}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-5 grid grid-cols-2 gap-2 sm:grid-cols-3">
              {data.rooms.map((room) => (
                <button
                  key={room.id}
                  type="button"
                  onClick={() => update("room", room.id)}
                  className={`rounded-xl border px-4 py-3 text-left transition ${
                    form.room === room.id
                      ? "border-[#1a6644] bg-[#eaf5ee] shadow-[inset_0_0_0_1px_rgba(26,102,68,0.28)] dark:bg-[#20352c]"
                      : "border-[#cfe2d6] bg-[#f7fbf8] hover:border-[#1a6644] dark:border-[#333] dark:bg-[#2e2e2e]"
                  }`}
                >
                  <span className="block text-[13px] font-semibold text-[#162a1f] dark:text-white">{room.name}</span>
                  <span className="mt-0.5 block text-[11px] text-[#5e7a68] dark:text-[#888]">{campus} campus</span>
                </button>
              ))}
            </div>

            <div className="rounded-xl border border-[#cfe2d6] bg-[#f7fbf8] p-4 dark:border-[#333] dark:bg-[#1f1f1f]">
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="text-[12px] font-semibold uppercase tracking-[0.1em] text-[#1a6644] dark:text-[#5ecba1]">
                    {selectedRoom.name}
                  </p>
                  <p className="text-[12px] text-[#5e7a68] dark:text-[#888]">
                    {form.date || "Select a date"} availability
                  </p>
                </div>
                {availabilityLoading && <span className="text-[12px] text-[#5e7a68] dark:text-[#888]">Checking slots...</span>}
              </div>

              {availabilityError && (
                <p className="mb-3 rounded-lg bg-[#fff5d8] px-3 py-2 text-[12px] text-[#7c5b00] dark:bg-[#332800] dark:text-[#f1d57a]">
                  {availabilityError}
                </p>
              )}

              <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
                {slots.map((slot) => (
                  <button
                    key={slot.time}
                    type="button"
                    disabled={!slot.available}
                    onClick={() => update("time", slot.time)}
                    className={`h-10 rounded-lg border text-[12px] font-semibold transition disabled:cursor-not-allowed ${
                      form.time === slot.time
                        ? "border-[#1a6644] bg-[#1a6644] text-white"
                        : slot.available
                          ? "border-[#c5ddd0] bg-white text-[#1a6644] hover:border-[#1a6644] dark:border-[#333] dark:bg-[#242424] dark:text-[#5ecba1]"
                          : "border-[#e2d6d2] bg-[#f1e9e6] text-[#9a8c86] line-through dark:border-[#3a2a26] dark:bg-[#2a211f] dark:text-[#806f68]"
                    }`}
                  >
                    {formatTime(slot.time)}
                  </button>
                ))}
              </div>
            </div>
          </section>

          <aside className="rounded-2xl border border-[#cfe2d6] bg-white p-6 dark:border-[#333] dark:bg-[#242424]">
            <h2 className="mb-1 text-[17px] font-bold text-[#162a1f] dark:text-white">Complete Booking</h2>
            <p className="mb-5 text-[12px] leading-relaxed text-[#5e7a68] dark:text-[#888]">
              The reservation is stored in our database and checked against existing bookings for the selected room and time.
            </p>

            <form onSubmit={handleSubmit} className="space-y-3">
              <label className="block">
                <span className="mb-1 block text-[11px] font-semibold text-[#2a4535] dark:text-[#888]">Date</span>
                <input
                  type="date"
                  min={todayString()}
                  value={form.date}
                  onChange={(event) => update("date", event.target.value)}
                  className="h-10 w-full rounded-lg border border-[#c5ddd0] bg-[#f7fbf8] px-3 text-[13px] text-[#162a1f] outline-none focus:border-[#1a6644] dark:border-[#333] dark:bg-[#2e2e2e] dark:text-white"
                />
              </label>

              <label className="block">
                <span className="mb-1 block text-[11px] font-semibold text-[#2a4535] dark:text-[#888]">Duration</span>
                <select
                  value={form.duration}
                  onChange={(event) => update("duration", event.target.value)}
                  className="h-10 w-full rounded-lg border border-[#c5ddd0] bg-[#f7fbf8] px-3 text-[13px] text-[#162a1f] outline-none focus:border-[#1a6644] dark:border-[#333] dark:bg-[#2e2e2e] dark:text-white"
                >
                  {DURATIONS.map((duration) => (
                    <option key={duration} value={duration}>{duration}</option>
                  ))}
                </select>
              </label>

              <label className="block">
                <span className="mb-1 block text-[11px] font-semibold text-[#2a4535] dark:text-[#888]">Group size</span>
                <select
                  value={form.people}
                  onChange={(event) => update("people", event.target.value)}
                  className="h-10 w-full rounded-lg border border-[#c5ddd0] bg-[#f7fbf8] px-3 text-[13px] text-[#162a1f] outline-none focus:border-[#1a6644] dark:border-[#333] dark:bg-[#2e2e2e] dark:text-white"
                >
                  {[2, 3, 4, 5, 6, 7, 8].map((people) => (
                    <option key={people} value={people}>{people} people</option>
                  ))}
                </select>
              </label>

              <label className="block">
                <span className="mb-1 block text-[11px] font-semibold text-[#2a4535] dark:text-[#888]">LAU ID</span>
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={9}
                  value={form.studentId}
                  onChange={(event) => update("studentId", event.target.value)}
                  placeholder="e.g. 202100001"
                  aria-describedby="lau-id-hint"
                  className="h-10 w-full rounded-lg border border-[#c5ddd0] bg-[#f7fbf8] px-3 text-[13px] text-[#162a1f] outline-none placeholder:text-[#8aaa95] focus:border-[#1a6644] dark:border-[#333] dark:bg-[#2e2e2e] dark:text-white"
                />
                <span id="lau-id-hint" className="mt-1 block text-[11px] text-[#5e7a68] dark:text-[#888]">Use 8 or 9 digits, no spaces or dashes.</span>
              </label>

              <label className="block">
                <span className="mb-1 block text-[11px] font-semibold text-[#2a4535] dark:text-[#888]">Notes</span>
                <textarea
                  value={form.notes}
                  onChange={(event) => update("notes", event.target.value)}
                  rows={3}
                  placeholder="Optional"
                  className="w-full resize-y rounded-lg border border-[#c5ddd0] bg-[#f7fbf8] px-3 py-2 text-[13px] text-[#162a1f] outline-none placeholder:text-[#8aaa95] focus:border-[#1a6644] dark:border-[#333] dark:bg-[#2e2e2e] dark:text-white"
                />
              </label>

              {submitError && (
                <p className="rounded-lg bg-[#fdecea] px-3 py-2 text-[12px] leading-relaxed text-[#b5392b] dark:bg-[#3b1c1a] dark:text-[#ff9388]" role="alert">
                  {submitError}
                </p>
              )}

              {confirmedBooking && (
                <p className="rounded-lg bg-[#eaf5ee] px-3 py-2 text-[12px] leading-relaxed text-[#1a6644] dark:bg-[#20352c] dark:text-[#5ecba1]" role="status">
                  Confirmed: {confirmedBooking.room} on {confirmedBooking.date} at {formatTime(confirmedBooking.time)}.
                </p>
              )}

              <button
                type="submit"
                disabled={submitting || availabilityLoading}
                className="flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-[#1a6644] text-[13px] font-semibold text-white transition-colors hover:enabled:bg-[#14533a] disabled:cursor-not-allowed disabled:opacity-65"
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <rect x="3" y="4" width="18" height="18" rx="2" />
                  <path d="M3 10h18M8 2v4M16 2v4" />
                </svg>
                {submitting ? "Confirming..." : "Confirm reservation"}
              </button>
            </form>
          </aside>
        </div>

        <section className="mt-5 rounded-2xl border border-[#cfe2d6] bg-white p-6 dark:border-[#333] dark:bg-[#242424]">
          <h2 className="mb-3 text-[15px] font-bold text-[#162a1f] dark:text-white">Rules for using GSRs</h2>
          <ul className="space-y-2">
            {RULES.map((rule) => (
              <li key={rule} className="flex items-start gap-2.5 text-[13px] text-[#5e7a68] dark:text-[#888]">
                <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-[#1a6644] dark:bg-[#5ecba1]" />
                {rule}
              </li>
            ))}
          </ul>
        </section>
      </div>
    </main>
  );
}
