import { useState, useMemo } from "react";
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Legend } from "recharts";

const BRAND = {
  purple: "#6B3CE7",
  purpleLight: "#8B66EE",
  purpleDark: "#4A1FB8",
  purpleFaint: "rgba(107,60,231,0.08)",
  purpleBorder: "rgba(107,60,231,0.18)",
  yellow: "#F5A623",
  yellowLight: "#FFEABC",
  bg: "#F5F3EF",
  bgCard: "#FFFFFF",
  bgPanel: "#EDEAE4",
  text: "#1A1A2E",
  textMid: "#555566",
  textLight: "#8E8E9F",
  border: "#E0DDD6",
  borderLight: "#EBE8E2",
  green: "#2EAD6B",
  red: "#E05A3A",
};

const fmt = (v) => {
  if (Math.abs(v) >= 1000000) return `$${(v / 1000000).toFixed(2)}M`;
  if (Math.abs(v) >= 1000) return `$${(v / 1000).toFixed(0)}K`;
  return `$${v.toFixed(0)}`;
};

const fmtAxis = (v) => {
  if (v >= 1000000) return `${(v / 1000000).toFixed(1)}M`;
  if (v >= 1000) return `${(v / 1000).toFixed(0)}K`;
  return `${v}`;
};

function Slider({ label, value, onChange, min, max, step, format, suffix, description }) {
  return (
    <div style={{ marginBottom: 22 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 4 }}>
        <label style={{ fontSize: 13, fontWeight: 600, color: BRAND.text, letterSpacing: "0.01em" }}>{label}</label>
        <span style={{ fontSize: 17, fontWeight: 700, color: BRAND.purple, fontFamily: "'Space Mono', monospace" }}>
          {format ? format(value) : value}{suffix || ""}
        </span>
      </div>
      {description && <div style={{ fontSize: 11, color: BRAND.textLight, marginBottom: 6 }}>{description}</div>}
      <input
        type="range" min={min} max={max} step={step} value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        style={{ width: "100%", accentColor: BRAND.purple, height: 5, cursor: "pointer" }}
      />
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: BRAND.textLight, marginTop: 2 }}>
        <span>{format ? format(min) : min}{suffix || ""}</span>
        <span>{format ? format(max) : max}{suffix || ""}</span>
      </div>
    </div>
  );
}

function MetricCard({ label, value, sub, accent, small }) {
  return (
    <div style={{
      background: BRAND.bgCard,
      border: `1px solid ${BRAND.border}`,
      borderRadius: 14,
      padding: small ? "14px 16px" : "18px 22px",
      flex: 1,
      minWidth: small ? 140 : 160,
      boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
    }}>
      <div style={{ fontSize: 10.5, color: BRAND.textLight, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6, fontWeight: 700 }}>{label}</div>
      <div style={{ fontSize: small ? 20 : 26, fontWeight: 800, color: accent || BRAND.text, fontFamily: "'Space Mono', monospace", lineHeight: 1.1 }}>{value}</div>
      {sub && <div style={{ fontSize: 11, color: BRAND.textLight, marginTop: 5 }}>{sub}</div>}
    </div>
  );
}

function SectionHeader({ title, subtitle, number }) {
  return (
    <div style={{ marginBottom: 18, marginTop: 6 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
        <span style={{ background: BRAND.purple, color: "#fff", fontSize: 11, fontWeight: 800, width: 24, height: 24, borderRadius: 7, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Space Mono', monospace" }}>{number}</span>
        <h2 style={{ fontSize: 16, fontWeight: 800, color: BRAND.text, margin: 0, letterSpacing: "-0.01em" }}>{title}</h2>
      </div>
      {subtitle && <div style={{ fontSize: 12, color: BRAND.textLight, marginLeft: 34 }}>{subtitle}</div>}
    </div>
  );
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: BRAND.bgCard, border: `1px solid ${BRAND.border}`, borderRadius: 10, padding: "10px 14px", boxShadow: "0 8px 24px rgba(0,0,0,0.1)" }}>
      <div style={{ fontSize: 12, fontWeight: 700, color: BRAND.text, marginBottom: 6 }}>Year {label}</div>
      {payload.map((p, i) => (
        <div key={i} style={{ fontSize: 11, color: p.color, fontFamily: "'Space Mono', monospace", marginBottom: 2 }}>
          {p.name}: {fmt(p.value)}
        </div>
      ))}
    </div>
  );
};

export default function DirectedCalculator() {
  const [totalApps, setTotalApps] = useState(50);
  const [vendorCostPerApp, setVendorCostPerApp] = useState(20000);
  const [vendorInflation, setVendorInflation] = useState(10);
  const [platformBuildCost, setPlatformBuildCost] = useState(300000);
  const [costPerNewApp, setCostPerNewApp] = useState(5000);
  const [annualInfraCost, setAnnualInfraCost] = useState(60000);
  const [annualSupportCost, setAnnualSupportCost] = useState(48000);
  const [appsPerQuarter, setAppsPerQuarter] = useState(4);
  const [years, setYears] = useState(5);
  const [activeTab, setActiveTab] = useState("overview");

  const data = useMemo(() => {
    const rows = [];
    let cumulativeVendor = 0;
    let cumulativePlatform = platformBuildCost;
    let appsOnboarded = 0;

    for (let y = 1; y <= years; y++) {
      const vendorCostThisYear = vendorCostPerApp * Math.pow(1 + vendorInflation / 100, y - 1);
      const annualVendorCost = totalApps * vendorCostThisYear;
      cumulativeVendor += annualVendorCost;

      const newAppsThisYear = Math.min(appsPerQuarter * 4, totalApps - appsOnboarded);
      appsOnboarded = Math.min(appsOnboarded + newAppsThisYear, totalApps);

      const onboardingCost = newAppsThisYear > 0 ? newAppsThisYear * costPerNewApp : 0;
      const remainingVendorApps = totalApps - appsOnboarded;
      const remainingVendorCost = remainingVendorApps * vendorCostThisYear;
      const scaleFactor = 1 + (appsOnboarded / totalApps) * 0.4;
      const infraCostThisYear = annualInfraCost * scaleFactor;
      const platformCostThisYear = onboardingCost + infraCostThisYear + annualSupportCost + remainingVendorCost;
      cumulativePlatform += platformCostThisYear;

      const perAppPlatform = appsOnboarded > 0 ? (infraCostThisYear + annualSupportCost) / appsOnboarded : 0;

      rows.push({
        year: y,
        vendorAnnual: Math.round(annualVendorCost),
        platformAnnual: Math.round(platformCostThisYear),
        cumulativeVendor: Math.round(cumulativeVendor),
        cumulativePlatform: Math.round(cumulativePlatform),
        savings: Math.round(cumulativeVendor - cumulativePlatform),
        appsOnboarded,
        perAppVendor: Math.round(vendorCostThisYear),
        perAppPlatform: Math.round(perAppPlatform),
        annualSavings: Math.round(annualVendorCost - platformCostThisYear),
      });
    }
    return rows;
  }, [totalApps, vendorCostPerApp, vendorInflation, platformBuildCost, costPerNewApp, annualInfraCost, annualSupportCost, appsPerQuarter, years]);

  const breakeven = useMemo(() => {
    const idx = data.findIndex(d => d.savings > 0);
    return idx >= 0 ? data[idx].year : null;
  }, [data]);

  const lastYear = data[data.length - 1];
  const totalSavings = lastYear?.savings || 0;
  const roi = platformBuildCost > 0 ? ((totalSavings / platformBuildCost) * 100) : 0;

  const scaleData = useMemo(() => {
    return [1, 5, 10, 25, 50].filter(n => n <= totalApps).map(n => {
      const scaleFactor = 1 + (n / totalApps) * 0.4;
      const infra = annualInfraCost * scaleFactor;
      const perApp = (infra + annualSupportCost) / n;
      return { apps: n, perAppPlatform: Math.round(perApp), perAppVendor: vendorCostPerApp, label: `${n} app${n > 1 ? "s" : ""}` };
    });
  }, [totalApps, annualInfraCost, annualSupportCost, vendorCostPerApp]);

  const tabs = [
    { id: "overview", label: "Annual Comparison" },
    { id: "cumulative", label: "Cumulative Cost" },
    { id: "perapp", label: "Cost Per App" },
  ];

  return (
    <div style={{
      minHeight: "100vh",
      background: BRAND.bg,
      color: BRAND.text,
    }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800;900&family=Space+Mono:wght@400;700&display=swap" rel="stylesheet" />

      <div style={{ background: BRAND.purple, padding: "10px 32px", textAlign: "center" }}>
        <span style={{ fontSize: 12, fontWeight: 700, color: "#fff", letterSpacing: "0.04em" }}>
          ⚡ LIGHTNING VENTURES — Directed Group Platform Investment Model
        </span>
      </div>

      <div style={{ padding: "32px 32px 24px", maxWidth: 1400 }}>
        <h1 style={{ fontSize: 32, fontWeight: 900, margin: "0 0 6px", letterSpacing: "-0.025em", color: BRAND.text, lineHeight: 1.1 }}>
          Platform Investment Calculator
        </h1>
        <p style={{ fontSize: 14, color: BRAND.textMid, margin: 0, maxWidth: 600 }}>
          Model the cost of building a shared app platform vs. continuing with Chinese vendor apps
        </p>
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", maxWidth: 1400 }}>

        <div style={{ width: 350, minWidth: 310, padding: "0 28px 32px", flexShrink: 0 }}>
          <div style={{ background: BRAND.bgCard, borderRadius: 16, border: `1px solid ${BRAND.border}`, padding: "24px 24px 20px", boxShadow: "0 1px 4px rgba(0,0,0,0.04)", marginBottom: 16 }}>
            <SectionHeader number="1" title="Current State" subtitle="What you're paying vendors today" />
            <Slider label="Total Apps" value={totalApps} onChange={setTotalApps} min={1} max={80} step={1} description="~6 brands, ~50 apps across all vendors" />
            <Slider label="Cost Per App / Year" value={vendorCostPerApp} onChange={setVendorCostPerApp} min={10000} max={40000} step={1000} format={fmt} description="Current vendor cost: $15K–$25K USD" />
            <Slider label="Vendor Cost Inflation" value={vendorInflation} onChange={setVendorInflation} min={0} max={25} step={1} suffix="% / yr" description="Costs already rising every few months" />
          </div>

          <div style={{ background: BRAND.bgCard, borderRadius: 16, border: `1px solid ${BRAND.border}`, padding: "24px 24px 20px", boxShadow: "0 1px 4px rgba(0,0,0,0.04)", marginBottom: 16 }}>
            <SectionHeader number="2" title="New Platform" subtitle="Shared multi-tenant architecture" />
            <Slider label="Platform Build Cost" value={platformBuildCost} onChange={setPlatformBuildCost} min={50000} max={800000} step={10000} format={fmt} description="One-off capex: architecture, backend, templates" />
            <Slider label="Cost Per New App" value={costPerNewApp} onChange={setCostPerNewApp} min={1000} max={20000} step={500} format={fmt} description="Incremental cost to onboard each new brand app" />
            <Slider label="Annual Infrastructure" value={annualInfraCost} onChange={setAnnualInfraCost} min={10000} max={200000} step={5000} format={fmt} description="Hosting, load balancing, Firebase, CI/CD" />
            <Slider label="Annual Support / Partner" value={annualSupportCost} onChange={setAnnualSupportCost} min={0} max={150000} step={5000} format={fmt} description="Lightning managed services retainer" />
          </div>

          <div style={{ background: BRAND.bgCard, borderRadius: 16, border: `1px solid ${BRAND.border}`, padding: "24px 24px 20px", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
            <SectionHeader number="3" title="Rollout" subtitle="Migration pace and timeline" />
            <Slider label="Apps Onboarded / Quarter" value={appsPerQuarter} onChange={setAppsPerQuarter} min={1} max={15} step={1} description="Start with 1 brand, scale from there" />
            <Slider label="Projection Period" value={years} onChange={setYears} min={3} max={10} step={1} suffix=" years" />
          </div>
        </div>

        <div style={{ flex: 1, minWidth: 420, padding: "0 32px 32px 16px" }}>

          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 24 }}>
            <MetricCard label="Breakeven" value={breakeven ? `Year ${breakeven}` : "N/A"} sub={breakeven ? "Investment pays for itself" : "Adjust inputs"} accent={BRAND.purple} />
            <MetricCard label={`${years}-Year Savings`} value={totalSavings > 0 ? fmt(totalSavings) : `-${fmt(Math.abs(totalSavings))}`} sub="Cumulative vs vendor model" accent={totalSavings > 0 ? BRAND.green : BRAND.red} />
            <MetricCard label="ROI on Build" value={`${roi > 0 ? "+" : ""}${roi.toFixed(0)}%`} sub={`On ${fmt(platformBuildCost)} investment`} accent={roi > 0 ? BRAND.green : BRAND.red} />
            <MetricCard label="Current Annual Spend" value={fmt(totalApps * vendorCostPerApp)} sub={`${totalApps} apps × ${fmt(vendorCostPerApp)}`} accent={BRAND.yellow} />
          </div>

          <div style={{ display: "flex", gap: 4, marginBottom: 18 }}>
            {tabs.map(t => (
              <button key={t.id} onClick={() => setActiveTab(t.id)} style={{
                padding: "9px 20px", borderRadius: 10, border: "1.5px solid",
                borderColor: activeTab === t.id ? BRAND.purple : BRAND.border,
                background: activeTab === t.id ? BRAND.purpleFaint : BRAND.bgCard,
                color: activeTab === t.id ? BRAND.purple : BRAND.textLight,
                fontSize: 12, fontWeight: 700, cursor: "pointer", letterSpacing: "0.01em", transition: "all 0.2s ease",
              }}>{t.label}</button>
            ))}
          </div>

          {activeTab === "overview" && (
            <div style={{ background: BRAND.bgCard, borderRadius: 16, border: `1px solid ${BRAND.border}`, padding: "22px 18px 14px", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
              <div style={{ fontSize: 15, fontWeight: 800, color: BRAND.text, marginBottom: 2, paddingLeft: 8 }}>Annual Cost Comparison</div>
              <div style={{ fontSize: 11, color: BRAND.textLight, marginBottom: 18, paddingLeft: 8 }}>Vendor model vs new platform — year by year</div>
              <ResponsiveContainer width="100%" height={320}>
                <BarChart data={data} barGap={4}>
                  <CartesianGrid strokeDasharray="3 3" stroke={BRAND.borderLight} vertical={false} />
                  <XAxis dataKey="year" tick={{ fill: BRAND.textLight, fontSize: 11, fontFamily: "'Space Mono', monospace" }} tickFormatter={(v) => `Y${v}`} axisLine={{ stroke: BRAND.border }} />
                  <YAxis tick={{ fill: BRAND.textLight, fontSize: 10, fontFamily: "'Space Mono', monospace" }} tickFormatter={fmtAxis} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ fontSize: 11, paddingTop: 8 }} />
                  <Bar dataKey="vendorAnnual" name="Vendor Model" fill={BRAND.yellow} radius={[5, 5, 0, 0]} />
                  <Bar dataKey="platformAnnual" name="New Platform" fill={BRAND.purple} radius={[5, 5, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {activeTab === "cumulative" && (
            <div style={{ background: BRAND.bgCard, borderRadius: 16, border: `1px solid ${BRAND.border}`, padding: "22px 18px 14px", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
              <div style={{ fontSize: 15, fontWeight: 800, color: BRAND.text, marginBottom: 2, paddingLeft: 8 }}>Cumulative Total Cost</div>
              <div style={{ fontSize: 11, color: BRAND.textLight, marginBottom: 18, paddingLeft: 8 }}>The crossover point — when the platform starts saving money</div>
              <ResponsiveContainer width="100%" height={320}>
                <AreaChart data={data}>
                  <defs>
                    <linearGradient id="vendorGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={BRAND.yellow} stopOpacity={0.25} />
                      <stop offset="100%" stopColor={BRAND.yellow} stopOpacity={0.02} />
                    </linearGradient>
                    <linearGradient id="platformGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={BRAND.purple} stopOpacity={0.2} />
                      <stop offset="100%" stopColor={BRAND.purple} stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke={BRAND.borderLight} vertical={false} />
                  <XAxis dataKey="year" tick={{ fill: BRAND.textLight, fontSize: 11, fontFamily: "'Space Mono', monospace" }} tickFormatter={(v) => `Y${v}`} axisLine={{ stroke: BRAND.border }} />
                  <YAxis tick={{ fill: BRAND.textLight, fontSize: 10, fontFamily: "'Space Mono', monospace" }} tickFormatter={fmtAxis} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ fontSize: 11, paddingTop: 8 }} />
                  <Area type="monotone" dataKey="cumulativeVendor" name="Vendor (Cumulative)" stroke={BRAND.yellow} strokeWidth={2.5} fill="url(#vendorGrad)" />
                  <Area type="monotone" dataKey="cumulativePlatform" name="Platform (Cumulative)" stroke={BRAND.purple} strokeWidth={2.5} fill="url(#platformGrad)" />
                  {breakeven && <ReferenceLine x={breakeven} stroke={BRAND.green} strokeDasharray="6 4" strokeWidth={1.5} label={{ value: "BREAKEVEN", fill: BRAND.green, fontSize: 10, fontWeight: 700, position: "top", fontFamily: "'Space Mono', monospace" }} />}
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}

          {activeTab === "perapp" && (
            <div style={{ background: BRAND.bgCard, borderRadius: 16, border: `1px solid ${BRAND.border}`, padding: "22px 18px 14px", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
              <div style={{ fontSize: 15, fontWeight: 800, color: BRAND.text, marginBottom: 2, paddingLeft: 8 }}>Cost Per App at Scale</div>
              <div style={{ fontSize: 11, color: BRAND.textLight, marginBottom: 18, paddingLeft: 8 }}>How per-app cost drops as more apps join the shared platform</div>
              <ResponsiveContainer width="100%" height={320}>
                <BarChart data={scaleData} barGap={6}>
                  <CartesianGrid strokeDasharray="3 3" stroke={BRAND.borderLight} vertical={false} />
                  <XAxis dataKey="label" tick={{ fill: BRAND.textLight, fontSize: 11, fontFamily: "'Space Mono', monospace" }} axisLine={{ stroke: BRAND.border }} />
                  <YAxis tick={{ fill: BRAND.textLight, fontSize: 10, fontFamily: "'Space Mono', monospace" }} tickFormatter={fmtAxis} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ fontSize: 11, paddingTop: 8 }} />
                  <Bar dataKey="perAppVendor" name="Vendor Per App" fill={BRAND.yellow} radius={[5, 5, 0, 0]} />
                  <Bar dataKey="perAppPlatform" name="Platform Per App" fill={BRAND.purple} radius={[5, 5, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          <div style={{ marginTop: 24, background: BRAND.bgCard, borderRadius: 16, border: `1px solid ${BRAND.border}`, overflow: "hidden", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
            <div style={{ padding: "18px 22px 12px" }}>
              <div style={{ fontSize: 15, fontWeight: 800, color: BRAND.text }}>Year-by-Year Breakdown</div>
              <div style={{ fontSize: 11, color: BRAND.textLight, marginTop: 2 }}>Detailed projections across all metrics</div>
            </div>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: "'Space Mono', monospace", fontSize: 11 }}>
                <thead>
                  <tr style={{ borderTop: `1px solid ${BRAND.border}` }}>
                    {["Year", "Apps Live", "Vendor Cost", "Platform Cost", "Annual Saving", "Cumulative"].map((h, i) => (
                      <th key={i} style={{ padding: "11px 16px", textAlign: i === 0 ? "center" : "right", color: BRAND.textLight, fontWeight: 700, fontSize: 10, textTransform: "uppercase", letterSpacing: "0.06em", borderBottom: `1px solid ${BRAND.border}`, background: BRAND.bg }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {data.map((d, i) => (
                    <tr key={i} style={{ borderBottom: `1px solid ${BRAND.borderLight}` }}>
                      <td style={{ padding: "11px 16px", textAlign: "center", color: BRAND.purple, fontWeight: 700 }}>Y{d.year}</td>
                      <td style={{ padding: "11px 16px", textAlign: "right", color: BRAND.text }}>{d.appsOnboarded}/{totalApps}</td>
                      <td style={{ padding: "11px 16px", textAlign: "right", color: BRAND.yellow, fontWeight: 600 }}>{fmt(d.vendorAnnual)}</td>
                      <td style={{ padding: "11px 16px", textAlign: "right", color: BRAND.purple, fontWeight: 600 }}>{fmt(d.platformAnnual)}</td>
                      <td style={{ padding: "11px 16px", textAlign: "right", color: d.annualSavings > 0 ? BRAND.green : BRAND.red, fontWeight: 700 }}>
                        {d.annualSavings > 0 ? "+" : ""}{fmt(d.annualSavings)}
                      </td>
                      <td style={{ padding: "11px 16px", textAlign: "right", color: d.savings > 0 ? BRAND.green : BRAND.red, fontWeight: 700 }}>
                        {d.savings > 0 ? "+" : ""}{fmt(d.savings)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div style={{ marginTop: 24, display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 32 }}>
            {[
              { icon: "⚡", title: "Full Control", desc: "Own the software layer, decouple from Chinese vendor backends" },
              { icon: "🚀", title: "Velocity", desc: "Template new brand apps in days, not months" },
              { icon: "🧩", title: "Modular", desc: "Plug-and-play features, no vendor lock-in to any partner" },
              { icon: "📈", title: "Future-Proof", desc: "Modern stack, AI tooling, CI/CD — costs go down over time" },
            ].map((b, i) => (
              <div key={i} style={{
                flex: "1 1 200px", background: BRAND.bgCard,
                border: `1px solid ${BRAND.border}`, borderRadius: 14, padding: "18px 20px",
                boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
              }}>
                <div style={{ fontSize: 22, marginBottom: 8 }}>{b.icon}</div>
                <div style={{ fontSize: 13, fontWeight: 800, color: BRAND.text, marginBottom: 4 }}>{b.title}</div>
                <div style={{ fontSize: 11, color: BRAND.textMid, lineHeight: 1.55 }}>{b.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
