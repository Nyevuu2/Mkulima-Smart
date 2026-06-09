import { useState, useEffect, useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { AlertTriangle, Wallet, TrendingUp, BarChart2, ArrowUp, ArrowDown, Tag } from "lucide-react";
import { Card, T } from "../App";

// ─── PRICE DATA
const timeline = [
  { month: "Oct", maize: 3200, greengrams: 8800,  isForecast: false },
  { month: "Nov", maize: 3450, greengrams: 9100,  isForecast: false },
  { month: "Dec", maize: 3100, greengrams: 9400,  isForecast: false },
  { month: "Jan", maize: 2900, greengrams: 9000,  isForecast: false },
  { month: "Feb", maize: 3300, greengrams: 8700,  isForecast: false },
  { month: "Mar", maize: 3600, greengrams: 9200,  isForecast: false },
  { month: "Apr", maize: 3750, greengrams: 9600,  isForecast: false },
  { month: "May", maize: 3900, greengrams: 10100, isForecast: false },
  { month: "Jun", maize: 4100, greengrams: 10500, isForecast: true  },
  { month: "Jul", maize: 4250, greengrams: 10800, isForecast: true  },
  { month: "Aug", maize: 4400, greengrams: 11100, isForecast: true  },
];

// Current = last non-forecast entry; next = first forecast entry
const currentEntry  = [...timeline].reverse().find(t => !t.isForecast);
const nextEntry     = timeline.find(t => t.isForecast);

const priceInfo = {
  maize: {
    current:    currentEntry?.maize  ?? 3900,
    next:       nextEntry?.maize     ?? 4100,
    nextMonth:  nextEntry?.month     ?? "Jun",
    action:     "DELAY",
    actionIcon: "⏳",
    confidence: 82,
  },
  greengrams: {
    current:    currentEntry?.greengrams  ?? 10100,
    next:       nextEntry?.greengrams     ?? 10500,
    nextMonth:  nextEntry?.month          ?? "Jun",
    action:     "SELL",
    actionIcon: "💰",
    confidence: 76,
  },
};

// Use literal strings here — T is an imported const and cannot be referenced
// at module evaluation time (temporal dead zone).
const actionColors = {
  SELL:  "#2d7a3a", // T.accent — dark field green
  DELAY: "#1d6fa4", // T.blue
  STORE: "#c07a00", // T.amber — deep amber readable on light bg
};

// Weather data (static until WeatherAdvisory backend is wired to expose an endpoint)
const weatherForecast = [
  { day: "Mon", rain: 12, temp: 28 },
  { day: "Tue", rain: 0,  temp: 30 },
  { day: "Wed", rain: 35, temp: 26 },
  { day: "Thu", rain: 40, temp: 25 },
  { day: "Fri", rain: 8,  temp: 27 },
  { day: "Sat", rain: 0,  temp: 31 },
  { day: "Sun", rain: 5,  temp: 29 },
];

const weatherAdvisories = [
  { icon: "🌧️", title: "Heavy Rain Wed–Thu",   body: "Avoid pesticide/fertilizer application. Ensure drainage to prevent waterlogging.", color: "#1d6fa4" },
  { icon: "🌡️", title: "Heat Stress Saturday", body: "Temps reaching 31°C. Maintain soil moisture for green grams in pod-filling.", color: "#c07a00" },
  { icon: "🌱", title: "Planting Window Open",  body: "Good conditions from Thursday. Suitable for maize and green gram germination.", color: "#2d7a3a" },
];

// ─── LOCAL STAT CARD ──────────────────────────────────────────────────────────
// Uses App.jsx shared Card but adds the trend arrow on top
function DashStatCard({ title, value, sub, icon: Icon, trend, color = T.accent, bg }) {
  const isDark = bg === T.surfaceGreen;
  const textMain = isDark ? "#fff" : "#0d0c0c";
  const textSub  = isDark ? "rgba(255,255,255,0.6)" : T.textDim;
  const trendCol = isDark ? "rgba(255,255,255,0.8)" : (trend >= 0 ? T.accent : T.amber);
  return (
    <div style={{
      background: bg || T.surface,
      border: bg ? "none" : `1px solid ${T.border}`,
      borderRadius: "16px",
      padding: "18px 20px",
      position: "relative",
      overflow: "hidden",
    }}>
      {/* subtle glow corner */}
      <div style={{
        position: "absolute", top: 0, right: 0, width: 70, height: 70,
        background: isDark
          ? "radial-gradient(circle at top right, rgba(255,255,255,0.1), transparent 70%)"
          : `radial-gradient(circle at top right, ${color}18, transparent 70%)`,
        pointerEvents: "none",
      }} />
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
        <span style={{ fontSize: 11, color: isDark ? "rgba(255,255,255,0.65)" : T.textDim, fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase" }}>
          {title}
        </span>
        <div style={{ background: isDark ? "rgba(255,255,255,0.15)" : `${color}18`, borderRadius: 8, padding: 7 }}>
          <Icon size={15} color={isDark ? "#fff" : color} />
        </div>
      </div>
      <div style={{ fontSize: 24, fontWeight: 800, color: textMain, letterSpacing: "-0.02em", marginBottom: 2 }}>
        {value}
      </div>
      {sub && <div style={{ fontSize: 11, color: textSub, marginBottom: 4 }}>{sub}</div>}
      {trend !== undefined && (
        <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 4 }}>
          {trend >= 0
            ? <ArrowUp   size={11} color={isDark ? "#fff" : T.accent} />
            : <ArrowDown size={11} color={isDark ? "#fff" : T.amber}  />}
          <span style={{ fontSize: 11, color: trendCol, fontWeight: 600 }}>
            {Math.abs(trend)}% vs last month
          </span>
        </div>
      )}
    </div>
  );
}

// ─── PRICE CARD ───────────────────────────────────────────────────────────────
function PriceCard({ cropKey }) {
  const info   = priceInfo[cropKey];
  const color  = actionColors[info.action];
  const label  = cropKey === "maize" ? "Maize" : "Green Grams";
  const pct    = (((info.next - info.current) / info.current) * 100).toFixed(1);
  const rising = info.next >= info.current;

  return (
    <Card style={{ padding: 20, border: `1px solid ${color}30` }}>
      {/* Header row */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
        <div>
          <div style={{ fontSize: 10, color: T.textDim, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 5 }}>
            {label} · Price Forecast
          </div>
          <div style={{ fontSize: 28, fontWeight: 800, color: "#161616", letterSpacing: "-0.02em", lineHeight: 1 }}>
            KSh {info.current.toLocaleString()}
          </div>
          <div style={{ fontSize: 11, color: T.textDim, marginTop: 3 }}>per 90kg bag · current</div>
        </div>
        {/* next month pill */}
        <div style={{
          background: T.surfaceAlt,
          border: `1px solid ${color}40`,
          borderRadius: 10,
          padding: "10px 14px",
          textAlign: "center",
          minWidth: 80,
        }}>
          <div style={{ fontSize: 10, color: T.textDim, marginBottom: 4 }}>{info.nextMonth} forecast</div>
          <div style={{ fontSize: 16, fontWeight: 800, color: "#058059" }}>{info.next.toLocaleString()}</div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 3, marginTop: 3 }}>
            {rising
              ? <ArrowUp   size={10} color={T.accent} />
              : <ArrowDown size={10} color={T.amber}  />}
            <span style={{ fontSize: 10, color: rising ? T.accent : T.amber, fontWeight: 700 }}>
              {rising ? "+" : ""}{pct}%
            </span>
          </div>
        </div>
      </div>

      {/* Recommendation badge */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        background: T.surfaceAlt, borderRadius: 9, padding: "9px 14px",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
          <span style={{ fontSize: 16 }}>{info.actionIcon}</span>
          <span style={{ fontSize: 13, fontWeight: 800, color }}>{info.action}</span>
        </div>
        <span style={{ fontSize: 11, color: T.textDim }}>{info.confidence}% confidence</span>
      </div>
    </Card>
  );
}

// ─── DASHBOARD ────────────────────────────────────────────────────────────────
export default function Dashboard({ county = "Machakos", crop = "Maize", cropView: cropViewProp = "Maize", language = "English", userContext = {} }) {

  // ── 1. Read real expense data from localStorage (same keys as Expenses.jsx) ──
  const [expenses, setExpenses]     = useState([]);
  const [sales, setSales]           = useState([]);
  const [activeSeason, setActiveSeason] = useState("Long Rains 2026");
  const [seasonCalcs, setSeasonCalcs] = useState({});

  useEffect(() => {
    const rawExpenses  = localStorage.getItem("mkulima_expenses");
    const rawSales     = localStorage.getItem("mkulima_sales");
    const rawSeason    = localStorage.getItem("mkulima_active_season");
    const rawCalcs     = localStorage.getItem("mkulima_season_calcs");

    if (rawExpenses)  setExpenses(JSON.parse(rawExpenses));
    if (rawSales)     setSales(JSON.parse(rawSales));
    if (rawSeason)    setActiveSeason(rawSeason);
    if (rawCalcs)     setSeasonCalcs(JSON.parse(rawCalcs));
  }, []);

  // ── 2. Compute metrics exactly like Expenses.jsx does ──────────────────────
  const filteredExpenses = useMemo(() =>
    expenses.filter(e => e.season === activeSeason),
  [expenses, activeSeason]);

  const filteredSales = useMemo(() =>
    sales.filter(s => s.season === activeSeason),
  [sales, activeSeason]);

  const totalExpenses    = useMemo(() => filteredExpenses.reduce((s, e) => s + Number(e.amount), 0), [filteredExpenses]);
  const totalRevenueSold = useMemo(() => filteredSales.reduce((s, sl) => s + sl.bags * sl.pricePerBag, 0), [filteredSales]);
  const calcBags         = seasonCalcs[activeSeason]?.bags || 0;
  const sellingPrice     = seasonCalcs[activeSeason]?.price || (crop === "Maize" ? 3900 : 10100);
  const projectedRevenue = calcBags * sellingPrice;
  const projectedProfit  = projectedRevenue - totalExpenses;
  const breakEvenPrice   = totalExpenses > 0 && calcBags > 0 ? Math.ceil(totalExpenses / calcBags) : 0;

  const hasExpenses = totalExpenses > 0;

  // Category breakdown for bar chart
  const categoryTotals = useMemo(() => {
    const map = {};
    filteredExpenses.forEach(e => {
      map[e.category] = (map[e.category] || 0) + Number(e.amount);
    });
    return Object.entries(map).map(([name, v]) => ({ name, v }));
  }, [filteredExpenses]);

  // ── 3. Greeting ─────────────────────────────────────────────────────────────
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const farmerName = userContext?.firstName || "Farmer";

  // ── 4. Crop view comes from App header selector ─────────────────────────────
  // "Maize" | "Green Grams" | "Both"
  const cropView = cropViewProp === "Both" ? "both"
    : cropViewProp === "Green Grams" ? "greengrams"
    : "maize";

  const fmt = (n) => `KSh ${Number(n).toLocaleString()}`;

  // ── 5. Computed trend % for stat cards (simple: projected vs expense ratio) ─
  const revenueTrend  = totalExpenses > 0 ? +((projectedRevenue / totalExpenses - 1) * 100).toFixed(1) : null;
  const marginTrend   = projectedProfit > 0 && projectedRevenue > 0 ? +((projectedProfit / projectedRevenue * 100).toFixed(1)) : null;

  // ─────────────────────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────────────────────
  return (
    <div style={{
      padding: "20px 16px",
      display: "flex",
      flexDirection: "column",
      gap: 18,
      background: T.bg,
      color: T.text,
      fontFamily: "system-ui, -apple-system, sans-serif",
      minHeight: "100%",
    }}>

      {/* ── GREETING HEADER ── */}
      <div style={{
        background: "linear-gradient(135deg, #2d7a3a 0%, #d4edda 100%)",
        border: `1px solid ${T.accent}40`,
        borderRadius: 16,
        padding: "20px 22px",
      }}>
        <div style={{ fontSize: 22, fontWeight: 900, color: "#ffffff", letterSpacing: "-0.02em" }}>
          {greeting}, {farmerName}
        </div>
        <div style={{ fontSize: 13, color: "rgba(255,255,255,0.8)", marginTop: 4 }}>
          {county} County · {activeSeason}
        </div>
      </div>

      {/* ── ALERT BANNER ── */}
      <div style={{
        background: "#f2dac1",
        border: `1px solid ${T.amber}50`,
        borderRadius: 10,
        padding: "10px 16px",
        display: "flex",
        alignItems: "center",
        gap: 10,
      }}>
        <AlertTriangle size={14} color={T.amber} />
        <span style={{ color: "#ed5108", fontSize: 14 }}>
          Heavy rainfall forecast Wed–Thu in {county}. Avoid pesticide application.{" "}
          {cropView !== "greengrams" && <span>Maize prices projected <strong>+{(((priceInfo.maize.next - priceInfo.maize.current) / priceInfo.maize.current) * 100).toFixed(1)}%</strong> next month. </span>}
          {cropView !== "maize" && <span>Green Grams prices projected <strong>+{(((priceInfo.greengrams.next - priceInfo.greengrams.current) / priceInfo.greengrams.current) * 100).toFixed(1)}%</strong> next month.</span>}
        </span>
      </div>

      {/* ── STAT CARDS (from real expense data) ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 12 }}>
        {/* Total Expenses — amber tint, money going out */}
        <DashStatCard
          title="Total Expenses"
          value={hasExpenses ? fmt(totalExpenses) : "—"}
          sub={hasExpenses ? activeSeason : "No expenses logged yet"}
          icon={Wallet}
          color={T.amber}
          bg={T.surfaceAmber}
        />
        {/* Projected Revenue — green, incoming money */}
        <DashStatCard
          title="Projected Revenue"
          value={calcBags > 0 ? fmt(projectedRevenue) : "—"}
          sub={calcBags > 0 ? `${calcBags} bags × ${fmt(sellingPrice)}` : "Set bags in Expenses"}
          icon={TrendingUp}
          trend={revenueTrend}
          color={T.accent}
          bg={T.surfaceGreenLight}
        />
        {/* Projected Profit — dark green (farmer's best outcome) */}
        <DashStatCard
          title="Projected Profit"
          value={calcBags > 0 && hasExpenses ? fmt(projectedProfit) : "—"}
          sub={marginTrend !== null ? `${marginTrend}% margin` : "Log expenses to calculate"}
          icon={TrendingUp}
          trend={marginTrend}
          color={T.accent}
          bg={projectedProfit >= 0 && hasExpenses ? T.surfaceGreen : undefined}
        />
        {/* Break-Even — white, neutral analytical tool */}
        <DashStatCard
          title="Break-Even"
          value={breakEvenPrice > 0 ? `${fmt(breakEvenPrice)}/bag` : "—"}
          sub={breakEvenPrice > 0 ? "Minimum selling price" : "Set yield in Expenses"}
          icon={BarChart2}
          color={T.blue}
        />
      </div>

      {/* ── PRICE FORECAST CARDS ── */}
      {cropView === "both" ? (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          <PriceCard cropKey="maize"      />
          <PriceCard cropKey="greengrams" />
        </div>
      ) : (
        <PriceCard cropKey={cropView} />
      )}

      {/* ── WEATHER + EXPENSE BREAKDOWN ── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>

        {/* Weather Advisory — dark green bg: nature, outdoors, the farmer's world */}
        <div style={{
          background: T.surfaceGreen,
          border: "none",
          borderRadius: 16,
          padding: 20,
          overflow: "hidden",
        }}>
          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 13, fontWeight: 800, color: "#ffffff" }}>Weather Advisory</div>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.6)" }}>{county} · 7-day rainfall (mm)</div>
          </div>

          {/* Rainfall bar chart */}
          <ResponsiveContainer width="100%" height={120}>
            <BarChart data={weatherForecast} barSize={18}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
              <XAxis dataKey="day" tick={{ fill: "rgba(255,255,255,0.6)", fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "rgba(255,255,255,0.6)", fontSize: 10 }} axisLine={false} tickLine={false} unit="mm" width={30} />
              <Tooltip
                contentStyle={{ background: "#1e5c2a", border: "1px solid rgba(255,255,255,0.2)", borderRadius: 8, color: "#fff", fontSize: 11 }}
                formatter={(v, _, { payload }) => [`${v} mm · ${payload.temp}°C`, "Rain"]}
              />
              <Bar dataKey="rain" fill="rgba(255,255,255,0.6)" radius={[4, 4, 0, 0]} name="Rain (mm)" />
            </BarChart>
          </ResponsiveContainer>

          <div style={{ display: "flex", flexDirection: "column", gap: 7, marginTop: 12 }}>
            {weatherAdvisories.map(a => (
              <div key={a.title} style={{
                display: "flex", gap: 9, padding: "9px 11px",
                background: "rgba(255,255,255,0.1)",
                borderRadius: 9,
                border: "1px solid rgba(255,255,255,0.12)",
              }}>
                <span style={{ fontSize: 14, flexShrink: 0, marginTop: 1 }}>{a.icon}</span>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: "#ffffff", marginBottom: 2 }}>{a.title}</div>
                  <div style={{ fontSize: 11, color: "rgba(255,255,255,0.65)", lineHeight: 1.5 }}>{a.body}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Expense Breakdown — white, analytical/neutral */}
        <Card style={{ padding: 20 }}>
          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 13, fontWeight: 800, color: T.textBright }}>Expense Breakdown</div>
            <div style={{ fontSize: 11, color: T.textDim }}>
              {hasExpenses ? `By category · ${activeSeason}` : "No expenses logged yet — go to Costs to add"}
            </div>
          </div>

          {categoryTotals.length > 0 ? (
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={categoryTotals} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke={T.border} horizontal={false} />
                <XAxis type="number"   tick={{ fill: T.textDim, fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="name" tick={{ fill: T.textDim, fontSize: 10 }} axisLine={false} tickLine={false} width={70} />
                <Tooltip
                  contentStyle={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 8, color: T.text, fontSize: 11 }}
                  formatter={(v) => [`KSh ${Number(v).toLocaleString()}`, "Amount"]}
                />
                <Bar dataKey="v" fill={T.accent} radius={[0, 4, 4, 0]} name="KSh" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div style={{
              height: 160, display: "flex", alignItems: "center", justifyContent: "center",
              border: `1px dashed ${T.border}`, borderRadius: 10,
              color: T.textDim, fontSize: 13, textAlign: "center", lineHeight: 1.7,
            }}>
              No expense data yet.<br />
              <span style={{ color: T.accent, fontWeight: 600 }}>Head to Costs to start logging.</span>
            </div>
          )}

          {hasExpenses && (
            <div style={{
              marginTop: 14, paddingTop: 12,
              borderTop: `1px solid ${T.border}`,
              display: "flex", justifyContent: "space-between", alignItems: "center",
            }}>
              <span style={{ fontSize: 12, color: T.textDim }}>Season total</span>
              <span style={{ fontSize: 18, fontWeight: 800, color: T.amber }}>{fmt(totalExpenses)}</span>
            </div>
          )}
        </Card>
      </div>

    </div>
  );
}