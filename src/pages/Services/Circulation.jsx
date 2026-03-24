import { useState } from "react";
import { useNavigate } from "react-router-dom";


// ─── Accent colour for this page: deep forest (dark card) ────────────────────
// bg-[#5ecba1]  accent-[#5ecba1]


// ─── Mock Data ────────────────────────────────────────────────────────────────


const LOAN_TABLE = [
  { category: "Faculty, full-time",        items: 50,  period: "90 days",  renewals: 3 },
  { category: "Faculty, part-time",        items: 25,  period: "90 days",  renewals: 3 },
  { category: "Executive officers",        items: 50,  period: "90 days",  renewals: 3 },
  { category: "Staff, full-time",          items: 15,  period: "4 weeks",  renewals: 3 },
  { category: "Staff, part-time",          items: 5,   period: "4 weeks",  renewals: 3 },
  { category: "Graduate students",         items: 20,  period: "6 weeks",  renewals: 3 },
  { category: "Undergraduate students",    items: 10,  period: "2 weeks",  renewals: 3 },
  { category: "Alumni ($50 deposit)",      items: 2,   period: "4 weeks",  renewals: 3 },
  { category: "LAU retirees",              items: 5,   period: "4 weeks",  renewals: 3 },
  { category: "Institutions (annual sub)", items: 30,  period: "4 weeks",  renewals: 3 },
  { category: "Unaffiliated users",        items: 3,   period: "4 weeks",  renewals: 3 },
];


const RULES = [
  "No food or drink is allowed in any library area.",
  "Smoking or vaping is not permitted in the library.",
  "Using belongings to reserve a space is not permitted.",
  "Do not leave belongings unattended — the library is not responsible for lost items.",
  "Overdue fine: $0.25 per day per item.",
  "Lost items are charged at replacement price.",
  "Library privileges may be revoked for violations or disruptive behaviour.",
];


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


// ─── Info card ────────────────────────────────────────────────────────────────


const InfoCard = ({ title, children, accent = false }) => (
  <div className={`rounded-2xl border p-6 mb-4 ${
    accent
      ? "bg-[#1a6644] border-transparent"
      : "bg-white dark:bg-[#242424] border-[#cfe2d6] dark:border-[#333]"
  }`}>
    <h3 className={`text-[15px] font-bold mb-3 ${accent ? "text-white" : "text-[#162a1f] dark:text-white"}`}>
      {title}
    </h3>
    {children}
  </div>
);


// ─── Page ─────────────────────────────────────────────────────────────────────


const CirculationPage = () => {
  const navigate = useNavigate();
  // Toggle for showing full loan table
  const [showFullTable, setShowFullTable] = useState(false);
  const visibleRows = showFullTable ? LOAN_TABLE : LOAN_TABLE.slice(0, 4);


  return (
    <div className="min-h-screen bg-[#f2f6f3] dark:bg-[#1a1a1a]">


      {/* Hero — deep forest accent */}
      <section className="bg-[linear-gradient(165deg,#0A2E22_0%,#061C14_100%)] px-8 md:px-16 py-12 relative overflow-hidden">
        <div className="absolute -right-10 -bottom-20 w-72 h-72 rounded-full bg-white/5 pointer-events-none" />
        <BackButton onClick={() => navigate("/Services")} />
        <p className="text-[#5ecba1] text-[10px] font-semibold tracking-[0.14em] uppercase mb-2">
          Services · Circulation
        </p>
        <h1 className="text-white text-4xl font-bold leading-tight mb-2">Borrowing & Renewals</h1>
        <p className="text-white/55 text-sm max-w-lg leading-relaxed">
          Rules, loan periods, and procedures for borrowing LAU library materials — for students, faculty, staff, and alumni.
        </p>
      </section>


      <div className="px-8 md:px-16 py-10 max-w-4xl">


        {/* Quick stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
          {[
            { label: "Max items (UG)",  value: "10" },
            { label: "Loan period (UG)", value: "2 wks" },
            { label: "Renewals",         value: "3×" },
            { label: "Overdue fine",     value: "$0.25/day" },
          ].map((s) => (
            <div key={s.label} className="bg-white dark:bg-[#242424] rounded-xl border border-[#cfe2d6] dark:border-[#333] p-4">
              <p className="text-[#5e7a68] dark:text-[#888] text-[11px] mb-1">{s.label}</p>
              <p className="text-[#162a1f] dark:text-white text-xl font-bold">{s.value}</p>
            </div>
          ))}
        </div>


        {/* Loan period table */}
        <InfoCard title="Loan periods by borrower type">
          <div className="overflow-x-auto">
            <table className="w-full text-[13px]">
              <thead>
                <tr className="border-b border-[#cfe2d6] dark:border-[#333]">
                  {["Borrower category", "Items", "Period", "Renewals"].map((h) => (
                    <th key={h} className="text-left text-[#5e7a68] dark:text-[#888] font-semibold pb-2 pr-4">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {visibleRows.map((r) => (
                  <tr key={r.category} className="border-b border-[#f0f7f3] dark:border-[#2e2e2e]">
                    <td className="py-2 pr-4 text-[#162a1f] dark:text-white">{r.category}</td>
                    <td className="py-2 pr-4 text-[#162a1f] dark:text-white font-medium">{r.items}</td>
                    <td className="py-2 pr-4 text-[#162a1f] dark:text-white">{r.period}</td>
                    <td className="py-2 text-[#1a6644] dark:text-[#5ecba1] font-medium">{r.renewals}×</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <button
            onClick={() => setShowFullTable((v) => !v)}
            className="mt-3 text-[#1a6644] dark:text-[#5ecba1] text-[12px] font-medium underline underline-offset-2"
          >
            {showFullTable ? "Show less" : `Show all ${LOAN_TABLE.length} categories`}
          </button>
        </InfoCard>


        {/* Renewals & returns */}
        <InfoCard title="Renewals, returns & reservations">
          <p className="text-[#5e7a68] dark:text-[#888] text-[13px] leading-relaxed mb-3">
            Books and audiovisual materials may be renewed multiple times unless reserved by another user.
            Equipment (laptops, iPads) may be renewed twice only.
          </p>
          <p className="text-[#5e7a68] dark:text-[#888] text-[13px] leading-relaxed mb-3">
            Renewals can be done online via the Library Catalog, by emailing{" "}
            <a href="mailto:circulation@lau.edu.lb" className="text-[#1a6644] dark:text-[#5ecba1] underline underline-offset-2">
              circulation@lau.edu.lb
            </a>
            , or by calling Ext. 1213 / 2280 / 2977.
          </p>
          <p className="text-[#5e7a68] dark:text-[#888] text-[13px] leading-relaxed">
            Reserved items: when a reserved item is returned, the requester is notified by email.
          </p>
        </InfoCard>


        {/* Rules */}
        <InfoCard title="Discipline & responsibilities">
          <ul className="space-y-2">
            {RULES.map((r) => (
              <li key={r} className="flex items-start gap-2.5 text-[13px] text-[#5e7a68] dark:text-[#888]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#1a6644] dark:bg-[#5ecba1] mt-1.5 flex-shrink-0" />
                {r}
              </li>
            ))}
          </ul>
        </InfoCard>


        {/* Contact */}
        <InfoCard title="Contact circulation" accent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { campus: "Email",   value: "circulation@lau.edu.lb", href: "mailto:circulation@lau.edu.lb" },
              { campus: "RNL Beirut",  value: "Ext. 1213",  href: null },
              { campus: "JGJL Byblos", value: "Ext. 2280",  href: null },
            ].map((c) => (
              <div key={c.campus} className="bg-white/10 rounded-xl p-4">
                <p className="text-[#5ecba1] text-[10px] font-semibold tracking-wider uppercase mb-1">{c.campus}</p>
                {c.href
                  ? <a href={c.href} className="text-white text-[13px] underline underline-offset-2">{c.value}</a>
                  : <p className="text-white text-[13px]">{c.value}</p>
                }
              </div>
            ))}
          </div>
        </InfoCard>


      </div>
    </div>
  );
};


export default CirculationPage;



