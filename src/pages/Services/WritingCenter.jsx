import { useState } from "react";
import { useNavigate } from "react-router-dom";

// ─── Accent colour for this page: pale mint (mint card) ──────────────────────
// bg-[#eaf5ee]  accent-[#1a6644]

// ─── Mock Data ────────────────────────────────────────────────────────────────

const SERVICES_OFFERED = [
  {
    title: "One-on-one tutoring",
    desc: "In-person or online sessions with professional and peer tutors at any stage of your writing process.",
    icon: "person",
  },
  {
    title: "Group sessions",
    desc: "Collaborative workshops covering academic writing, citations, structure, and communication skills.",
    icon: "group",
  },
  {
    title: "Library walk-ins",
    desc: "Drop in during open hours at the RNL or JGJL without an appointment for quick guidance.",
    icon: "door",
  },
  {
    title: "Academic writing",
    desc: "Help with essays, research papers, theses, conference papers, and CVs — from outline to final draft.",
    icon: "pen",
  },
  {
    title: "Public communication",
    desc: "Presentation coaching, delivery feedback, and support for public-facing communication tasks.",
    icon: "mic",
  },
  {
    title: "Responsible AI use",
    desc: "Guidance on ethically and effectively integrating AI tools in your academic and professional work.",
    icon: "ai",
  },
];

const LOCATIONS = [
  { campus: "Beirut", location: "Our Libraries, Room 807", phone: "+961-1-786456 Ext. 1583" },
  { campus: "Byblos", location: "Joseph G. Jabbra Library, Room 206", phone: "+961-9-547254 Ext. 2244" },
];

const STAFF = [
  { name: "Dr. Reine Azzi",  title: "Director, Writing and Communication Center",           email: "reine.azzi@lau.edu.lb" },
  { name: "Ms. Maya Akiki",  title: "Academic Writing Coordinator",                         email: "maya.akiki@lau.edu.lb" },
];

// ─── Icon component ───────────────────────────────────────────────────────────

const WIcon = ({ name }) => {
  const icons = {
    person: <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>,
    group:  <><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></>,
    door:   <><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></>,
    pen:    <><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></>,
    mic:    <><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></>,
    ai:     <><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></>,
  };
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      {icons[name]}
      {name === "person" && <circle cx="12" cy="7" r="4" />}
    </svg>
  );
};

// ─── Shared back button ───────────────────────────────────────────────────────

const BackButton = ({ onClick }) => (
  <button
    onClick={onClick}
    className="mb-6 flex items-center gap-1.5 text-[13px] font-medium text-[#5ecba1] transition-opacity hover:opacity-80"
  >
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <path d="M19 12H5M12 5l-7 7 7 7" />
    </svg>
    Back to Services
  </button>
);

// ─── Page ─────────────────────────────────────────────────────────────────────

const WritingCenterPage = () => {
  const navigate = useNavigate();
  // Toggle for showing contact staff
  const [showStaff, setShowStaff] = useState(false);

  return (
    <div className="min-h-screen bg-[#f2f6f3] dark:bg-[#1a1a1a]">

      {/* Hero — pale mint accent */}
      <section className="bg-[linear-gradient(165deg,#0A2E22_0%,#061C14_100%)] px-8 md:px-16 py-12 relative overflow-hidden">
        <div className="absolute -right-10 -bottom-20 w-72 h-72 rounded-full bg-[#1a6644]/8 pointer-events-none" />
        <BackButton onClick={() => navigate("/Services")} />
        <p className="text-[#5ecba1] text-[10px] font-semibold tracking-[0.14em] uppercase mb-2">
          Services · Writing Center
        </p>
        <h1 className="text-white text-4xl font-bold leading-tight mb-2">
          Writing & Communication Center
        </h1>
        <p className="text-white/65 text-sm max-w-lg leading-relaxed">
          A free resource for the entire LAU community — supporting students, faculty, staff, and alumni in all areas of writing and communication.
        </p>
        <a
          href="mailto:wcc@lau.edu.lb"
          className="mt-5 inline-flex items-center gap-2 bg-[#1a6644] hover:bg-[#14533a] text-white px-5 py-2.5 rounded-xl text-[13px] font-semibold transition-colors duration-150"
        >
          Book an appointment
          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </a>
      </section>

      <div className="px-8 md:px-16 py-10 max-w-4xl">

        {/* Intro quote */}
        <div className="bg-white dark:bg-[#242424] rounded-2xl border border-[#cfe2d6] dark:border-[#333] p-6 mb-4">
          <p className="text-[#3d6650] dark:text-[#888] text-[14px] leading-relaxed italic">
            "Whether you are brainstorming, drafting, revising, or finalizing your work, our team works with you at every stage of the process to better provide guidance on content, structure, language, delivery and the responsible use of AI."
          </p>
        </div>

        {/* Services grid */}
        <div className="mb-4">
          <h3 className="text-[#162a1f] dark:text-white text-[15px] font-bold mb-3">What we offer</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {SERVICES_OFFERED.map((s) => (
              <div
                key={s.title}
                className="bg-white dark:bg-[#242424] rounded-xl border border-[#cfe2d6] dark:border-[#333] p-4 flex gap-3"
              >
                <div className="w-9 h-9 rounded-lg bg-[#eaf5ee] dark:bg-[#2e2e2e] flex items-center justify-center flex-shrink-0 text-[#1a6644] dark:text-[#5ecba1]">
                  <WIcon name={s.icon} />
                </div>
                <div>
                  <p className="text-[#162a1f] dark:text-white text-[13px] font-bold mb-0.5">{s.title}</p>
                  <p className="text-[#5e7a68] dark:text-[#888] text-[12px] leading-relaxed">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Locations */}
        <div className="bg-white dark:bg-[#242424] rounded-2xl border border-[#cfe2d6] dark:border-[#333] p-6 mb-4">
          <h3 className="text-[#162a1f] dark:text-white text-[15px] font-bold mb-3">Hours & location</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
            {LOCATIONS.map((l) => (
              <div key={l.campus} className="bg-[#eaf5ee] dark:bg-[#2e2e2e] rounded-xl p-4">
                <p className="text-[#1a6644] dark:text-[#5ecba1] text-[10px] font-semibold tracking-wider uppercase mb-1">
                  {l.campus}
                </p>
                <p className="text-[#162a1f] dark:text-white text-[13px] font-semibold mb-0.5">{l.location}</p>
                <p className="text-[#5e7a68] dark:text-[#888] text-[12px]">{l.phone}</p>
              </div>
            ))}
          </div>
          <a
            href="https://lau.mywconline.com/"
            target="_blank"
            rel="noreferrer"
            className="text-[#1a6644] dark:text-[#5ecba1] text-[12px] font-medium underline underline-offset-2"
          >
            View weekly schedule →
          </a>
        </div>

        {/* Contact / Staff toggle */}
        <div className="bg-white dark:bg-[#242424] rounded-2xl border border-[#cfe2d6] dark:border-[#333] p-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-[#162a1f] dark:text-white text-[15px] font-bold">Contact us</h3>
            <button
              onClick={() => setShowStaff((v) => !v)}
              className="text-[#1a6644] dark:text-[#5ecba1] text-[12px] font-medium underline underline-offset-2"
            >
              {showStaff ? "Hide staff" : "Show staff directory"}
            </button>
          </div>

          <div className="flex flex-col gap-2 mb-4">
            <a href="mailto:wcc@lau.edu.lb" className="flex items-center gap-2 text-[13px] text-[#162a1f] dark:text-white">
              <span className="w-6 h-6 rounded-lg bg-[#eaf5ee] dark:bg-[#2e2e2e] flex items-center justify-center text-[#1a6644] dark:text-[#5ecba1]">
                <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
              </span>
              wcc@lau.edu.lb
            </a>
          </div>

          {/* Collapsible staff list */}
          {showStaff && (
            <div className="border-t border-[#cfe2d6] dark:border-[#333] pt-4 space-y-3">
              {STAFF.map((s) => (
                <div key={s.name} className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-[#eaf5ee] dark:bg-[#2e2e2e] flex items-center justify-center text-[#1a6644] dark:text-[#5ecba1] text-[12px] font-bold flex-shrink-0">
                    {s.name.split(" ").filter(w => w.match(/^[A-Z]/)).map(w => w[0]).join("").slice(0, 2)}
                  </div>
                  <div>
                    <p className="text-[#162a1f] dark:text-white text-[13px] font-semibold">{s.name}</p>
                    <p className="text-[#5e7a68] dark:text-[#888] text-[11px]">{s.title}</p>
                    <a href={`mailto:${s.email}`} className="text-[#1a6644] dark:text-[#5ecba1] text-[11px] underline underline-offset-2">
                      {s.email}
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default WritingCenterPage;
