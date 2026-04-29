import { useState } from "react";
import { useNavigate } from "react-router-dom";
import PropTypes from "prop-types";
import { createHelpRequest, createStudyRoomBooking, isBackendConfigured } from "@/services/libraryApi";

// ─── Mock Data ────────────────────────────────────────────────────────────────

const SERVICES = [
  {
    id: "circulation",
    tag: "Circulation",
    title: "Borrowing & Renewals",
    desc: "Check out books, renew loans, and learn the rules and procedures for borrowing LAU library materials.",
    link: "View circulation rules",
    variant: "dark",
    icon: "book",
    route: "/services/circulation",
  },
  {
    id: "StudyRooms",
    tag: "Study Rooms",
    title: "Group Study Room Booking",
    desc: "Reserve private group study rooms at RNL (Beirut) or JGJL/HSL (Byblos). Requires a valid LAU ID.",
    link: "Book a room",
    variant: "sage",
    icon: "calendar",
    route: "/services/StudyRooms",
  },
  {
    id: "printing",
    tag: "Printing",
    title: "Printing, Scanning & Photocopying",
    desc: "Use shared printing and scanning resources across library floors. Top up printing credit via the LAU portal.",
    link: "Printing guide",
    variant: "mid",
    icon: "printer",
    route: "/services/printing",
  },
  {
    id: "writing",
    tag: "Writing Center",
    title: "Writing & Communication Center",
    desc: "Get support for essays, citations, and research papers from LAU's Writing and Communication Center tutors.",
    link: "Book a session",
    variant: "mint",
    icon: "pen",
    route: "/services/writingcenter",
  },
];

const ROOM_OPTIONS = [
  { value: "", label: "Select a room" },
  { value: "RNL-805",  label: "RNL 805 – Jawdat R. Haydar", campus: "Beirut" },
  { value: "RNL-806A", label: "RNL 806 A",                  campus: "Beirut" },
  { value: "RNL-806B", label: "RNL 806 B",                  campus: "Beirut" },
  { value: "RNL-807A", label: "RNL 807 A",                  campus: "Beirut" },
  { value: "RNL-807B", label: "RNL 807 B",                  campus: "Beirut" },
  { value: "JGJL-204", label: "JGJL 204",                   campus: "Byblos" },
  { value: "JGJL-302", label: "JGJL 302",                   campus: "Byblos" },
  { value: "JGJL-401", label: "JGJL 401",                   campus: "Byblos" },
  { value: "JGJL-402", label: "JGJL 402",                   campus: "Byblos" },
  { value: "JGJL-403", label: "JGJL 403",                   campus: "Byblos" },
  { value: "JGJL-404", label: "JGJL 404",                   campus: "Byblos" },
  { value: "JGJL-406", label: "JGJL 406",                   campus: "Byblos" },
  { value: "JGJL-407", label: "JGJL 407",                   campus: "Byblos" },
  { value: "JGJL-408", label: "JGJL 408",                   campus: "Byblos" },
  { value: "JGJL-501", label: "JGJL 501",                   campus: "Byblos" },
  { value: "JGJL-506", label: "JGJL 506",                   campus: "Byblos" },
  { value: "HSL-3103", label: "HSL 3103.1",                 campus: "Byblos" },
  { value: "HSL-3105", label: "HSL 3105",                   campus: "Byblos" },
  { value: "HSL-3106", label: "HSL 3106",                   campus: "Byblos" },
];

const INITIAL_MESSAGES = [
  { id: 1, from: "lib",  text: "Hi! How can I help you today? I can assist with research, resources, or any library question." },
  { id: 2, from: "user", text: "Where can I find IEEE journals?" },
  { id: 3, from: "lib",  text: "Access IEEE Xplore through our Online Databases page — log in with your LAU credentials." },
];

// ─── Icon Components ──────────────────────────────────────────────────────────

function getStoredList(key) {
  try {
    return JSON.parse(localStorage.getItem(key) || "[]");
  } catch {
    return [];
  }
}

const Icon = ({ name, className = "" }) => {
  const icons = {
    book: (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true" focusable="false">
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
      </svg>
    ),
    calendar: (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true" focusable="false">
        <rect x="3" y="4" width="18" height="18" rx="2" />
        <line x1="3" y1="10" x2="21" y2="10" />
        <line x1="8" y1="2" x2="8" y2="6" />
        <line x1="16" y1="2" x2="16" y2="6" />
      </svg>
    ),
    printer: (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true" focusable="false">
        <polyline points="6 9 6 2 18 2 18 9" />
        <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
        <rect x="6" y="14" width="12" height="8" />
      </svg>
    ),
    pen: (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true" focusable="false">
        <path d="M12 20h9" />
        <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
      </svg>
    ),
    arrow: (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true" focusable="false">
        <path d="M5 12h14M12 5l7 7-7 7" />
      </svg>
    ),
    send: (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true" focusable="false">
        <line x1="22" y1="2" x2="11" y2="13" />
        <polygon points="22 2 15 22 11 13 2 9 22 2" />
      </svg>
    ),
    user: (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true" focusable="false">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    ),
  };
  return icons[name] || null;
};

Icon.propTypes = {
  name: PropTypes.string.isRequired,
  className: PropTypes.string,
};

// ─── Card variant styles ──────────────────────────────────────────────────────

const CARD_VARIANTS = {
  dark: {
    card: "border border-[rgba(255,255,255,0.05)] bg-[linear-gradient(160deg,#173f31_0%,#1f5a45_100%)]",
    iconWrap: "bg-white/8",
    iconColor: "text-[#5ecba1]",
    tag: "text-[#5ecba1]",
    title: "text-white",
    desc: "text-white/65",
    link: "text-[#5ecba1]",
  },
  sage: {
    card: "bg-[#d6ede0] dark:bg-[#242424]",
    iconWrap: "bg-[#b4ddc6] dark:bg-[#2e2e2e]",
    iconColor: "text-[#1a5c3a] dark:text-[#5ecba1]",
    tag: "text-[#1a6644] dark:text-[#5ecba1]",
    title: "text-[#102a1c] dark:text-white",
    desc: "text-[#3d6650] dark:text-[#888]",
    link: "text-[#1a6644] dark:text-[#5ecba1]",
  },
  mid: {
    card: "border border-[rgba(255,255,255,0.05)] bg-[linear-gradient(160deg,#214c3c_0%,#2d6a4f_100%)]",
    iconWrap: "bg-white/10",
    iconColor: "text-[#b7e4c7]",
    tag: "text-[#5ecba1]",
    title: "text-white",
    desc: "text-white/60",
    link: "text-[#5ecba1]",
  },
  mint: {
    card: "bg-[#eaf5ee] dark:bg-[#242424]",
    iconWrap: "bg-[#c7e8d4] dark:bg-[#2e2e2e]",
    iconColor: "text-[#1a5c3a] dark:text-[#5ecba1]",
    tag: "text-[#1a6644] dark:text-[#5ecba1]",
    title: "text-[#102a1c] dark:text-white",
    desc: "text-[#3d6650] dark:text-[#888]",
    link: "text-[#1a6644] dark:text-[#5ecba1]",
  },
};

// ─── Service Card ─────────────────────────────────────────────────────────────

const ServiceCard = ({ service }) => {
  const navigate = useNavigate();
  const v = CARD_VARIANTS[service.variant];
  return (
    <article
      onClick={() => navigate(service.route)}
      className={`${v.card} rounded-2xl p-6 cursor-pointer hover:-translate-y-0.5 transition-transform duration-150`}
      aria-label={service.title}
    >
      <div className={`${v.iconWrap} w-10 h-10 rounded-xl flex items-center justify-center mb-4`} aria-hidden="true">
        <Icon name={service.icon} className={`${v.iconColor} w-5 h-5`} />
      </div>
      <p className={`${v.tag} text-[10px] font-semibold tracking-widest uppercase mb-1`}>
        {service.tag}
      </p>
      <h3 className={`${v.title} text-base font-bold leading-snug mb-1.5`}>
        {service.title}
      </h3>
      <p className={`${v.desc} text-[13px] leading-relaxed`}>{service.desc}</p>
      <span className={`${v.link} mt-4 text-[13px] font-medium flex items-center gap-1`} aria-hidden="true">
        {service.link}
        <Icon name="arrow" className="w-3 h-3" />
      </span>
    </article>
  );
};

ServiceCard.propTypes = {
  service: PropTypes.shape({
    desc: PropTypes.string.isRequired,
    icon: PropTypes.string.isRequired,
    link: PropTypes.string.isRequired,
    route: PropTypes.string.isRequired,
    tag: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    variant: PropTypes.string.isRequired,
  }).isRequired,
};

// ─── Room Booking Form ────────────────────────────────────────────────────────

const RoomBookingForm = () => {
  const [campus, setCampus] = useState("Beirut");
  const [form, setForm] = useState({
    room: "", date: "", duration: "", time: "", people: "", studentId: "",
  });
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitNotice, setSubmitNotice] = useState("");

  const filteredRooms = ROOM_OPTIONS.filter(
    (o) => o.value === "" || o.campus === campus
  );

  const update = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const switchCampus = (c) => {
    setCampus(c);
    setForm((prev) => ({ ...prev, room: "" }));
    if (errors.room) setErrors((prev) => ({ ...prev, room: "" }));
  };

  const validate = () => {
    const e = {};
    if (!form.room)             e.room      = "Please select a room.";
    if (!form.date)             e.date      = "Please pick a date.";
    if (!form.duration)         e.duration  = "Please select a duration.";
    if (!form.time)             e.time      = "Please choose a time slot.";
    if (!form.people)           e.people    = "Please specify group size.";
    if (!form.studentId.trim()) e.studentId = "Student ID is required.";
    return e;
  };

  const handleSubmit = async () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    setSubmitting(true);
    setSubmitNotice("");

    try {
      if (isBackendConfigured()) {
        await createStudyRoomBooking({
          campus,
          ...form,
          requestedAt: new Date().toISOString(),
        });
      } else {
        const localBookings = getStoredList("studyRoomBookings");
        localBookings.push({
          id: Date.now(),
          campus,
          ...form,
          requestedAt: new Date().toISOString(),
        });
        localStorage.setItem("studyRoomBookings", JSON.stringify(localBookings));
      }
    } catch (err) {
      setSubmitNotice(`${err.message || "Backend request failed."} Saved locally for this session.`);
      const localBookings = getStoredList("studyRoomBookings");
      localBookings.push({
        id: Date.now(),
        campus,
        ...form,
        requestedAt: new Date().toISOString(),
      });
      localStorage.setItem("studyRoomBookings", JSON.stringify(localBookings));
    }

    setSubmitted(true);
    setSubmitting(false);
  };

  const resetForm = () => {
    setForm({ room: "", date: "", duration: "", time: "", people: "", studentId: "" });
    setErrors({});
    setSubmitted(false);
    setSubmitNotice("");
  };

  const inputCls = "w-full h-9 rounded-lg border border-[#c5ddd0] dark:border-[#333] bg-[#f7fbf8] dark:bg-[#2e2e2e] px-3 text-[13px] text-[#162a1f] dark:text-white placeholder-[#8aaa95] dark:placeholder-[#666] focus:outline-none focus:border-[#1a6644]";
  const labelCls = "block text-[11px] font-semibold text-[#2a4535] dark:text-[#888] mb-1 tracking-wide";

  if (submitted) {
    return (
      <section
        className="bg-white dark:bg-[#242424] rounded-2xl border border-[#cfe2d6] dark:border-[#333] p-6 flex flex-col items-center justify-center gap-4 min-h-[340px]"
        aria-live="polite"
        aria-label="Reservation confirmed"
      >
        <div className="w-14 h-14 rounded-full bg-[#eaf5ee] dark:bg-[#2e2e2e] flex items-center justify-center" aria-hidden="true">
          <svg className="w-7 h-7 text-[#1a6644] dark:text-[#5ecba1]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
        <p className="text-[#162a1f] dark:text-white font-bold text-base">Reservation confirmed!</p>
        <p className="text-[#5e7a68] dark:text-[#888] text-sm text-center leading-relaxed">
          Room <strong className="font-semibold text-[#5ecba1] dark:text-white">{ROOM_OPTIONS.find(r => r.value === form.room)?.label}</strong> has been reserved for {form.date} at {form.time}.
        </p>
        {submitNotice && (
          <p className="rounded-lg bg-[#fff5d8] px-3 py-2 text-center text-[12px] leading-relaxed text-[#7c5b00] dark:bg-[#332800] dark:text-[#f1d57a]">
            {submitNotice}
          </p>
        )}
        <button onClick={resetForm} className="mt-2 text-sm text-[#1a6644] dark:text-[#5ecba1] font-medium underline underline-offset-2">
          Make another reservation
        </button>
      </section>
    );
  }

  return (
    <section
      className="bg-white dark:bg-[#242424] rounded-2xl border border-[#cfe2d6] dark:border-[#333] p-6"
      aria-label="Study room reservation form"
    >
      <h3 className="text-[#162a1f] dark:text-white font-bold text-[15px] mb-0.5">Study room reservation</h3>
      <p className="text-[#5e7a68] dark:text-[#888] text-xs mb-5">
        Available Mon–Fri · Max 2 hrs per session · Valid LAU ID required
      </p>

      <fieldset className="border-0 p-0 m-0 mb-3">
        <legend className={labelCls}>Campus</legend>
        <div className="flex gap-2 mb-2.5" role="group" aria-label="Select campus">
          {["Beirut", "Byblos"].map((c) => (
            <button
              key={c}
              onClick={() => switchCampus(c)}
              aria-pressed={campus === c}
              className={`flex-1 h-8 rounded-lg text-[12px] font-semibold transition-colors duration-150 border ${
                campus === c
                  ? "bg-[#1a6644] text-white border-[#1a6644]"
                  : "bg-[#f7fbf8] dark:bg-[#2e2e2e] text-[#3d6650] dark:text-[#888] border-[#c5ddd0] dark:border-[#333] hover:border-[#1a6644]"
              }`}
            >
              {c === "Beirut" ? "🏙 Beirut (RNL)" : "🌿 Byblos (JGJL / HSL)"}
            </button>
          ))}
        </div>

        <label htmlFor="room-select" className={labelCls}>Room</label>
        <select
          id="room-select"
          value={form.room}
          onChange={(e) => update("room", e.target.value)}
          className={inputCls}
          aria-required="true"
          aria-invalid={!!errors.room}
          aria-describedby={errors.room ? "room-error" : undefined}
        >
          {filteredRooms.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
        {errors.room && <p id="room-error" role="alert" className="text-red-500 text-[11px] mt-1">{errors.room}</p>}
      </fieldset>

      <div className="grid grid-cols-2 gap-2 mb-3">
        <div>
          <label htmlFor="date-input" className={labelCls}>Date</label>
          <input
            id="date-input"
            type="date"
            value={form.date}
            onChange={(e) => update("date", e.target.value)}
            className={inputCls}
            aria-required="true"
            aria-invalid={!!errors.date}
            aria-describedby={errors.date ? "date-error" : undefined}
          />
          {errors.date && <p id="date-error" role="alert" className="text-red-500 text-[11px] mt-1">{errors.date}</p>}
        </div>
        <div>
          <label htmlFor="duration-select" className={labelCls}>Duration</label>
          <select
            id="duration-select"
            value={form.duration}
            onChange={(e) => update("duration", e.target.value)}
            className={inputCls}
            aria-required="true"
            aria-invalid={!!errors.duration}
            aria-describedby={errors.duration ? "duration-error" : undefined}
          >
            <option value="">Select</option>
            <option value="1hr">1 hour</option>
            <option value="2hr">2 hours</option>
          </select>
          {errors.duration && <p id="duration-error" role="alert" className="text-red-500 text-[11px] mt-1">{errors.duration}</p>}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 mb-3">
        <div>
          <label htmlFor="time-select" className={labelCls}>Time slot</label>
          <select
            id="time-select"
            value={form.time}
            onChange={(e) => update("time", e.target.value)}
            className={inputCls}
            aria-required="true"
            aria-invalid={!!errors.time}
            aria-describedby={errors.time ? "time-error" : undefined}
          >
            <option value="">Select</option>
            {["8:00 AM","9:00 AM","10:00 AM","11:00 AM","12:00 PM",
              "1:00 PM","2:00 PM","3:00 PM","4:00 PM","5:00 PM",
              "6:00 PM","7:00 PM","8:00 PM"].map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
          {errors.time && <p id="time-error" role="alert" className="text-red-500 text-[11px] mt-1">{errors.time}</p>}
        </div>
        <div>
          <label htmlFor="people-select" className={labelCls}>No. of people</label>
          <select
            id="people-select"
            value={form.people}
            onChange={(e) => update("people", e.target.value)}
            className={inputCls}
            aria-required="true"
            aria-invalid={!!errors.people}
            aria-describedby={errors.people ? "people-error" : undefined}
          >
            <option value="">Select</option>
            {[2,3,4,5,6,7,8].map((n) => (
              <option key={n} value={n}>{n} people</option>
            ))}
          </select>
          {errors.people && <p id="people-error" role="alert" className="text-red-500 text-[11px] mt-1">{errors.people}</p>}
        </div>
      </div>

      <div className="mb-4">
        <label htmlFor="student-id-input" className={labelCls}>Student ID</label>
        <input
          id="student-id-input"
          type="text"
          placeholder="e.g. 202100001"
          value={form.studentId}
          onChange={(e) => update("studentId", e.target.value)}
          className={inputCls}
          aria-required="true"
          aria-invalid={!!errors.studentId}
          aria-describedby={errors.studentId ? "studentId-error" : undefined}
        />
        {errors.studentId && <p id="studentId-error" role="alert" className="text-red-500 text-[11px] mt-1">{errors.studentId}</p>}
      </div>

      <button
        onClick={handleSubmit}
        disabled={submitting}
        className="w-full h-9 bg-[#1a6644] hover:bg-[#14533a] text-white rounded-lg text-[13px] font-semibold flex items-center justify-center gap-2 transition-colors duration-150"
      >
        <Icon name="calendar" className="w-3.5 h-3.5" />
        {submitting ? "Saving..." : "Confirm reservation"}
      </button>
    </section>
  );
};

// ─── Ask-a-Librarian Chat Widget ──────────────────────────────────────────────

const LibrarianChat = () => {
  const [messages, setMessages] = useState(INITIAL_MESSAGES);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [sendNotice, setSendNotice] = useState("");

  const send = async () => {
    const text = input.trim();
    if (!text || sending) return;
    const userMsg  = { id: Date.now(),     from: "user", text };
    setSending(true);
    setSendNotice("");
    setMessages((prev) => [...prev, userMsg]);
    setInput("");

    try {
      if (isBackendConfigured()) {
        await createHelpRequest({
          message: text,
          requestedAt: new Date().toISOString(),
        });
      } else {
        const localRequests = getStoredList("helpRequests");
        localRequests.push({
          id: Date.now(),
          message: text,
          requestedAt: new Date().toISOString(),
        });
        localStorage.setItem("helpRequests", JSON.stringify(localRequests));
      }
      const replyMsg = { id: Date.now() + 1, from: "lib", text: "Thanks for your question! A librarian will follow up shortly. You can also visit us at the reference desk during opening hours." };
      setMessages((prev) => [...prev, replyMsg]);
    } catch (err) {
      const localRequests = getStoredList("helpRequests");
      localRequests.push({
        id: Date.now(),
        message: text,
        requestedAt: new Date().toISOString(),
      });
      localStorage.setItem("helpRequests", JSON.stringify(localRequests));
      setSendNotice(`${err.message || "Backend request failed."} Saved locally for this session.`);
      const replyMsg = { id: Date.now() + 1, from: "lib", text: "Your request has been recorded locally. A librarian will follow up when the service syncs." };
      setMessages((prev) => [...prev, replyMsg]);
    } finally {
      setSending(false);
    }
  };

  return (
    <section
      className="bg-white dark:bg-[#242424] rounded-2xl border border-[#cfe2d6] dark:border-[#333] p-6 flex flex-col"
      aria-label="Ask a Librarian chat"
    >
      <header className="flex items-center gap-3 mb-4">
        <div className="relative w-9 h-9 flex-shrink-0">
          <div className="w-9 h-9 rounded-full bg-[#1a6644] flex items-center justify-center" aria-hidden="true">
            <Icon name="user" className="w-4 h-4 text-white" />
          </div>
          <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-green-500 border-2 border-white dark:border-[#242424]" aria-hidden="true" />
        </div>
        <div>
          <p className="text-[#162a1f] dark:text-white text-[14px] font-bold">Ask a Librarian</p>
          <p className="text-[#1a6644] text-[11px] flex items-center gap-1 dark:text-[#5ecba1]" aria-label="Librarian is online">
            <span className="w-1.5 h-1.5 rounded-full bg-[#1a6644] inline-block dark:bg-[#5ecba1]" aria-hidden="true" />
            Online now
          </p>
        </div>
      </header>

      <ol
        className="flex flex-col gap-2.5 mb-4 flex-1 overflow-y-auto max-h-56"
        aria-live="polite"
        aria-label="Chat messages"
      >
        {messages.map((m) => (
          <li
            key={m.id}
            className={`text-[12px] leading-relaxed px-3 py-2 rounded-xl max-w-[88%] list-none ${
              m.from === "lib"
                ? "bg-[#eaf5ee] dark:bg-[#2e2e2e] text-[#162a1f] dark:text-white self-start rounded-tl-sm"
                : "bg-[#1a6644] text-white self-end rounded-tr-sm"
            }`}
          >
            {m.text}
          </li>
        ))}
      </ol>

      <div className="flex gap-2" role="group" aria-label="Send a message">
        <label htmlFor="chat-input" className="sr-only">Type your question</label>
        <input
          id="chat-input"
          type="text"
          placeholder="Type your question..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
          className="flex-1 h-9 rounded-lg border border-[#c5ddd0] dark:border-[#333] bg-[#f7fbf8] dark:bg-[#2e2e2e] px-3 text-[13px] text-[#162a1f] dark:text-white placeholder-[#8aaa95] dark:placeholder-[#666] focus:outline-none focus:border-[#1a6644]"
        />
        <button
          onClick={send}
          aria-label="Send message"
          disabled={sending}
          className="w-9 h-9 bg-[#1a6644] hover:bg-[#14533a] rounded-lg flex items-center justify-center transition-colors duration-150 flex-shrink-0"
        >
          <Icon name="send" className="w-3.5 h-3.5 text-white" />
        </button>
      </div>
      {sendNotice && (
        <p className="mt-3 rounded-lg bg-[#fff5d8] px-3 py-2 text-[12px] leading-relaxed text-[#7c5b00] dark:bg-[#332800] dark:text-[#f1d57a]">
          {sendNotice}
        </p>
      )}
    </section>
  );
};

// ─── Main Services Page ───────────────────────────────────────────────────────

const ServicesPage = () => {
  return (
    <main className="min-h-screen bg-[#f2f6f3] dark:bg-[#121212]">

      <header className="relative overflow-hidden bg-[linear-gradient(165deg,#0A2E22_0%,#061C14_100%)] px-8 py-12 md:px-16">
        <div className="absolute -right-10 -bottom-20 w-72 h-72 rounded-full bg-white/5 pointer-events-none" aria-hidden="true" />
        <p className="text-[#5ecba1] text-[10px] font-semibold tracking-[0.14em] uppercase mb-2">
          Our Libraries
        </p>
        <h1 className="text-white text-4xl font-bold leading-tight mb-2">Library Services</h1>
        <p className="text-white/65 text-sm max-w-md leading-relaxed">
          Borrow materials, reserve study spaces, get writing support, and print — everything you need on campus.
        </p>
      </header>

      <div className="px-8 md:px-16 py-10">

        <p className="text-[#1a6644] dark:text-[#5ecba1] text-[10px] font-semibold tracking-widest uppercase mb-1">
          What we offer
        </p>
        <h2 className="text-[#162a1f] dark:text-white text-2xl font-bold mb-1">Our Services</h2>
        <p className="text-[#5e7a68] dark:text-[#888] text-sm mb-6 leading-relaxed">
          Core services available to all LAU students and faculty at our libraries.
        </p>

          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 mb-10 list-none p-0">
            {SERVICES.map((s) => (
              <li key={s.id}>
                <ServiceCard service={s} />
              </li>
            ))}
          </ul>
        </section>

        <hr className="border-[#cfe2d6] dark:border-[#333] mb-10" />

        <section aria-labelledby="interactive-heading">
          <p className="text-[#1a6644] dark:text-[#5ecba1] text-[10px] font-semibold tracking-widest uppercase mb-1" aria-hidden="true">
            Interactive
          </p>
          <h2 id="interactive-heading" className="text-[#162a1f] dark:text-white text-2xl font-bold mb-1">
            Book a Room & Ask a Librarian
          </h2>
          <p className="text-[#5e7a68] dark:text-[#888] text-sm mb-6 leading-relaxed">
            Reserve a group study space or get real-time help from library staff.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            <RoomBookingForm />
            <LibrarianChat />
          </div>
        </section>

        <aside
          className="mt-4 bg-white dark:bg-[#242424] rounded-xl border border-[#cfe2d6] dark:border-[#333] px-5 py-3 flex items-center gap-3 text-[12px]"
          aria-label="Library hours and location"
        >
          <span className="w-2 h-2 rounded-full bg-red-500 flex-shrink-0" aria-hidden="true" />
          <p className="text-[#5e7a68] dark:text-[#888]">
            <strong className="text-[#162a1f] dark:text-white">Currently closed</strong>
            &nbsp;·&nbsp; Mon–Fri 7:30–22:00 &nbsp;·&nbsp; Sat–Sun closed
            &nbsp;·&nbsp; Mme. Curie St, Koraytem, Beirut
          </p>
        </aside>

      </div>
    </main>
  );
};

export default ServicesPage;
