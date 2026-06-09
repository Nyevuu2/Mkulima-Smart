import React, { useState } from "react";
import { Sparkles, RefreshCw, ShieldAlert, TrendingUp, TrendingDown, Minus, Leaf, Package } from "lucide-react";
import { T } from "../App";

// ============================================================================
// TRANSLATIONS
// ============================================================================
const L10N = {
  en: {
    title: "Market Price Intelligence",
    county: "County",
    live: "Updated today",
    refresh: "Refresh",
    directive: "What should I do?",
    holdDirective: "HOLD & STORE",
    sellDirective: "SELL NOW",
    holdReason: "Prices are still rising. Patience pays.",
    sellReason: "Prices near peak. Good time to sell.",
    variance: "potential gain per bag",
    currentVsPeak: "Current → Peak Price",
    perBag: "per 90 kg bag",
    projectedProfit: "Your Projected Gain",
    ifYouHold: "if you store",
    bagsLabel: "bags",
    maizeLabel: "Maize",
    greenGramsLabel: "Green Grams",
    bothLabel: "Both Crops",
    chartTitle: "Price History & Forecast",
    today: "TODAY",
    actual: "Actual",
    forecast: "Forecast",
    hoverPrompt: "Tap any point on the chart",
    footnote: "Dashed line = AI forecast from July onwards",
    advisoryTitle: "Farmer's Advisory",
    maizeStrategy: "🌽  Maize",
    greenGramsStrategy: "🫘  Green Grams",
    maizeDesc: "Prices are gaining momentum over the next 6–8 weeks. Holding stock is recommended to maximise value before the August peak.",
    greenGramsDesc: "Peak valuation is anticipated in July. Prepare your storage facilities now to capture that premium window — don't wait.",
    bothAdvice: "Both crops are trending upward. Green grams peak first (July) — sell those early, then hold your maize until August for the surge.",
    maizeAdvice: "Maize is on a confirmed upward trend. Current KSh {current}/bag is forecast to reach KSh {peak}/bag by August. Storing now is the smart move.",
    greenGramsAdvice: "Green grams are very close to their seasonal peak in July. At KSh {current}/bag now, you could earn KSh {peak}/bag — act before mid-season.",
    peakMonth: "Peak expected",
    currentMonth: "June 2026",
  },
  sw: {
    title: "Akili za Bei za Soko",
    county: "Kaunti",
    live: "Imesasishwa leo",
    refresh: "Huisha",
    directive: "Nifanye nini?",
    holdDirective: "WEKA GHALANI",
    sellDirective: "UZA SASA",
    holdReason: "Bei bado zinapanda. Subiri upate zaidi.",
    sellReason: "Bei karibu na kilele. Wakati mzuri wa kuuza.",
    variance: "faida inayowezekana kwa gunia",
    currentVsPeak: "Bei ya Sasa → Lengo la Juu",
    perBag: "kwa gunia la kilo 90",
    projectedProfit: "Faida Yako Inayotarajiwa",
    ifYouHold: "ukihifadhi magunia",
    bagsLabel: "magunia",
    maizeLabel: "Mahindi",
    greenGramsLabel: "Ndengu",
    bothLabel: "Mazao Yote",
    chartTitle: "Historia ya Bei na Utabiri",
    today: "LEO",
    actual: "Halisi",
    forecast: "Utabiri",
    hoverPrompt: "Gusa alama yoyote kwenye chati",
    footnote: "Mstari wa vitone = utabiri wa AI kuanzia Julai",
    advisoryTitle: "Ushauri wa Mkulima",
    maizeStrategy: "🌽  Mahindi",
    greenGramsStrategy: "🫘  Ndengu",
    maizeDesc: "Bei zinatarajiwa kuongezeka katika wiki 6–8 zijazo. Inashauriwa kuhifadhi mazao ili kupata faida kubwa kabla ya kilele cha Agosti.",
    greenGramsDesc: "Bei ya juu zaidi inatarajiwa Julai. Tayarisha maghala yako sasa ili kuwahi dirisha hilo la bei nzuri — usisubiri.",
    bothAdvice: "Mazao yote mawili yanapanda. Ndengu zitafika kilele kwanza (Julai) — uza hizo mapema, kisha shikilia Mahindi hadi Agosti.",
    maizeAdvice: "Mahindi yanaonyesha mwenendo wa kupanda. KSh {current}/gunia sasa inatarajiwa kufikia KSh {peak}/gunia ifikapo Agosti. Kuhifadhi sasa ni hatua nzuri.",
    greenGramsAdvice: "Ndengu ziko karibu sana na kilele cha msimu Julai. KSh {current}/gunia sasa, unaweza kupata KSh {peak}/gunia — chukua hatua kabla ya katikati ya msimu.",
    peakMonth: "Kilele kinatarajiwa",
    currentMonth: "Juni 2026",
  },
};

// ============================================================================
// STATIC FALLBACK DATA — used when the ML API is offline
// Jun 2026 is the baseline "today". Update the isToday flag if needed.
// ============================================================================
const FALLBACK_TIMELINE = [
  { month: "Oct", maize: 3200, greengrams: 8800,  isForecast: false, isToday: false },
  { month: "Nov", maize: 3450, greengrams: 9100,  isForecast: false, isToday: false },
  { month: "Dec", maize: 3100, greengrams: 9400,  isForecast: false, isToday: false },
  { month: "Jan", maize: 2900, greengrams: 9000,  isForecast: false, isToday: false },
  { month: "Feb", maize: 3300, greengrams: 8700,  isForecast: false, isToday: false },
  { month: "Mar", maize: 3600, greengrams: 9200,  isForecast: false, isToday: false },
  { month: "Apr", maize: 3750, greengrams: 9600,  isForecast: false, isToday: false },
  { month: "May", maize: 3900, greengrams: 10100, isForecast: false, isToday: false },
  { month: "Jun", maize: 4100, greengrams: 10500, isForecast: false, isToday: true  },
  { month: "Jul", maize: 4250, greengrams: 11200, isForecast: true,  isToday: false },
  { month: "Aug", maize: 4400, greengrams: 11100, isForecast: true,  isToday: false },
];

/**
 * Merge API response into a normalised timeline array.
 * The API returns 6 actual + 3 forecast points plus today_month.
 * We annotate each point with isForecast / isToday from the f flag and
 * today_month string, then fall back to FALLBACK_TIMELINE when no live data.
 */
function buildTimeline(intelligenceData) {
  if (!intelligenceData?.history_and_forecast?.length) return FALLBACK_TIMELINE;

  const todayMonth = intelligenceData.today_month || "";
  return intelligenceData.history_and_forecast.map(pt => ({
    month:       pt.month,
    maize:       pt.maize       ?? 0,
    greengrams:  pt.greengrams  ?? 0,
    isForecast:  pt.f === true,
    isToday:     !pt.f && pt.month === todayMonth,
  }));
}

// ============================================================================
// SVG CHART DIMENSIONS — fixed aspect ratio so it never stretches
// ============================================================================
const VB_W = 560;   // viewBox width — narrower = less horizontal stretch
const VB_H = 200;
const PAD_L = 52;   // left padding for Y-axis labels
const PAD_R = 16;
const PAD_T = 18;
const PAD_B = 28;   // bottom padding for month labels
const CW = VB_W - PAD_L - PAD_R;
const CH = VB_H - PAD_T - PAD_B;

function scaleCoords(prices, timeline) {
  const minP = Math.min(...prices) * 0.92;
  const maxP = Math.max(...prices) * 1.06;
  return {
    minP, maxP,
    pts: prices.map((p, i) => ({
      x: PAD_L + (i / (timeline.length - 1)) * CW,
      y: PAD_T + CH - ((p - minP) / (maxP - minP)) * CH,
    })),
  };
}

function makePaths(pts, timeline) {
  let solid = "", dashed = "";
  pts.forEach((p, i) => {
    const cmd = `${p.x.toFixed(1)} ${p.y.toFixed(1)}`;
    if (i === 0) solid = `M ${cmd}`;
    else if (!timeline[i].isForecast) solid += ` L ${cmd}`;
    if (timeline[i].isForecast) {
      if (!dashed) { const pr = pts[i-1]; dashed = `M ${pr.x.toFixed(1)} ${pr.y.toFixed(1)} L ${cmd}`; }
      else dashed += ` L ${cmd}`;
    }
  });
  // Area fill under solid
  const lastActualIdx = timeline.findLastIndex(t => !t.isForecast);
  const lp = pts[lastActualIdx], fp = pts[0];
  const fill = solid + ` L ${lp.x.toFixed(1)} ${PAD_T + CH} L ${fp.x.toFixed(1)} ${PAD_T + CH} Z`;
  return { solid, dashed, fill };
}

// ============================================================================
// GRID LINES
// ============================================================================
function GridLines({ minP, maxP }) {
  const steps = [0, 0.25, 0.5, 0.75, 1];
  return steps.map((r, i) => {
    const y = PAD_T + r * CH;
    const val = Math.round(maxP - r * (maxP - minP));
    return (
      <g key={i}>
        <line x1={PAD_L} y1={y} x2={PAD_L + CW} y2={y}
          stroke="#d6cfc0" strokeWidth="0.8" strokeDasharray="3 6" />
        <text x={PAD_L - 4} y={y + 3.5}
          fill="#7a7260" fontSize="8.5" textAnchor="end" fontFamily="system-ui">
          {(val / 1000).toFixed(1)}k
        </text>
      </g>
    );
  });
}

// ============================================================================
// MONTH LABELS + TODAY MARKER
// ============================================================================
function MonthLabels({ pts, primaryColor, timeline }) {
  return timeline.map((pt, i) => {
    const x = pts[i].x;
    const isT = pt.isToday;
    return (
      <g key={i}>
        {/* TODAY vertical marker */}
        {isT && (
          <>
            <line x1={x} y1={PAD_T} x2={x} y2={PAD_T + CH}
              stroke={primaryColor} strokeWidth="1.2" strokeDasharray="2 3" opacity="0.4" />
            <rect x={x - 14} y={PAD_T + CH + 2} width="28" height="12"
              rx="3" fill={primaryColor} opacity="0.15" />
          </>
        )}
        <text x={x} y={VB_H - 4}
          fill={isT ? primaryColor : pt.isForecast ? "#1d6fa4" : "#7a7260"}
          fontSize={isT ? "9.5" : "9"}
          fontWeight={isT || pt.isForecast ? 700 : 400}
          textAnchor="middle" fontFamily="system-ui">
          {isT ? `${pt.month.toUpperCase()}●` : pt.month + (pt.isForecast ? "»" : "")}
        </text>
      </g>
    );
  });
}

// ============================================================================
// SINGLE CROP CHART
// ============================================================================
function SingleChart({ cropKey, color, hovered, setHovered, timeline }) {
  const prices = timeline.map(t => t[cropKey]);
  const { minP, maxP, pts } = scaleCoords(prices, timeline);
  const { solid, dashed, fill } = makePaths(pts, timeline);

  return (
    <svg
      width="100%" height="100%"
      viewBox={`0 0 ${VB_W} ${VB_H}`}
      preserveAspectRatio="xMidYMid meet"
      style={{ display: "block" }}
    >
      <defs>
        <linearGradient id={`grad-${cropKey}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.18" />
          <stop offset="100%" stopColor={color} stopOpacity="0.01" />
        </linearGradient>
      </defs>

      {/* Area */}
      <path d={fill} fill={`url(#grad-${cropKey})`} />

      {/* Grid */}
      <GridLines minP={minP} maxP={maxP} />

      {/* Bottom axis */}
      <line x1={PAD_L} y1={PAD_T + CH} x2={PAD_L + CW} y2={PAD_T + CH}
        stroke="#d6cfc0" strokeWidth="1" />

      {/* Lines */}
      <path d={solid} fill="none" stroke={color} strokeWidth="1.8"
        strokeLinecap="round" strokeLinejoin="round" />
      <path d={dashed} fill="none" stroke={color} strokeWidth="1.8"
        strokeDasharray="5 4" strokeLinecap="round" strokeLinejoin="round" />

      {/* Month labels */}
      <MonthLabels pts={pts} primaryColor={color} timeline={timeline} />

      {/* Data points */}
      {timeline.map((pt, i) => {
        const p = pts[i];
        const isH = hovered === i;
        const isPeak = cropKey === "maize" ? pt.month === "Aug" : pt.month === "Jul";
        const isT = pt.isToday;
        return (
          <g key={i}>
            {isH && <circle cx={p.x} cy={p.y} r="11" fill={color} opacity="0.1" />}
            {isPeak && !isH && (
              <circle cx={p.x} cy={p.y} r="8" fill="none"
                stroke={color} strokeWidth="1.5" opacity="0.45" strokeDasharray="2 2" />
            )}
            {isT && !isH && (
              <circle cx={p.x} cy={p.y} r="6" fill="none"
                stroke={color} strokeWidth="1.5" opacity="0.5" />
            )}
            <circle cx={p.x} cy={p.y}
              r={isPeak ? 4 : isT ? 4 : isH ? 3.8 : 2.8}
              fill={pt.isForecast ? "#ffffff" : color}
              stroke={color} strokeWidth="1.6" />

            {/* Hover tooltip above point */}
            {isH && (
              <>
                <rect x={p.x - 28} y={p.y - 28} width="56" height="18"
                  rx="4" fill={color} opacity="0.9" />
                <text x={p.x} y={p.y - 15}
                  fill="white" fontSize="9.5" fontWeight="700"
                  textAnchor="middle" fontFamily="system-ui">
                  {prices[i].toLocaleString()}
                </text>
              </>
            )}

            <rect
              x={p.x - CW / timeline.length / 2} y={0}
              width={CW / timeline.length} height={VB_H}
              fill="transparent" style={{ cursor: "pointer" }}
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}
              onTouchStart={() => setHovered(i === hovered ? null : i)}
            />
          </g>
        );
      })}
    </svg>
  );
}

// ============================================================================
// DUAL CROP CHART (Both mode)
// ============================================================================
function DualChart({ hovered, setHovered, timeline }) {
  const allP = [...timeline.map(t => t.maize), ...timeline.map(t => t.greengrams)];
  const minP = Math.min(...allP) * 0.92;
  const maxP = Math.max(...allP) * 1.06;
  const coord = (price, i) => ({
    x: PAD_L + (i / (timeline.length - 1)) * CW,
    y: PAD_T + CH - ((price - minP) / (maxP - minP)) * CH,
  });
  const mPts = timeline.map((t, i) => coord(t.maize, i));
  const gPts = timeline.map((t, i) => coord(t.greengrams, i));

  const buildLP = (pts) => {
    let s = "", d = "";
    pts.forEach((p, i) => {
      const c = `${p.x.toFixed(1)} ${p.y.toFixed(1)}`;
      if (i === 0) s = `M ${c}`;
      else if (!timeline[i].isForecast) s += ` L ${c}`;
      if (timeline[i].isForecast) {
        if (!d) { const pr = pts[i-1]; d = `M ${pr.x.toFixed(1)} ${pr.y.toFixed(1)} L ${c}`; }
        else d += ` L ${c}`;
      }
    });
    return { s, d };
  };

  const { s: ms, d: md } = buildLP(mPts);
  const { s: gs, d: gd } = buildLP(gPts);
  const amber = T.amber; const green = T.accent;

  return (
    <svg width="100%" height="100%"
      viewBox={`0 0 ${VB_W} ${VB_H}`}
      preserveAspectRatio="xMidYMid meet"
      style={{ display: "block" }}
    >
      <GridLines minP={minP} maxP={maxP} />
      <line x1={PAD_L} y1={PAD_T + CH} x2={PAD_L + CW} y2={PAD_T + CH}
        stroke="#d6cfc0" strokeWidth="1" />

      {/* Maize */}
      <path d={ms} fill="none" stroke={amber} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <path d={md} fill="none" stroke={amber} strokeWidth="1.8" strokeDasharray="5 4" strokeLinecap="round" strokeLinejoin="round" />

      {/* Green Grams */}
      <path d={gs} fill="none" stroke={green} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <path d={gd} fill="none" stroke={green} strokeWidth="1.8" strokeDasharray="5 4" strokeLinecap="round" strokeLinejoin="round" />

      <MonthLabels pts={mPts} primaryColor={green} timeline={timeline} />

      {timeline.map((pt, i) => {
        const m = mPts[i]; const g = gPts[i];
        const isH = hovered === i;
        return (
          <g key={i}>
            {isH && <>
              <circle cx={m.x} cy={m.y} r="9" fill={amber} opacity="0.12" />
              <circle cx={g.x} cy={g.y} r="9" fill={green} opacity="0.12" />
              <line x1={m.x} y1={PAD_T} x2={m.x} y2={PAD_T + CH}
                stroke="#b0a48e" strokeWidth="1" strokeDasharray="3 3" />
              {/* Dual tooltip */}
              <rect x={m.x - 36} y={PAD_T - 2} width="72" height="30"
                rx="5" fill="#2d3b24" opacity="0.88" />
              <text x={m.x} y={PAD_T + 11}
                fill={amber} fontSize="8.5" fontWeight="700" textAnchor="middle" fontFamily="system-ui">
                🌽 {pt.maize.toLocaleString()}
              </text>
              <text x={m.x} y={PAD_T + 22}
                fill="#6fcf8a" fontSize="8.5" fontWeight="700" textAnchor="middle" fontFamily="system-ui">
                🫘 {pt.greengrams.toLocaleString()}
              </text>
            </>}
            <circle cx={m.x} cy={m.y} r={isH ? 3.8 : 2.8}
              fill={pt.isForecast ? "#fff" : amber} stroke={amber} strokeWidth="1.6" />
            <circle cx={g.x} cy={g.y} r={isH ? 3.8 : 2.8}
              fill={pt.isForecast ? "#fff" : green} stroke={green} strokeWidth="1.6" />
            <rect x={m.x - CW / timeline.length / 2} y={0}
              width={CW / timeline.length} height={VB_H}
              fill="transparent" style={{ cursor: "pointer" }}
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}
              onTouchStart={() => setHovered(i === hovered ? null : i)}
            />
          </g>
        );
      })}
    </svg>
  );
}

// ============================================================================
// MAIN PAGE COMPONENT
// ============================================================================
export default function MarketIntelligence({ crop = "Maize", county = "Machakos", language = "en", intelligenceData, loadingML, mlError, onRefresh }) {
  const [bags, setBags] = useState(20);
  const [hovered, setHovered] = useState(null);

  const Tr = L10N[language] || L10N.en;
  const isBoth   = crop === "Both";
  const isMaize  = !isBoth && (crop === "Maize" || crop.toLowerCase() === "maize");

  // ── BUILD LIVE TIMELINE ──────────────────────────────────────────────────
  const timeline = buildTimeline(intelligenceData);

  // ── DERIVE PRICES FROM LIVE DATA (fall back to hardcoded if API is offline) ──
  const todayPoint  = timeline.find(t => t.isToday)  || timeline[timeline.length - 4];
  const peakMaize   = [...timeline].sort((a, b) => (b.maize ?? 0)       - (a.maize ?? 0))[0];
  const peakGrams   = [...timeline].sort((a, b) => (b.greengrams ?? 0)  - (a.greengrams ?? 0))[0];

  const maizeCurrent = todayPoint?.maize       ?? 4100;
  const gramsCurrent = todayPoint?.greengrams  ?? 10500;
  const maizePeakVal = peakMaize?.maize        ?? 4400;
  const gramsPeakVal = peakGrams?.greengrams   ?? 11200;
  const maizePeakMonth  = peakMaize?.month ?? "Aug";
  const gramsPeakMonth  = peakGrams?.month ?? "Jul";

  const currentPrice = isMaize ? maizeCurrent : gramsCurrent;
  const peakPrice    = isMaize ? maizePeakVal : gramsPeakVal;
  const variancePct  = ((peakPrice - currentPrice) / currentPrice) * 100;

  // Per-crop gain = (peak - current) × bags. In Both mode show each crop separately.
  const maizeGainPerBag  = maizePeakVal - maizeCurrent;
  const gramsGainPerBag  = gramsPeakVal - gramsCurrent;
  const projectedProfit  = isBoth
    ? (maizeGainPerBag + gramsGainPerBag) * bags   // combined gain across both crops
    : (peakPrice - currentPrice) * bags;

  const maizeVariancePct = ((maizePeakVal - maizeCurrent) / maizeCurrent * 100).toFixed(1);
  const gramsVariancePct = ((gramsPeakVal - gramsCurrent) / gramsCurrent * 100).toFixed(1);

  const isHoldMaize = maizeGainPerBag / maizeCurrent * 100 > 4;
  const isHoldGrams = gramsGainPerBag / gramsCurrent * 100 > 4;
  const isHold = isBoth ? (isHoldMaize || isHoldGrams) : variancePct > 4;

  const primaryColor = isBoth ? T.accent : (isMaize ? T.amber : T.accent);
  const cropKey = isMaize ? "maize" : "greengrams";

  const peakMonth = isBoth
    ? `${maizePeakMonth} / ${gramsPeakMonth}`
    : (isMaize ? maizePeakMonth : gramsPeakMonth);

  // ── DETERMINE CURRENT MONTH LABEL FOR STATIC TEXT ───────────────────────
  const todayLabel = intelligenceData?.today_month
    ? `${intelligenceData.today_month} ${intelligenceData.today_year ?? ""}`
    : Tr.currentMonth;

  const adviceText = isBoth
    ? Tr.bothAdvice
    : (isMaize ? Tr.maizeAdvice : Tr.greenGramsAdvice)
        .replace("{current}", currentPrice.toLocaleString())
        .replace("{peak}", peakPrice.toLocaleString());

  const cropLabel = isBoth ? Tr.bothLabel : (isMaize ? Tr.maizeLabel : Tr.greenGramsLabel);

  // Refresh button triggers a real API re-fetch via onRefresh prop
  const triggerRefresh = () => {
    if (onRefresh) onRefresh();
  };

  // ── UI ────────────────────────────────────────────────────────────────────
  return (
    <div style={{
      padding: "14px 14px 20px",
      display: "flex", flexDirection: "column", gap: "12px",
      background: T.bg, fontFamily: "system-ui, -apple-system, sans-serif",
      color: T.text,
    }}>

      {/* ── STATUS ROW ─────────────────────────────────────────────────── */}
      <div style={{
        display: "flex", justifyContent: "space-between", alignItems: "center",
        background: T.surface, padding: "10px 16px",
        borderRadius: "12px", border: `1px solid ${T.border}`,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <Sparkles size={13} color={T.accent} />
          <span style={{ fontSize: "13px", fontWeight: 800, color: T.textBright }}>{Tr.title}</span>
          <span style={{ fontSize: "11px", color: T.textDim }}>· {county} {Tr.county}</span>
          <span style={{
            fontSize: "10px", fontWeight: 700, color: T.accent,
            background: `${T.accent}12`, padding: "2px 8px",
            borderRadius: "20px", border: `1px solid ${T.accent}20`,
          }}>{Tr.live}</span>
        </div>
        <button onClick={triggerRefresh} style={{
          background: "transparent", border: `1px solid ${T.border}`,
          color: T.textDim, borderRadius: "8px", padding: "5px 10px",
          fontSize: "11px", cursor: "pointer",
          display: "flex", alignItems: "center", gap: "5px",
          transition: "border-color 0.15s",
        }}>
          <RefreshCw size={11} style={{ animation: loadingML ? "spin 0.7s linear infinite" : "none" }} />
          {Tr.refresh}
        </button>
      </div>

      {/* ── TOP METRIC CARDS ───────────────────────────────────────────── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "10px" }}>

        {/* Directive card */}
        <div style={{
          background: isHold ? T.surfaceGreen : T.surfaceAmber,
          padding: "14px 16px", borderRadius: "14px",
          border: `1px solid ${isHold ? "transparent" : T.amber + "50"}`,
          display: "flex", flexDirection: "column", gap: "5px",
          position: "relative", overflow: "hidden",
        }}>
          <span style={{ fontSize: "10px", fontWeight: 800, textTransform: "uppercase",
            letterSpacing: "0.07em", color: isHold ? "rgba(255,255,255,0.6)" : T.amber }}>
            {Tr.directive}
          </span>
          {isBoth ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "6px", marginTop: "2px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <span style={{ fontSize: "13px" }}>🌽</span>
                <span style={{ fontSize: "15px", fontWeight: 900, color: isHoldMaize ? "#fff" : T.amber, lineHeight: 1 }}>
                  {isHoldMaize ? Tr.holdDirective : Tr.sellDirective}
                </span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <span style={{ fontSize: "13px" }}>🫘</span>
                <span style={{ fontSize: "15px", fontWeight: 900, color: isHoldGrams ? "#fff" : T.amber, lineHeight: 1 }}>
                  {isHoldGrams ? Tr.holdDirective : Tr.sellDirective}
                </span>
              </div>
            </div>
          ) : (
            <>
              <div style={{ fontSize: "20px", fontWeight: 900, color: isHold ? "#fff" : T.amber,
                letterSpacing: "-0.3px", lineHeight: 1.1 }}>
                {isHold ? Tr.holdDirective : Tr.sellDirective}
              </div>
              <span style={{ fontSize: "11px", lineHeight: 1.4,
                color: isHold ? "rgba(255,255,255,0.65)" : T.textDim }}>
                {isHold ? Tr.holdReason : Tr.sellReason}
              </span>
            </>
          )}
          <span style={{ position: "absolute", right: "10px", bottom: "6px",
            fontSize: "28px", opacity: 0.15 }}>
            {isBoth ? "🌾" : isMaize ? "🌽" : "🫘"}
          </span>
        </div>

        {/* Current vs Peak */}
        <div style={{
          background: T.surfaceGreenLight, padding: "14px 16px",
          borderRadius: "14px", border: `1px solid ${T.accent}20`,
          display: "flex", flexDirection: "column", gap: "4px",
        }}>
          <span style={{ fontSize: "10px", fontWeight: 800, textTransform: "uppercase",
            letterSpacing: "0.07em", color: T.accent }}>{Tr.currentVsPeak}</span>
          {isBoth ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "6px", marginTop: "4px" }}>
              {/* Maize row */}
              <div>
                <div style={{ fontSize: "10px", color: T.amber, fontWeight: 700, marginBottom: "2px" }}>🌽 {Tr.maizeLabel}</div>
                <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                  <span style={{ fontSize: "13px", fontWeight: 800, color: T.textBright }}>KSh {maizeCurrent.toLocaleString()}</span>
                  <TrendingUp size={10} color={T.amber} />
                  <span style={{ fontSize: "13px", fontWeight: 800, color: T.amber }}>KSh {maizePeakVal.toLocaleString()}</span>
                  <span style={{ fontSize: "10px", color: T.textDim }}>▲{maizeVariancePct}%</span>
                </div>
              </div>
              {/* Green grams row */}
              <div>
                <div style={{ fontSize: "10px", color: T.accent, fontWeight: 700, marginBottom: "2px" }}>🫘 {Tr.greenGramsLabel}</div>
                <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                  <span style={{ fontSize: "13px", fontWeight: 800, color: T.textBright }}>KSh {gramsCurrent.toLocaleString()}</span>
                  <TrendingUp size={10} color={T.accent} />
                  <span style={{ fontSize: "13px", fontWeight: 800, color: T.accent }}>KSh {gramsPeakVal.toLocaleString()}</span>
                  <span style={{ fontSize: "10px", color: T.textDim }}>▲{gramsVariancePct}%</span>
                </div>
              </div>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "2px", marginTop: "4px" }}>
              <div style={{ fontSize: "15px", fontWeight: 800, color: T.textBright }}>
                KSh {currentPrice.toLocaleString()}
                <span style={{ color: T.textDim, fontWeight: 400, fontSize: "12px" }}> now</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                <TrendingUp size={12} color={T.accent} />
                <span style={{ fontSize: "15px", fontWeight: 800, color: T.accent }}>
                  KSh {peakPrice.toLocaleString()}
                </span>
                <span style={{ fontSize: "10px", color: T.textDim }}>by {peakMonth}</span>
              </div>
              <span style={{ fontSize: "10px", color: T.textDim, marginTop: "2px" }}>
                ▲ {variancePct.toFixed(1)}% · {Tr.perBag}
              </span>
            </div>
          )}
        </div>

        {/* Projected gain — dark green */}
        <div style={{
          background: T.surfaceGreen, padding: "14px 16px",
          borderRadius: "14px",
          display: "flex", flexDirection: "column", gap: "4px",
        }}>
          <span style={{ fontSize: "10px", fontWeight: 800, textTransform: "uppercase",
            letterSpacing: "0.07em", color: "rgba(255,255,255,0.6)" }}>{Tr.projectedProfit}</span>
          <div style={{ fontSize: "22px", fontWeight: 900, color: "#fff", marginTop: "4px" }}>
            KSh {projectedProfit.toLocaleString()}
          </div>
          {isBoth && (
            <div style={{ display: "flex", flexDirection: "column", gap: "2px", marginTop: "2px" }}>
              <span style={{ fontSize: "10px", color: "rgba(255,255,255,0.55)" }}>
                🌽 +KSh {maizeGainPerBag.toLocaleString()}/bag · 🫘 +KSh {gramsGainPerBag.toLocaleString()}/bag
              </span>
              <span style={{ fontSize: "10px", color: "rgba(255,255,255,0.45)" }}>
                combined gain × {bags} bags
              </span>
            </div>
          )}
          <div style={{ display: "flex", alignItems: "center", gap: "6px", marginTop: "4px", flexWrap: "wrap" }}>
            <span style={{ fontSize: "10px", color: "rgba(255,255,255,0.6)" }}>{Tr.ifYouHold}</span>
            <input type="number" min={1} value={bags}
              onChange={e => setBags(Math.max(1, parseInt(e.target.value) || 1))}
              style={{
                width: "40px", background: "rgba(255,255,255,0.18)",
                border: "1px solid rgba(255,255,255,0.3)", borderRadius: "6px",
                padding: "2px 4px", color: "#fff", fontSize: "12px",
                fontWeight: 700, outline: "none", textAlign: "center",
              }}
            />
            <span style={{ fontSize: "10px", color: "rgba(255,255,255,0.6)" }}>{Tr.bagsLabel}</span>
          </div>
        </div>
      </div>

      {/* ── CHART + ADVISORY SIDE BY SIDE ──────────────────────────────── */}
      {/* Chart ~55%, advisory ~45%. On narrow screens wraps vertically. */}
      <div style={{
        display: "flex", gap: "12px",
        alignItems: "stretch",
        flexWrap: "wrap",
      }}>

        {/* LEFT: Chart card — grows to ~55% of the row */}
        <div style={{
          flex: "3 1 260px",
          background: T.surface, padding: "14px",
          borderRadius: "14px", border: `1px solid ${T.border}`,
          display: "flex", flexDirection: "column", gap: "8px",
          minWidth: 0,
        }}>
          {/* Chart header */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: "12px", fontWeight: 800, color: T.textBright }}>
              📈  {cropLabel} — {Tr.chartTitle}
            </span>
            {isBoth && (
              <div style={{ display: "flex", gap: "5px" }}>
                <span style={{ fontSize: "10px", color: T.amber, fontWeight: 700,
                  background: `${T.amber}15`, padding: "2px 7px",
                  borderRadius: "8px", border: `1px solid ${T.amber}25` }}>
                  🌽 {Tr.maizeLabel}
                </span>
                <span style={{ fontSize: "10px", color: T.accent, fontWeight: 700,
                  background: `${T.accent}12`, padding: "2px 7px",
                  borderRadius: "8px", border: `1px solid ${T.accent}20` }}>
                  🫘 {Tr.greenGramsLabel}
                </span>
              </div>
            )}
          </div>

          {/* Legend row */}
          <div style={{ display: "flex", gap: "14px", alignItems: "center" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
              <svg width="20" height="6"><line x1="0" y1="3" x2="20" y2="3"
                stroke={primaryColor} strokeWidth="1.8" strokeLinecap="round" /></svg>
              <span style={{ fontSize: "10px", color: T.textDim }}>{Tr.actual}</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
              <svg width="20" height="6"><line x1="0" y1="3" x2="20" y2="3"
                stroke={primaryColor} strokeWidth="1.8" strokeLinecap="round"
                strokeDasharray="4 3" /></svg>
              <span style={{ fontSize: "10px", color: T.textDim }}>{Tr.forecast} (Jul–Aug)</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
              <span style={{ fontSize: "9px", fontWeight: 700,
                color: primaryColor, background: `${primaryColor}15`,
                padding: "1px 5px", borderRadius: "4px",
                border: `1px solid ${primaryColor}25` }}>JUN●</span>
              <span style={{ fontSize: "10px", color: T.textDim }}>{Tr.today}</span>
            </div>
          </div>

          {/* SVG container — tighter aspect ratio, proportionate height */}
          <div style={{
            width: "100%",
            aspectRatio: "3.2 / 1",
            background: T.bg,
            borderRadius: "8px",
            border: `1px solid ${T.border}`,
            overflow: "hidden",
            position: "relative",
          }}>
            {isBoth
              ? <DualChart hovered={hovered} setHovered={setHovered} timeline={timeline} />
              : <SingleChart cropKey={cropKey} color={primaryColor}
                  hovered={hovered} setHovered={setHovered} timeline={timeline} />
            }
          </div>

          <div style={{ fontSize: "10px", color: T.textDim, lineHeight: 1.5 }}>
            {Tr.footnote}
          </div>
        </div>

        {/* RIGHT: Advisory panel — grows to ~45% of the row */}
        <div style={{
          flex: "2 1 200px",
          background: T.surfaceGreenLight,
          padding: "14px", borderRadius: "14px",
          border: `1px solid ${T.accent}20`,
          display: "flex", flexDirection: "column", gap: "10px",
          minWidth: "180px",
        }}>
          <h3 style={{
            margin: 0, fontSize: "11px", fontWeight: 800,
            textTransform: "uppercase", letterSpacing: "0.07em",
            color: T.accent, display: "flex", alignItems: "center", gap: "5px",
          }}>
            <ShieldAlert size={13} color={T.accent} />
            {Tr.advisoryTitle}
          </h3>

          {/* Main advice */}
          <div style={{
            background: T.surface, padding: "12px 14px",
            borderRadius: "10px", border: `1px solid ${T.border}`,
            borderLeft: `4px solid ${isHold ? T.accent : T.amber}`,
            fontSize: "12px", color: T.text, lineHeight: 1.7,
          }}>
            {adviceText}
          </div>

          {/* Crop strategy cards */}
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {/* Maize */}
            <div style={{
              background: T.surface, padding: "10px 12px",
              borderRadius: "10px", border: `1px solid ${T.border}`,
              borderLeft: `3px solid ${T.amber}`,
              opacity: (!isBoth && !isMaize) ? 0.45 : 1,
              transition: "opacity 0.2s",
            }}>
              <div style={{ fontSize: "11px", fontWeight: 800, color: T.amber, marginBottom: "3px" }}>
                {Tr.maizeStrategy}
              </div>
              <div style={{ fontSize: "11px", color: T.textDim, lineHeight: 1.55 }}>
                {Tr.maizeDesc}
              </div>
            </div>

            {/* Green Grams */}
            <div style={{
              background: T.surface, padding: "10px 12px",
              borderRadius: "10px", border: `1px solid ${T.border}`,
              borderLeft: `3px solid ${T.accent}`,
              opacity: (!isBoth && isMaize) ? 0.45 : 1,
              transition: "opacity 0.2s",
            }}>
              <div style={{ fontSize: "11px", fontWeight: 800, color: T.accent, marginBottom: "3px" }}>
                {Tr.greenGramsStrategy}
              </div>
              <div style={{ fontSize: "11px", color: T.textDim, lineHeight: 1.55 }}>
                {Tr.greenGramsDesc}
              </div>
            </div>
          </div>

          {/* Peak timing badge */}
          <div style={{
            background: T.surfaceGreen, padding: "10px 12px",
            borderRadius: "10px", display: "flex", alignItems: "center", gap: "8px",
          }}>
            <Package size={14} color="rgba(255,255,255,0.8)" />
            <div>
              <div style={{ fontSize: "10px", color: "rgba(255,255,255,0.65)", fontWeight: 700,
                textTransform: "uppercase", letterSpacing: "0.06em" }}>
                {Tr.peakMonth}
              </div>
              <div style={{ fontSize: "13px", fontWeight: 900, color: "#fff" }}>
                {isBoth
                  ? `${Tr.maizeLabel} Aug · ${Tr.greenGramsLabel} Jul`
                  : `${isMaize ? "August 2026" : "July 2026"}`}
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}