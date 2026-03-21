import { useState } from "react";
import { useNavigate } from "react-router-dom";

// ─── Accent colour for this page: mid forest (mid card) ──────────────────────
// bg-[#2d6a4f]  accent-[#95d5b2]

// ─── Mock Data ────────────────────────────────────────────────────────────────

// Free page grants per semester/year by user type
const PAGE_GRANTS = [
  { type: "Undergraduate",                    fall: "300", spring: "300", summer: "150" },
  { type: "Graduate",                          fall: "400", spring: "400", summer: "200" },
  { type: "Medical",                           fall: "750/yr", spring: "—",     summer: "—"   },
  { type: "Research centers & institutions",   fall: "1,500/yr", spring: "—",  summer: "—"   },
  { type: "Students (other institutions)",     fall: "500/yr", spring: "—",    summer: "—"   },
  { type: "Individual researchers",            fall: "60/day", spring: "—",    summer: "—"   },
];

// Per-page pricing for top-ups
const PRICING = [
  { desc: "A4 black & white",  price: "$0.06" },
  { desc: "A4 colour",         price: "$0.30" },
  { desc: "A3 black & white",  price: "$0.12" },
  { desc: "A3 colour",         price: "$0.60" },
];

// Credit bundles
const BUNDLES = [
  { pages: 50,  cost: "$3.00" },
  { pages: 100, cost: "$6.00" },
  { pages: 150, cost: "$9.00" },
  { pages: 200, cost: "$12.00" },
  { pages: 250, cost: "$15.00" },
  { pages: 300, cost: "$18.00" },
];

// ─── Shared back button ───────────────────────────────────────────────────────

const BackButton = ({ onClick }) => (
  <button
    onClick={onClick}
    className="flex items-center gap-1.5 text-[#95d5b2] text-[13px] font-medium hover:opacity-80 transition-opacity mb-6"
  >
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <path d="M19 12H5M12 5l-7 7 7 7" />
    </svg>
    Back to Services
  </button>
);

// ─── Page ─────────────────────────────────────────────────────────────────────

const PrintingPage = () => {
  const navigate = useNavigate();
  // Tab: "grants" or "pricing"
  const [tab, setTab] = useState("grants");

  return (
    <div className="min-h-screen bg-[#f2f6f3] dark:bg-[#1a1a1a]">

      {/* Hero — mid forest accent */}
      <section className="bg-[#2d6a4f] px-8 md:px-16 py-12 relative overflow-hidden">
        <div className="absolute -right-10 -bottom-20 w-72 h-72 rounded-full bg-white/5 pointer-events-none" />
        <BackButton onClick={() => navigate("/Services")} />
        <p className="text-[#95d5b2] text-[10px] font-semibold tracking-[0.14em] uppercase mb-2">
          Services · Printing
        </p>
        <h1 className="text-white text-4xl font-bold leading-tight mb-2">
          Printing, Scanning & Photocopying
        </h1>
        <p className="text-white/55 text-sm max-w-lg leading-relaxed">
          Print, scan, and photocopy at any LAU library. Free page grants every semester, with top-up options available.
        </p>
      </section>

      <div className="px-8 md:px-16 py-10 max-w-4xl">

        {/* Quick stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
          {[
            { label: "UG grant / semester", value: "300 pgs" },
            { label: "Grad grant / semester", value: "400 pgs" },
            { label: "B&W A4",              value: "$0.06" },
            { label: "Colour A4",           value: "$0.30" },
          ].map((s) => (
            <div key={s.label} className="bg-white dark:bg-[#242424] rounded-xl border border-[#cfe2d6] dark:border-[#333] p-4">
              <p className="text-[#5e7a68] dark:text-[#888] text-[11px] mb-1">{s.label}</p>
              <p className="text-[#162a1f] dark:text-white text-xl font-bold">{s.value}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="bg-white dark:bg-[#242424] rounded-2xl border border-[#cfe2d6] dark:border-[#333] p-6 mb-4">

          <div className="flex gap-2 mb-5">
            {[
              { key: "grants",  label: "Free page grants" },
              { key: "pricing", label: "Top-up pricing" },
            ].map((t) => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={`flex-1 h-9 rounded-xl text-[13px] font-semibold transition-colors duration-150 border ${
                  tab === t.key
                    ? "bg-[#2d6a4f] text-white border-[#2d6a4f]"
                    : "bg-[#f7fbf8] dark:bg-[#2e2e2e] text-[#3d6650] dark:text-[#888] border-[#c5ddd0] dark:border-[#333] hover:border-[#2d6a4f]"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {tab === "grants" && (
            <>
              <p className="text-[#5e7a68] dark:text-[#888] text-[12px] mb-3 leading-relaxed">
                Each valid library user receives a free page allowance each semester. Faculty and staff print free of charge.
              </p>
              <div className="overflow-x-auto">
                <table className="w-full text-[13px]">
                  <thead>
                    <tr className="border-b border-[#cfe2d6] dark:border-[#333]">
                      {["User type", "Fall", "Spring", "Summer"].map((h) => (
                        <th key={h} className="text-left text-[#5e7a68] dark:text-[#888] font-semibold pb-2 pr-4">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {PAGE_GRANTS.map((g) => (
                      <tr key={g.type} className="border-b border-[#f0f7f3] dark:border-[#2e2e2e]">
                        <td className="py-2 pr-4 text-[#162a1f] dark:text-white">{g.type}</td>
                        <td className="py-2 pr-4 text-[#2d6a4f] dark:text-[#95d5b2] font-medium">{g.fall}</td>
                        <td className="py-2 pr-4 text-[#2d6a4f] dark:text-[#95d5b2] font-medium">{g.spring}</td>
                        <td className="py-2 text-[#2d6a4f] dark:text-[#95d5b2] font-medium">{g.summer}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {tab === "pricing" && (
            <>
              <p className="text-[#5e7a68] dark:text-[#888] text-[12px] mb-4 leading-relaxed">
                Top up your print balance via the{" "}
                <a href="https://webapps.lau.edu.lb/ocrs" target="_blank" rel="noreferrer"
                  className="text-[#2d6a4f] dark:text-[#95d5b2] underline underline-offset-2">
                  Credit Request Form
                </a>
                . Credits are added to your student fees statement. Unused credits do not carry over between semesters.
              </p>

              {/* Per-page rates */}
              <h4 className="text-[#162a1f] dark:text-white text-[13px] font-bold mb-2">Per-page rates</h4>
              <div className="grid grid-cols-2 gap-2 mb-5">
                {PRICING.map((p) => (
                  <div key={p.desc} className="bg-[#f7fbf8] dark:bg-[#2e2e2e] rounded-xl border border-[#cfe2d6] dark:border-[#333] px-4 py-3 flex justify-between items-center">
                    <span className="text-[#5e7a68] dark:text-[#888] text-[13px]">{p.desc}</span>
                    <span className="text-[#2d6a4f] dark:text-[#95d5b2] font-bold text-[13px]">{p.price}</span>
                  </div>
                ))}
              </div>

              {/* Bundle pricing */}
              <h4 className="text-[#162a1f] dark:text-white text-[13px] font-bold mb-2">Credit bundles</h4>
              <div className="grid grid-cols-3 gap-2">
                {BUNDLES.map((b) => (
                  <div key={b.pages} className="bg-[#f7fbf8] dark:bg-[#2e2e2e] rounded-xl border border-[#cfe2d6] dark:border-[#333] px-4 py-3 text-center">
                    <p className="text-[#162a1f] dark:text-white font-bold text-[15px]">{b.pages} pgs</p>
                    <p className="text-[#2d6a4f] dark:text-[#95d5b2] text-[13px] font-medium">{b.cost}</p>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Scanning */}
        <div className="bg-white dark:bg-[#242424] rounded-2xl border border-[#cfe2d6] dark:border-[#333] p-6 mb-4">
          <h3 className="text-[#162a1f] dark:text-white text-[15px] font-bold mb-2">Scanning — free of charge</h3>
          <p className="text-[#5e7a68] dark:text-[#888] text-[13px] leading-relaxed">
            Self-service scanners are available at all LAU Libraries at no cost. Scan to USB drive or email in multiple file formats. For assistance, contact Library IT Helpdesk at Ext. 1645 (Beirut) or Ext. 2948 (Byblos).
          </p>
        </div>

        {/* Important notes */}
        <div className="bg-[#2d6a4f] rounded-2xl p-6">
          <h3 className="text-white text-[15px] font-bold mb-3">Important notes</h3>
          <ul className="space-y-2">
            {[
              "Online credit requests are automatically added to your student fees statement.",
              "Unused credits are not carried forward between semesters.",
              "Refunds are given only in cases of equipment malfunction.",
              "Report printer issues to IT Helpdesk: Ext. 1645 (Beirut) or Ext. 2948 (Byblos).",
              "The library abides by US Copyright Law Fair Use provisions — excessive reproduction may be refused.",
            ].map((n) => (
              <li key={n} className="flex items-start gap-2.5 text-[13px] text-white/70">
                <span className="w-1.5 h-1.5 rounded-full bg-[#95d5b2] mt-1.5 flex-shrink-0" />
                {n}
              </li>
            ))}
          </ul>
        </div>

      </div>
    </div>
  );
};

export default PrintingPage;