import { useState } from "react";
import { useNavigate } from "react-router-dom";

// ─── Accent colour for this page: sage green (sage card) ─────────────────────
// bg-[#d6ede0]  accent-[#1a6644]

// ─── Mock Data ────────────────────────────────────────────────────────────────

const CAMPUS_ROOMS = {
  Beirut: {
    library: "Riyad Nassar Library (RNL)",
    equipment: "Whiteboards and flipcharts",
    cctv: true,
    rooms: [
      { id: "RNL-805", name: "RNL 805 – Jawdat R. Haydar" },
      { id: "RNL-806A", name: "RNL 806 A" },
      { id: "RNL-806B", name: "RNL 806 B" },
      { id: "RNL-807A", name: "RNL 807 A" },
      { id: "RNL-807B", name: "RNL 807 B" },
    ],
  },
  Byblos: {
    library: "Joseph G. Jabbra Library (JGJL) & HSL",
    equipment: "TV screen for projection (JGJL) · Whiteboards and flipcharts (HSL)",
    cctv: true,
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

const RULES = [
  "GSRs can be booked for a maximum of 2 hours at any one time, renewable upon availability.",
  "When vacant, rooms are available on a first-come, first-served basis.",
  "Rooms are intended for groups of 2 or more users.",
  "If a room is unattended for over 15 minutes, the booking may be released.",
  "A valid LAU ID card is required to reserve a room.",
  "Users must vacate rooms no less than 10 minutes before library closing time.",
  "Keep noise to a minimum — rooms are not soundproof.",
  "Leave the room in good condition. The library is not responsible for unattended items.",
  "Reservation schedule is updated every Friday.",
];

// ─── Shared back button ───────────────────────────────────────────────────────

const BackButton = ({ onClick }) => (
  <button
    onClick={onClick}
    className="flex items-center gap-1.5 text-[#1a6644] text-[13px] font-medium hover:opacity-80 transition-opacity mb-6"
  >
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <path d="M19 12H5M12 5l-7 7 7 7" />
    </svg>
    Back to Services
  </button>
);

// ─── Page ─────────────────────────────────────────────────────────────────────

const StudyRoomsPage = () => {
  const navigate = useNavigate();
  // Campus tab state
  const [campus, setCampus] = useState("Beirut");
  const data = CAMPUS_ROOMS[campus];

  return (
    <div className="min-h-screen bg-[#f2f6f3] dark:bg-[#1a1a1a]">

      {/* Hero — sage green accent */}
      <section className="bg-[#d6ede0] dark:bg-[#1a3a2e] px-8 md:px-16 py-12 relative overflow-hidden">
        <div className="absolute -right-10 -bottom-20 w-72 h-72 rounded-full bg-[#1a6644]/8 pointer-events-none" />
        <BackButton onClick={() => navigate("/Services")} />
        <p className="text-[#1a6644] dark:text-[#5ecba1] text-[10px] font-semibold tracking-[0.14em] uppercase mb-2">
          Services · Study Rooms
        </p>
        <h1 className="text-[#102a1c] dark:text-white text-4xl font-bold leading-tight mb-2">
          Group Study Rooms
        </h1>
        <p className="text-[#3d6650] dark:text-white/55 text-sm max-w-lg leading-relaxed">
          Book private study rooms at Beirut or Byblos campus for collaborative sessions. Valid LAU ID required.
        </p>
      </section>

      <div className="px-8 md:px-16 py-10 max-w-4xl">

        {/* Quick stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
          {[
            { label: "Max booking",   value: "2 hrs" },
            { label: "Min group size", value: "2 people" },
            { label: "Beirut rooms",   value: "5" },
            { label: "Byblos rooms",   value: "14" },
          ].map((s) => (
            <div key={s.label} className="bg-white dark:bg-[#242424] rounded-xl border border-[#cfe2d6] dark:border-[#333] p-4">
              <p className="text-[#5e7a68] dark:text-[#888] text-[11px] mb-1">{s.label}</p>
              <p className="text-[#162a1f] dark:text-white text-xl font-bold">{s.value}</p>
            </div>
          ))}
        </div>

        {/* Campus toggle + room list */}
        <div className="bg-white dark:bg-[#242424] rounded-2xl border border-[#cfe2d6] dark:border-[#333] p-6 mb-4">
          <h3 className="text-[#162a1f] dark:text-white text-[15px] font-bold mb-4">Available rooms</h3>

          {/* Toggle pills */}
          <div className="flex gap-2 mb-5">
            {["Beirut", "Byblos"].map((c) => (
              <button
                key={c}
                onClick={() => setCampus(c)}
                className={`flex-1 h-9 rounded-xl text-[13px] font-semibold transition-colors duration-150 border ${
                  campus === c
                    ? "bg-[#1a6644] text-white border-[#1a6644]"
                    : "bg-[#f7fbf8] dark:bg-[#2e2e2e] text-[#3d6650] dark:text-[#888] border-[#c5ddd0] dark:border-[#333] hover:border-[#1a6644]"
                }`}
              >
                {c === "Beirut" ? "🏙 Beirut (RNL)" : "🌿 Byblos (JGJL / HSL)"}
              </button>
            ))}
          </div>

          {/* Library name + equipment badge */}
          <p className="text-[#5e7a68] dark:text-[#888] text-[12px] mb-1">{data.library}</p>
          <div className="flex flex-wrap gap-2 mb-4">
            <span className="bg-[#eaf5ee] dark:bg-[#2e2e2e] text-[#1a6644] dark:text-[#5ecba1] text-[11px] font-medium px-3 py-1 rounded-full">
              {data.equipment}
            </span>
            {data.cctv && (
              <span className="bg-[#eaf5ee] dark:bg-[#2e2e2e] text-[#1a6644] dark:text-[#5ecba1] text-[11px] font-medium px-3 py-1 rounded-full">
                CCTV monitored
              </span>
            )}
          </div>

          {/* Room grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {data.rooms.map((room) => (
              <div
                key={room.id}
                className="bg-[#f7fbf8] dark:bg-[#2e2e2e] border border-[#cfe2d6] dark:border-[#333] rounded-xl px-4 py-3"
              >
                <p className="text-[#162a1f] dark:text-white text-[13px] font-semibold">{room.name}</p>
                <p className="text-[#5e7a68] dark:text-[#888] text-[11px] mt-0.5">{campus} campus</p>
              </div>
            ))}
          </div>

          {/* Book CTA */}
          <a
            href={
              campus === "Beirut"
                ? "http://lau.libcal.com/rooms.php?i=1566"
                : "https://lau.libcal.com/rooms.php?i=16531"
            }
            target="_blank"
            rel="noreferrer"
            className="mt-5 flex items-center justify-center gap-2 w-full h-10 bg-[#1a6644] hover:bg-[#1a3a2e] text-white rounded-xl text-[13px] font-semibold transition-colors duration-150"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="4" width="18" height="18" rx="2" />
              <line x1="3" y1="10" x2="21" y2="10" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="16" y1="2" x2="16" y2="6" />
            </svg>
            Book a room at {campus} campus
          </a>
        </div>

        {/* Rules */}
        <div className="bg-white dark:bg-[#242424] rounded-2xl border border-[#cfe2d6] dark:border-[#333] p-6">
          <h3 className="text-[#162a1f] dark:text-white text-[15px] font-bold mb-3">Rules for using GSRs</h3>
          <ul className="space-y-2">
            {RULES.map((r) => (
              <li key={r} className="flex items-start gap-2.5 text-[13px] text-[#5e7a68] dark:text-[#888]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#1a6644] dark:bg-[#5ecba1] mt-1.5 flex-shrink-0" />
                {r}
              </li>
            ))}
          </ul>
        </div>

      </div>
    </div>
  );
};

export default StudyRoomsPage;