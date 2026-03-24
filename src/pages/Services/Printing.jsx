import { useState } from "react";
import { useNavigate } from "react-router-dom";


// ─── Accent colour for this page: mid forest (mid card) ──────────────────────
// bg-[#2d6a4f]  accent-[#5ecba1]


// ─── Mock Data ────────────────────────────────────────────────────────────────


// Free page grants per semester/year by user type
const PAGE_GRANTS = [
  { type: "Undergraduate",                  fall: "300",      spring: "300", summer: "150" },
  { type: "Graduate",                        fall: "400",      spring: "400", summer: "200" },
  { type: "Medical",                         fall: "750/yr",   spring: "—",   summer: "—"   },
  { type: "Research centers & institutions", fall: "1,500/yr", spring: "—",   summer: "—"   },
  { type: "Students (other institutions)",   fall: "500/yr",   spring: "—",   summer: "—"   },
  { type: "Individual researchers",          fall: "60/day",   spring: "—",   summer: "—"   },
];


// Per-page pricing for top-ups
const PRICING = [
  { desc: "A4 black & white", price: "$0.06" },
  { desc: "A4 colour",        price: "$0.30" },
  { desc: "A3 black & white", price: "$0.12" },
  { desc: "A3 colour",        price: "$0.60" },
];


// Prepaid credit bundles
const BUNDLES = [
  { pages: 50,  cost: "$3.00"  },
  { pages: 100, cost: "$6.00"  },
  { pages: 150, cost: "$9.00"  },
  { pages: 200, cost: "$12.00" },
  { pages: 250, cost: "$15.00" },
  { pages: 300, cost: "$18.00" },
];


// ─── Shared back button ───────────────────────────────────────────────────────


const BackButton = ({ onClick }) => (
  <button
    onClick={onClick}
    className="mb-6 flex items-center gap-1.5 text-[13px] font-medium text-[#5ecba1] transition-opacity hover:opacity-80"
  >
    <svg
      aria-hidden="true"
      className="w-4 h-4"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
    >
      <path d="M19 12H5M12 5l-7 7 7 7" />
    </svg>
    Back to Services
  </button>
);


// ─── Main Component ───────────────────────────────────────────────────────────


const PrintingPage = () => {
  const navigate = useNavigate();
  const [tab, setTab] = useState("grants");


  return (
    <main className="min-h-screen bg-[#f2f6f3] dark:bg-[#1a1a1a]">


      {/* ── Hero ── */}
      <header className="bg-[linear-gradient(165deg,#0A2E22_0%,#061C14_100%)] px-8 md:px-16 py-12 relative overflow-hidden">
        <div aria-hidden="true" className="absolute -right-10 -bottom-20 w-72 h-72 rounded-full bg-white/5 pointer-events-none" />
        <BackButton onClick={() => navigate("/Services")} />
        <p className="text-[#5ecba1] text-[10px] font-semibold tracking-[0.14em] uppercase mb-2">
          <span aria-label="Section: Services, Page: Printing">Services · Printing</span>
        </p>
        <h1 className="text-white text-4xl font-bold leading-tight mb-2">
          Printing, Scanning &amp; Photocopying
        </h1>
        <p className="text-white/55 text-sm max-w-lg leading-relaxed">
          Print, scan, and photocopy at any LAU library. Free page grants every semester,
          with top-up options available.
        </p>
      </header>


      <div className="px-8 md:px-16 py-10 max-w-4xl">


        {/* ── Quick stats ── */}
        <section aria-label="Key figures">
          <h2 className="sr-only">Key figures</h2>
          <dl className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
            {[
              { label: "UG grant / semester", value: "300 pgs" },
              { label: "Grad grant / semester", value: "400 pgs" },
              { label: "B&W A4",               value: "$0.06"   },
              { label: "Colour A4",            value: "$0.30"   },
            ].map((s) => (
              <div
                key={s.label}
                className="bg-white dark:bg-[#242424] rounded-xl border border-[#cfe2d6] dark:border-[#333] p-4"
              >
                <dt className="text-[#5e7a68] dark:text-[#888] text-[11px] mb-1">{s.label}</dt>
                <dd className="text-[#162a1f] dark:text-white text-xl font-bold">{s.value}</dd>
              </div>
            ))}
          </dl>
        </section>


        {/* ── Grants / Pricing tabs ── */}
        <section
          aria-label="Page grants and top-up pricing"
          className="bg-white dark:bg-[#242424] rounded-2xl border border-[#cfe2d6] dark:border-[#333] p-6 mb-4"
        >
          {/* Tab bar */}
          <nav aria-label="Printing information tabs">
            <ul role="tablist" className="flex gap-2 mb-5 list-none p-0 m-0">
              {[
                { key: "grants",  label: "Free page grants" },
                { key: "pricing", label: "Top-up pricing"   },
              ].map((t) => (
                <li key={t.key} role="presentation" className="flex-1">
                  <button
                    role="tab"
                    id={`tab-${t.key}`}
                    aria-selected={tab === t.key}
                    aria-controls={`panel-${t.key}`}
                    onClick={() => setTab(t.key)}
                    className={`w-full h-9 rounded-xl text-[13px] font-semibold transition-colors duration-150 border ${
                      tab === t.key
                        ? "bg-[#2d6a4f] text-white border-[#2d6a4f]"
                        : "bg-[#f7fbf8] dark:bg-[#2e2e2e] text-[#3d6650] dark:text-[#888] border-[#c5ddd0] dark:border-[#333] hover:border-[#2d6a4f]"
                    }`}
                  >
                    {t.label}
                  </button>
                </li>
              ))}
            </ul>
          </nav>


          {/* Grants panel */}
          <section
            role="tabpanel"
            id="panel-grants"
            aria-labelledby="tab-grants"
            hidden={tab !== "grants"}
          >
            <p className="text-[#5e7a68] dark:text-[#888] text-[12px] mb-3 leading-relaxed">
              Each valid library user receives a free page allowance each semester.
              Faculty and staff print free of charge.
            </p>
            <div className="overflow-x-auto">
              <table className="w-full text-[13px]">
                <caption className="sr-only">Free page grants by user type and semester</caption>
                <thead>
                  <tr className="border-b border-[#cfe2d6] dark:border-[#333]">
                    {["User type", "Fall", "Spring", "Summer"].map((h) => (
                      <th
                        key={h}
                        scope="col"
                        className="text-left text-[#5e7a68] dark:text-[#888] font-semibold pb-2 pr-4"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {PAGE_GRANTS.map((g) => (
                    <tr key={g.type} className="border-b border-[#f0f7f3] dark:border-[#2e2e2e]">
                      <th scope="row" className="py-2 pr-4 text-[#162a1f] dark:text-white font-normal text-left">
                        {g.type}
                      </th>
                      <td className="py-2 pr-4 text-[#2d6a4f] dark:text-[#5ecba1] font-medium">{g.fall}</td>
                      <td className="py-2 pr-4 text-[#2d6a4f] dark:text-[#5ecba1] font-medium">{g.spring}</td>
                      <td className="py-2     text-[#2d6a4f] dark:text-[#5ecba1] font-medium">{g.summer}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>


          {/* Pricing panel */}
          <section
            role="tabpanel"
            id="panel-pricing"
            aria-labelledby="tab-pricing"
            hidden={tab !== "pricing"}
          >
            <p className="text-[#5e7a68] dark:text-[#888] text-[12px] mb-4 leading-relaxed">
              Top up your print balance via the{" "}
              <a
                href="https://webapps.lau.edu.lb/ocrs"
                target="_blank"
                rel="noreferrer"
                className="text-[#2d6a4f] dark:text-[#5ecba1] underline underline-offset-2"
              >
                Credit Request Form
              </a>
              . Credits are added to your student fees statement. Unused credits do not
              carry over between semesters.
            </p>


            {/* Per-page rates */}
            <section aria-label="Per-page rates">
              <h3 className="text-[#162a1f] dark:text-white text-[13px] font-bold mb-2">
                Per-page rates
              </h3>
              <dl className="grid grid-cols-2 gap-2 mb-5">
                {PRICING.map((p) => (
                  <div
                    key={p.desc}
                    className="bg-[#f7fbf8] dark:bg-[#2e2e2e] rounded-xl border border-[#cfe2d6] dark:border-[#333] px-4 py-3 flex justify-between items-center"
                  >
                    <dt className="text-[#5e7a68] dark:text-[#888] text-[13px]">{p.desc}</dt>
                    <dd className="text-[#2d6a4f] dark:text-[#5ecba1] font-bold text-[13px]">{p.price}</dd>
                  </div>
                ))}
              </dl>
            </section>


            {/* Credit bundles */}
            <section aria-label="Credit bundles">
              <h3 className="text-[#162a1f] dark:text-white text-[13px] font-bold mb-2">
                Credit bundles
              </h3>
              <dl className="grid grid-cols-3 gap-2">
                {BUNDLES.map((b) => (
                  <div
                    key={b.pages}
                    className="bg-[#f7fbf8] dark:bg-[#2e2e2e] rounded-xl border border-[#cfe2d6] dark:border-[#333] px-4 py-3 text-center"
                  >
                    <dt className="text-[#162a1f] dark:text-white font-bold text-[15px]">
                      {b.pages} pgs
                    </dt>
                    <dd className="text-[#2d6a4f] dark:text-[#5ecba1] text-[13px] font-medium">
                      {b.cost}
                    </dd>
                  </div>
                ))}
              </dl>
            </section>
          </section>
        </section>


        {/* ── Scanning ── */}
        <section
          aria-label="Scanning services"
          className="bg-white dark:bg-[#242424] rounded-2xl border border-[#cfe2d6] dark:border-[#333] p-6 mb-4"
        >
          <h2 className="text-[#162a1f] dark:text-white text-[15px] font-bold mb-2">
            Scanning — free of charge
          </h2>
          <p className="text-[#5e7a68] dark:text-[#888] text-[13px] leading-relaxed">
            Self-service scanners are available at all LAU Libraries at no cost. Scan to USB
            drive or email in multiple file formats. For assistance, contact Library IT
            Helpdesk at{" "}
            <abbr title="Extension">Ext.</abbr> 1645 (Beirut) or{" "}
            <abbr title="Extension">Ext.</abbr> 2948 (Byblos).
          </p>
        </section>


        {/* ── Important notes ── */}
        <aside
          aria-label="Important notes about printing services"
          className="bg-[#2d6a4f] rounded-2xl p-6"
        >
          <h2 className="text-white text-[15px] font-bold mb-3">Important notes</h2>
          <ul className="space-y-2 list-none p-0 m-0">
            {[
              "Online credit requests are automatically added to your student fees statement.",
              "Unused credits are not carried forward between semesters.",
              "Refunds are given only in cases of equipment malfunction.",
              "Report printer issues to IT Helpdesk: Ext. 1645 (Beirut) or Ext. 2948 (Byblos).",
              "The library abides by US Copyright Law Fair Use provisions — excessive reproduction may be refused.",
            ].map((note) => (
              <li key={note} className="flex items-start gap-2.5 text-[13px] text-white/70">
                <span aria-hidden="true" className="w-1.5 h-1.5 rounded-full bg-[#5ecba1] mt-1.5 flex-shrink-0" />
                {note}
              </li>
            ))}
          </ul>
        </aside>


      </div>
    </main>
  );
};


export default PrintingPage;

